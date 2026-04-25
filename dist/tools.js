#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readFileSync, readlinkSync, readdirSync, statSync, writeFileSync, } from 'node:fs';
import { basename, dirname, relative, resolve, join, sep } from 'node:path';
import minimist from 'minimist';
import matter from 'gray-matter';
import { globSync } from 'glob';
import { loadKbConfig } from './lib/kbConfig.js';
import { embedText, cosine } from './lib/embeddings.js';
import { installSkill } from './commands/installSkill.js';
import { listSkillDirs, readSkillInfo } from './lib/skills.js';
import { buildGraph, saveGraph, loadGraph, queryGraph, getCallers, getCallees, impactAnalysis } from './lib/graph.js';
function readText(path) {
    return readFileSync(path, 'utf8');
}
function collectMarkdownFiles(base) {
    return globSync('**/*.md', { cwd: base, absolute: true, nodir: true }).sort();
}
function chunkText(text, size, overlap) {
    const clean = text.replace(/\r\n/g, '\n').trim();
    if (!clean)
        return [];
    if (clean.length <= size)
        return [clean];
    const out = [];
    let i = 0;
    while (i < clean.length) {
        const end = Math.min(clean.length, i + size);
        out.push(clean.slice(i, end).trim());
        if (end >= clean.length)
            break;
        i = Math.max(0, end - overlap);
    }
    return out;
}
const INDEX_PROJECT_DEFAULT_INCLUDE = '**/*.md,**/*.ts,**/*.tsx,**/*.js,**/*.jsx,**/*.mjs,**/*.cjs,**/*.py,**/*.go,**/*.java,**/*.rs,**/*.json,**/*.yaml,**/*.yml,**/*.toml';
const INDEX_PROJECT_IGNORE = [
    '**/node_modules/**',
    '**/.git/**',
    '**/.venv/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/coverage/**',
    '**/.agents/devkit/project-index/**',
];
const INDEX_PROJECT_MAX_FILE_BYTES = 1024 * 1024;
function isLikelyBinaryBuffer(buf) {
    const n = Math.min(512, buf.length);
    for (let i = 0; i < n; i++)
        if (buf[i] === 0)
            return true;
    return false;
}
function cmdIndexProject(args) {
    const targetDir = resolve(String(args.dir || args.d || '.'));
    const outDir = resolve(String(args.out || join(targetDir, '.agents', 'devkit', 'project-index')));
    const includes = String(args.include || INDEX_PROJECT_DEFAULT_INCLUDE)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    const size = Number(args['chunk-size'] || 800);
    const overlap = Number(args['chunk-overlap'] || 150);
    const dry = Boolean(args['dry-run']);
    const fileSet = new Set();
    for (const pattern of includes) {
        const matches = globSync(pattern, {
            cwd: targetDir,
            absolute: true,
            nodir: true,
            ignore: INDEX_PROJECT_IGNORE,
        });
        for (const f of matches)
            fileSet.add(f);
    }
    const files = [...fileSet].sort();
    const manifest = [];
    const vectors = [];
    let chunkSeq = 0;
    let skippedBinary = 0;
    let skippedLarge = 0;
    for (const absPath of files) {
        const st = statSync(absPath, { throwIfNoEntry: false });
        if (!st?.isFile())
            continue;
        if (st.size > INDEX_PROJECT_MAX_FILE_BYTES) {
            skippedLarge++;
            continue;
        }
        const buf = readFileSync(absPath);
        if (isLikelyBinaryBuffer(buf)) {
            skippedBinary++;
            continue;
        }
        let text;
        try {
            text = buf.toString('utf8');
        }
        catch {
            skippedBinary++;
            continue;
        }
        const rel = relative(targetDir, absPath).replace(/\\/g, '/');
        const isMd = rel.endsWith('.md') || /\.md$/i.test(absPath);
        if (isMd) {
            const p = matter(text);
            const chunks = chunkText(p.content || '', size, overlap);
            const title = typeof p.data.title === 'string' ? p.data.title : undefined;
            chunks.forEach((c, i) => {
                const id = `chunk_${chunkSeq++}`;
                manifest.push({ id, path: rel, title, chunk_index: i, text: c });
                vectors.push(embedText(c));
            });
        }
        else {
            const body = `# file: ${rel}\n\n${text}`;
            const chunks = chunkText(body, size, overlap);
            chunks.forEach((c, i) => {
                const id = `chunk_${chunkSeq++}`;
                manifest.push({ id, path: rel, chunk_index: i, text: c });
                vectors.push(embedText(c));
            });
        }
    }
    if (dry) {
        console.log(`Would index ${files.length} files -> ${manifest.length} chunks (skipped binary=${skippedBinary}, skipped large=${skippedLarge})`);
        return;
    }
    mkdirSync(outDir, { recursive: true });
    const embPath = join(outDir, 'embeddings.json');
    const manifestPath = join(outDir, 'manifest.json');
    writeFileSync(embPath, `${JSON.stringify(vectors)}\n`, 'utf8');
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(`Wrote project index under ${outDir} (${vectors.length} vectors from ${files.length} files; skipped binary=${skippedBinary}, large=${skippedLarge})`);
}
function escapeHtmlWiki(s) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
/** Turn relative `*.md` links into `*.html` for static wiki navigation. */
function normalizeWikiMdToHtmlHref(url) {
    const u = url.trim();
    if (/^https?:\/\//i.test(u) || /^mailto:/i.test(u))
        return u;
    return u.replace(/\.md(?=$|[#?])/gi, '.html');
}
/** Block dangerous URL schemes in wiki links. */
function safeWikiHref(url) {
    const u = url.trim();
    if (/^javascript:/i.test(u) || /^data:/i.test(u) || /^vbscript:/i.test(u))
        return null;
    return escapeHtmlWiki(normalizeWikiMdToHtmlHref(u));
}
/** Parse `[label](url)` starting at `start` (must be `[`). Returns end index and HTML, or null. */
function parseMdLinkWiki(line, start) {
    if (line[start] !== '[')
        return null;
    const labelEnd = line.indexOf(']', start + 1);
    if (labelEnd < 0)
        return null;
    if (line[labelEnd + 1] !== '(')
        return null;
    const urlStart = labelEnd + 2;
    const urlEnd = line.indexOf(')', urlStart);
    if (urlEnd < 0)
        return null;
    const label = line.slice(start + 1, labelEnd);
    const url = line.slice(urlStart, urlEnd);
    const safe = safeWikiHref(url);
    if (safe === null) {
        return {
            end: urlEnd + 1,
            html: escapeHtmlWiki(line.slice(start, urlEnd + 1)),
        };
    }
    return {
        end: urlEnd + 1,
        html: `<a href="${safe}" rel="noopener noreferrer">${inlineMdToHtmlWikiNoLinks(label)}</a>`,
    };
}
/** Inline Markdown without links (for link labels). */
function inlineMdToHtmlWikiNoLinks(line) {
    let idx = 0;
    let out = '';
    while (idx < line.length) {
        const tick = line.indexOf('`', idx);
        const star = line.indexOf('**', idx);
        const useTick = tick >= 0 && (star < 0 || tick < star);
        if (useTick) {
            out += escapeHtmlWiki(line.slice(idx, tick));
            const end = line.indexOf('`', tick + 1);
            if (end < 0) {
                out += escapeHtmlWiki(line.slice(tick));
                break;
            }
            out += '<code>' + escapeHtmlWiki(line.slice(tick + 1, end)) + '</code>';
            idx = end + 1;
        }
        else if (star >= 0) {
            out += escapeHtmlWiki(line.slice(idx, star));
            const end = line.indexOf('**', star + 2);
            if (end < 0) {
                out += escapeHtmlWiki(line.slice(star));
                break;
            }
            out += '<strong>' + escapeHtmlWiki(line.slice(star + 2, end)) + '</strong>';
            idx = end + 2;
        }
        else {
            out += escapeHtmlWiki(line.slice(idx));
            break;
        }
    }
    return out;
}
/** Minimal inline Markdown: `code`, **bold**, [text](url). */
function inlineMdToHtmlWiki(line) {
    let idx = 0;
    let out = '';
    while (idx < line.length) {
        const tick = line.indexOf('`', idx);
        const star = line.indexOf('**', idx);
        const bracket = line.indexOf('[', idx);
        const candidates = [];
        if (tick >= 0)
            candidates.push({ pos: tick, kind: 'tick' });
        if (star >= 0)
            candidates.push({ pos: star, kind: 'star' });
        if (bracket >= 0)
            candidates.push({ pos: bracket, kind: 'bracket' });
        candidates.sort((a, b) => a.pos - b.pos);
        const first = candidates[0];
        if (!first) {
            out += escapeHtmlWiki(line.slice(idx));
            break;
        }
        out += escapeHtmlWiki(line.slice(idx, first.pos));
        if (first.kind === 'tick') {
            const end = line.indexOf('`', first.pos + 1);
            if (end < 0) {
                out += escapeHtmlWiki(line.slice(first.pos));
                break;
            }
            out += '<code>' + escapeHtmlWiki(line.slice(first.pos + 1, end)) + '</code>';
            idx = end + 1;
        }
        else if (first.kind === 'star') {
            const end = line.indexOf('**', first.pos + 2);
            if (end < 0) {
                out += escapeHtmlWiki(line.slice(first.pos));
                break;
            }
            out += '<strong>' + escapeHtmlWiki(line.slice(first.pos + 2, end)) + '</strong>';
            idx = end + 2;
        }
        else {
            const link = parseMdLinkWiki(line, first.pos);
            if (link) {
                out += link.html;
                idx = link.end;
            }
            else {
                out += escapeHtmlWiki(line[first.pos] ?? '');
                idx = first.pos + 1;
            }
        }
    }
    return out;
}
function splitMarkdownTableRow(line) {
    let s = line.trim();
    if (s.startsWith('|'))
        s = s.slice(1);
    if (s.endsWith('|'))
        s = s.slice(0, -1);
    return s.split('|').map((c) => c.trim());
}
function isMarkdownTableSeparatorRow(line) {
    const cells = splitMarkdownTableRow(line);
    if (cells.length < 2)
        return false;
    return cells.every((c) => {
        const x = c.replace(/\s/g, '');
        return /^:?-{3,}:?$/.test(x);
    });
}
/** GitHub-style pipe table; `next` is index after last table row. */
function tryParseMarkdownTable(lines, start) {
    const row0 = lines[start];
    if (!row0?.includes('|'))
        return null;
    const head = splitMarkdownTableRow(row0);
    if (head.length < 2)
        return null;
    const sepLine = lines[start + 1];
    if (!sepLine || !isMarkdownTableSeparatorRow(sepLine))
        return null;
    const body = [];
    let j = start + 2;
    while (j < lines.length) {
        const ln = lines[j] ?? '';
        if (ln.trim() === '')
            break;
        if (!ln.includes('|'))
            break;
        body.push(splitMarkdownTableRow(ln));
        j++;
    }
    const cols = head.length;
    let html = '<table><thead><tr>';
    for (let c = 0; c < cols; c++) {
        html += `<th>${inlineMdToHtmlWiki(head[c] ?? '')}</th>`;
    }
    html += '</tr></thead><tbody>';
    for (const row of body) {
        html += '<tr>';
        for (let c = 0; c < cols; c++) {
            html += `<td>${inlineMdToHtmlWiki(row[c] ?? '')}</td>`;
        }
        html += '</tr>';
    }
    html += '</tbody></table>';
    return { html, next: j };
}
function mdBodyToHtmlWiki(md) {
    const lines = md.replace(/\r\n/g, '\n').split('\n');
    const blocks = [];
    let i = 0;
    let inCode = false;
    const codeBuf = [];
    const flushPara = (para) => {
        if (para.length === 0)
            return;
        const text = para.join(' ').trim();
        if (!text)
            return;
        blocks.push(`<p>${inlineMdToHtmlWiki(text)}</p>`);
        para.length = 0;
    };
    let para = [];
    while (i < lines.length) {
        const line = lines[i] ?? '';
        if (line.trim().startsWith('```')) {
            flushPara(para);
            if (inCode) {
                blocks.push(`<pre><code>${escapeHtmlWiki(codeBuf.join('\n'))}</code></pre>`);
                codeBuf.length = 0;
                inCode = false;
            }
            else {
                inCode = true;
            }
            i++;
            continue;
        }
        if (inCode) {
            codeBuf.push(line);
            i++;
            continue;
        }
        const hm = line.match(/^(#{1,6})\s+(.*)$/);
        if (hm) {
            flushPara(para);
            const level = hm[1].length;
            blocks.push(`<h${level}>${inlineMdToHtmlWiki(hm[2])}</h${level}>`);
            i++;
            continue;
        }
        if (line.trim() === '') {
            flushPara(para);
            i++;
            continue;
        }
        const table = tryParseMarkdownTable(lines, i);
        if (table) {
            flushPara(para);
            blocks.push(table.html);
            i = table.next;
            continue;
        }
        if (/^\s*[-*]\s+/.test(line)) {
            flushPara(para);
            const items = [];
            while (i < lines.length && /^\s*[-*]\s+/.test(lines[i] ?? '')) {
                const raw = (lines[i] ?? '').replace(/^\s*[-*]\s+/, '');
                items.push(`<li>${inlineMdToHtmlWiki(raw.trim())}</li>`);
                i++;
            }
            blocks.push(`<ul>${items.join('')}</ul>`);
            continue;
        }
        if (/^\s*\d+\.\s+/.test(line)) {
            flushPara(para);
            const items = [];
            while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i] ?? '')) {
                const raw = (lines[i] ?? '').replace(/^\s*\d+\.\s+/, '');
                items.push(`<li>${inlineMdToHtmlWiki(raw.trim())}</li>`);
                i++;
            }
            blocks.push(`<ol>${items.join('')}</ol>`);
            continue;
        }
        para.push(line.trimEnd());
        i++;
    }
    flushPara(para);
    return blocks.join('\n');
}
function wikiRelUrl(outDir, fromHtmlRel, toHtmlRel) {
    const fromAbs = join(outDir, fromHtmlRel);
    const toAbs = join(outDir, toHtmlRel);
    let r = relative(dirname(fromAbs), toAbs).replace(/\\/g, '/');
    if (r === '')
        r = basename(toHtmlRel);
    return r;
}
function wikiNavHtml(outDir, currentHtmlRel, mdRelPaths) {
    const toHtml = (mdRel) => mdRel.replace(/\.md$/i, '.html');
    const links = [];
    const homeTarget = 'index.html';
    const homeCls = currentHtmlRel === homeTarget ? ' class="active"' : '';
    links.push(`<a href="${escapeHtmlWiki(wikiRelUrl(outDir, currentHtmlRel, homeTarget))}"${homeCls}>Home</a>`);
    for (const rel of mdRelPaths) {
        const target = toHtml(rel);
        const cls = currentHtmlRel === target ? ' class="active"' : '';
        links.push(`<a href="${escapeHtmlWiki(wikiRelUrl(outDir, currentHtmlRel, target))}"${cls}>${escapeHtmlWiki(rel.replace(/\.md$/i, ''))}</a>`);
    }
    const search = `<div class="wiki-search"><label for="wiki-q">Search</label><input type="search" id="wiki-q" placeholder="Filter pages…" autocomplete="off" /><ul id="wiki-q-results" class="wiki-search-results" hidden></ul></div>`;
    return `${links.join('\n')}\n${search}`;
}
const WIKI_PAGE_STYLE = `
body{font-family:system-ui,-apple-system,sans-serif;margin:0;display:flex;min-height:100vh;}
nav{width:min(280px,32vw);border-right:1px solid #ccc;padding:1rem 0.75rem;flex-shrink:0;background:#f8f9fa;}
nav a{display:block;padding:0.2rem 0.4rem;margin:0.1rem 0;color:#0b57d0;text-decoration:none;border-radius:4px;font-size:0.9rem;word-break:break-word;}
nav a:hover{background:#e8eef9;}
nav a.active{font-weight:600;background:#dce6f8;color:#041e49;}
nav .wiki-search{margin-top:1rem;padding-top:0.75rem;border-top:1px solid #ccc;}
nav .wiki-search label{display:block;font-size:0.75rem;margin-bottom:0.25rem;color:#444;}
nav .wiki-search input{width:100%;box-sizing:border-box;padding:0.35rem;border:1px solid #ccc;border-radius:4px;font-size:0.85rem;}
nav .wiki-search-results{list-style:none;padding:0;margin:0.35rem 0 0;max-height:14rem;overflow:auto;font-size:0.82rem;}
nav .wiki-search-results li a{display:block;padding:0.2rem 0.25rem;border-radius:4px;}
nav .wiki-search-results li a:hover{background:#e8eef9;}
main{flex:1;padding:1.25rem 1.5rem;max-width:52rem;line-height:1.55;}
main pre{background:#f4f4f4;padding:0.75rem;overflow:auto;border-radius:6px;}
main code{font-size:0.9em;}
main h1{font-size:1.5rem;margin-top:0;}
main h2{font-size:1.2rem;margin-top:1.25rem;}
main a{color:#0b57d0;}
main table{border-collapse:collapse;margin:1rem 0;width:100%;font-size:0.95rem;}
main th,main td{border:1px solid #ccc;padding:0.4rem 0.55rem;text-align:left;vertical-align:top;}
main th{background:#eef1f4;}
@media (prefers-color-scheme:dark){
body{background:#1a1a1a;color:#e8eaed;}
nav{background:#252525;border-right-color:#3c4043;}
nav a{color:#8ab4f8;}
nav a:hover{background:#303134;}
nav a.active{background:#394457;color:#e8eaed;}
nav .wiki-search{border-top-color:#3c4043;}
nav .wiki-search label{color:#bdc1c6;}
nav .wiki-search input{background:#303134;border-color:#5f6368;color:#e8eaed;}
nav .wiki-search-results li a:hover{background:#303134;}
main pre{background:#303134;}
main a{color:#8ab4f8;}
main th,main td{border-color:#5f6368;}
main th{background:#303134;}
}
`;
function wikiWrapPage(title, navInner, bodyInner, footerScript) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtmlWiki(title)}</title>
<style>${WIKI_PAGE_STYLE}</style>
</head>
<body>
<nav>${navInner}</nav>
<main>
${bodyInner}
</main>
${footerScript}
</body>
</html>
`;
}
function wikiSearchExcerpt(markdown) {
    let s = markdown.replace(/```[\s\S]*?```/g, ' ');
    s = s.replace(/^#{1,6}\s+/gm, ' ');
    s = s.replace(/\[[^\]]*\]\([^)]*\)/g, ' ');
    s = s.replace(/[`*,_|#>/]/g, ' ');
    s = s.replace(/\s+/g, ' ').trim();
    return s.slice(0, 400);
}
/** Safe to embed inside `<script>` (breaks `</script>` in strings). */
function jsonForHtmlScript(value) {
    return JSON.stringify(value).replace(/</g, '\\u003c');
}
function wikiFooterSearchScript(outDir, currentHtmlRel, entries) {
    const payload = entries.map((e) => ({
        h: wikiRelUrl(outDir, currentHtmlRel, e.target),
        title: e.title,
        t: `${e.title} ${e.text}`.toLowerCase(),
    }));
    const data = jsonForHtmlScript(payload);
    return `<script>
(function(){
var data=${data};
var input=document.getElementById("wiki-q");
var ul=document.getElementById("wiki-q-results");
if(!input||!ul)return;
function run(){
var q=input.value.trim().toLowerCase();
ul.innerHTML="";
if(!q){ul.hidden=true;return;}
var n=0;
for(var i=0;i<data.length;i++){
if(data[i].t.indexOf(q)<0)continue;
var li=document.createElement("li");
var a=document.createElement("a");
a.href=data[i].h;
a.textContent=data[i].title;
li.appendChild(a);
ul.appendChild(li);
if(++n>=20)break;
}
ul.hidden=n===0;
}
input.addEventListener("input",run);
})();
</script>`;
}
function wikiFingerprintDocs(docsDir) {
    const mdFiles = globSync('**/*.md', { cwd: docsDir, nodir: true }).sort();
    return mdFiles
        .map((f) => {
        const st = statSync(join(docsDir, f), { throwIfNoEntry: false });
        return `${f}:${st?.mtimeMs ?? 0}`;
    })
        .join('|');
}
function openHtmlFileInBrowser(filePath) {
    const abs = resolve(filePath);
    if (!existsSync(abs))
        return;
    try {
        if (process.platform === 'darwin')
            execFileSync('open', [abs], { stdio: 'ignore' });
        else if (process.platform === 'win32')
            execFileSync('cmd', ['/c', 'start', '', abs], { stdio: 'ignore' });
        else
            execFileSync('xdg-open', [abs], { stdio: 'ignore' });
    }
    catch {
        console.warn(`Could not open browser for ${abs}`);
    }
}
function runGenerateWiki(docsDir, outDir) {
    if (!existsSync(docsDir))
        throw new Error(`Missing docs dir: ${docsDir}`);
    const mdFiles = globSync('**/*.md', { cwd: docsDir, nodir: true }).sort();
    if (mdFiles.length === 0)
        throw new Error(`No .md files under ${docsDir}`);
    const toHtmlRel = (mdRel) => mdRel.replace(/\.md$/i, '.html');
    const homeMd = mdFiles.includes('project-overview.md') ? 'project-overview.md' : mdFiles.includes('tree.md') ? 'tree.md' : mdFiles[0];
    const searchEntries = mdFiles.map((rel) => {
        const raw = readFileSync(join(docsDir, rel), 'utf8');
        const parsed = matter(raw);
        const title = typeof parsed.data.title === 'string' && parsed.data.title.trim()
            ? String(parsed.data.title)
            : rel.replace(/\.md$/i, '');
        return {
            target: toHtmlRel(rel),
            title,
            text: wikiSearchExcerpt(parsed.content || ''),
        };
    });
    mkdirSync(outDir, { recursive: true });
    for (const rel of mdFiles) {
        const htmlRel = toHtmlRel(rel);
        const absMd = join(docsDir, rel);
        const raw = readFileSync(absMd, 'utf8');
        const parsed = matter(raw);
        const title = typeof parsed.data.title === 'string' && parsed.data.title.trim()
            ? String(parsed.data.title)
            : rel.replace(/\.md$/i, '');
        const nav = wikiNavHtml(outDir, htmlRel, mdFiles);
        const body = mdBodyToHtmlWiki(parsed.content || '');
        const footer = wikiFooterSearchScript(outDir, htmlRel, searchEntries);
        const page = wikiWrapPage(title, nav, body, footer);
        const outPath = join(outDir, ...htmlRel.replace(/\\/g, '/').split('/'));
        mkdirSync(dirname(outPath), { recursive: true });
        writeFileSync(outPath, page, 'utf8');
    }
    const homeAbsMd = join(docsDir, homeMd);
    const homeParsed = matter(readFileSync(homeAbsMd, 'utf8'));
    const homeTitle = typeof homeParsed.data.title === 'string' && homeParsed.data.title.trim()
        ? String(homeParsed.data.title)
        : 'Project overview';
    const indexNav = wikiNavHtml(outDir, 'index.html', mdFiles);
    const indexBody = mdBodyToHtmlWiki(homeParsed.content || '');
    const indexFooter = wikiFooterSearchScript(outDir, 'index.html', searchEntries);
    writeFileSync(join(outDir, 'index.html'), wikiWrapPage(homeTitle, indexNav, indexBody, indexFooter), 'utf8');
    return { mdCount: mdFiles.length };
}
function cmdGenerateWiki(args) {
    const cwd = process.cwd();
    const docsDir = resolve(String(args.docs || join(cwd, '.agents', 'devkit', 'project-index', 'docs')));
    const outDir = resolve(String(args.out || join(docsDir, '..', 'wiki')));
    const doWatch = Boolean(args.watch);
    const doOpen = Boolean(args.open);
    const build = () => runGenerateWiki(docsDir, outDir);
    let fp = '';
    const refreshFingerprint = () => {
        fp = existsSync(docsDir) ? wikiFingerprintDocs(docsDir) : '';
    };
    const { mdCount } = build();
    console.log(`Wrote wiki under ${outDir} (${mdCount} pages + index.html)`);
    if (doOpen)
        openHtmlFileInBrowser(join(outDir, 'index.html'));
    if (doWatch) {
        refreshFingerprint();
        setInterval(() => {
            if (!existsSync(docsDir))
                return;
            const next = wikiFingerprintDocs(docsDir);
            if (next !== fp) {
                fp = next;
                try {
                    const r = build();
                    console.log(`wiki: rebuilt (${r.mdCount} pages + index.html)`);
                }
                catch (e) {
                    console.error('wiki rebuild failed:', e.message);
                }
            }
        }, 1500);
        console.log(`Watching ${docsDir} (poll every 1.5s, Ctrl+C to stop)`);
    }
}
function cmdListSkills(args, repoRoot) {
    const includeTemplate = Boolean(args['include-template']);
    const asJson = Boolean(args.json);
    const dirs = listSkillDirs(repoRoot, includeTemplate);
    const rows = dirs.map((dir) => readSkillInfo(dir));
    if (asJson) {
        console.log(JSON.stringify(rows.map((r) => ({ folder: r.folder, name: r.name || null, path: r.path, has_skill_md: r.hasSkillMd })), null, 2));
        return;
    }
    for (const r of rows) {
        console.log(`${r.folder}\t${r.name || '-'}\t${r.path}`);
    }
}
function cmdValidateSkills(args, repoRoot) {
    const includeTemplate = Boolean(args['include-template']);
    const dirs = listSkillDirs(repoRoot, includeTemplate);
    const errs = [];
    for (const dir of dirs) {
        const info = readSkillInfo(dir);
        const folder = info.folder;
        if (!info.name) {
            errs.push(`${folder}: missing frontmatter name`);
            continue;
        }
        if (info.name !== folder) {
            errs.push(`${folder}: frontmatter name '${info.name}' must match folder name`);
        }
    }
    if (errs.length > 0) {
        console.error('Validation failed:');
        errs.forEach((e) => console.error(`- ${e}`));
        process.exit(2);
    }
    console.log(`Validated ${dirs.length} skills: OK`);
}
function extractTriggers(content) {
    const m = content.match(/Triggers:\s*([\s\S]*?)(?:\n\n|\n##|\n###|$)/i);
    if (!m)
        return [];
    return m[1]
        .split(',')
        .map((s) => s.replace(/["`]/g, '').trim().toLowerCase())
        .filter(Boolean);
}
function extractWhenToUse(content) {
    const m = content.match(/##\s*When to use([\s\S]*?)(?:\n##|$)/i);
    if (!m)
        return [];
    return m[1]
        .split(/\r?\n/)
        .map((l) => l.replace(/^\s*[-*]\s*/, '').trim())
        .filter(Boolean);
}
function extractReferences(skillDir) {
    const refDir = join(skillDir, 'references');
    if (!existsSync(refDir))
        return [];
    return readdirSync(refDir).filter((f) => f.endsWith('.md')).sort();
}
function cmdBuildSkillIndex(args, repoRoot) {
    const cfg = loadKbConfig(repoRoot);
    const output = resolve(repoRoot, String(args.output || cfg.skillIndexPath));
    const withEmbeddings = Boolean(args['with-embeddings']);
    const dry = Boolean(args['dry-run']);
    const dirs = listSkillDirs(repoRoot, false);
    const rows = dirs.map((dir) => {
        const i = readSkillInfo(dir);
        const content = i.content || '';
        return {
            name: i.name || i.folder,
            folder: i.folder,
            description: i.description || '',
            triggers: extractTriggers(content),
            when_to_use: extractWhenToUse(content),
            references: extractReferences(dir),
        };
    });
    if (dry) {
        console.log(JSON.stringify(rows, null, 2));
        return;
    }
    mkdirSync(join(output, '..'), { recursive: true });
    writeFileSync(output, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
    console.log(`Wrote ${rows.length} skills to ${relative(repoRoot, output)}`);
    if (withEmbeddings) {
        const vectors = rows.map((r) => embedText(`${r.name}\n${r.description}\n${r.triggers.join(', ')}`));
        const embPath = resolve(repoRoot, cfg.skillEmbeddingsPath);
        mkdirSync(join(embPath, '..'), { recursive: true });
        writeFileSync(embPath, `${JSON.stringify(vectors)}\n`, 'utf8');
        console.log(`Wrote embeddings: ${relative(repoRoot, embPath)}`);
    }
}
function cmdAnalyzeSkills(args, repoRoot) {
    const withRefs = Boolean(args['with-references']);
    const json = Boolean(args.json);
    const md = Boolean(args.markdown || args['self-review']);
    const onlyActionable = Boolean(args['only-actionable']);
    const dirs = listSkillDirs(repoRoot, Boolean(args['include-template']));
    const rows = dirs.map((dir) => {
        const i = readSkillInfo(dir);
        const content = i.content || '';
        const refCount = extractReferences(dir).length;
        const hasWorkflow = /workflow|steps|checklist/i.test(content);
        const hasScriptHints = /script|automation|ci|validate|build/i.test(content);
        const score = (hasWorkflow ? 2 : 0) + (hasScriptHints ? 2 : 0) + (refCount > 0 ? 1 : 0);
        const tier = score >= 4 ? 'strong' : score >= 2 ? 'consider' : 'low';
        return {
            skill: i.folder,
            score,
            tier,
            references: refCount,
            recommendation: tier === 'strong' ? 'Keep current automation links.' : tier === 'consider' ? 'Add or refine script helpers.' : 'Add references and actionable automation guidance.',
        };
    });
    const outRows = onlyActionable ? rows.filter((r) => r.tier !== 'strong') : rows;
    if (json) {
        console.log(JSON.stringify(outRows, null, 2));
        return;
    }
    if (md) {
        console.log('# Skills analysis');
        console.log('');
        console.log('| Skill | Tier | Score | References | Recommendation |');
        console.log('|---|---:|---:|---:|---|');
        outRows.forEach((r) => console.log(`| ${r.skill} | ${r.tier} | ${r.score} | ${r.references} | ${r.recommendation} |`));
        return;
    }
    outRows.forEach((r) => console.log(`${r.skill}\t${r.tier}\t${r.score}\t${r.recommendation}`));
    if (withRefs) {
        console.log('\n(reference counts included above)');
    }
}
function cmdInstallSkill(args, _repoRoot) {
    const skillPath = args._[1] ? String(args._[1]) : String(args['skill-dir'] || '.');
    const ides = String(args.ides || 'cursor')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
    const res = installSkill({
        skillDir: skillPath,
        projectDir: String(args['project-dir'] || '.'),
        name: args.name ? String(args.name) : undefined,
        mode: (args.mode === 'copy' ? 'copy' : 'symlink'),
        force: Boolean(args.force),
        allIdes: Boolean(args['all-ides']),
        ides,
        noGitIsolation: Boolean(args['no-git-isolation']),
    });
    console.log(`Installed skill '${res.installName}'`);
}
function resolveConsumerBundleDir(projectDir) {
    const devkit = join(projectDir, '.agents', 'devkit');
    if (existsSync(join(devkit, '.devkit-bundle')))
        return { bundleDir: devkit, kind: 'devkit' };
    const legacy = join(projectDir, 'vendor', 'own-skills');
    if (existsSync(join(legacy, '.own-skills-bundle')))
        return { bundleDir: legacy, kind: 'legacy' };
    return null;
}
function symlinkResolvesUnder(linkPath, expectedDir) {
    try {
        const st = lstatSync(linkPath);
        if (!st.isSymbolicLink())
            return false;
        const target = readlinkSync(linkPath, { encoding: 'utf8' });
        const resolved = resolve(dirname(linkPath), target);
        const base = resolve(expectedDir);
        return resolved === base || resolved.startsWith(base + sep);
    }
    catch {
        return false;
    }
}
function strictBundleInstallWarnings(projectDir, bundleDir) {
    const warnings = [];
    const bundleRules = join(bundleDir, '.cursor', 'rules');
    const projRules = join(projectDir, '.cursor', 'rules');
    if (existsSync(projRules)) {
        for (const f of readdirSync(projRules)) {
            if (!f.endsWith('.mdc'))
                continue;
            const p = join(projRules, f);
            if (!symlinkResolvesUnder(p, bundleRules)) {
                warnings.push(`${relative(projectDir, p)} should be a symlink into the bundle rules tree`);
            }
        }
    }
    const bundleCommands = join(bundleDir, 'commands');
    for (const [ideRoot, sub] of [
        ['.cursor', 'commands'],
        ['.claude', 'commands'],
    ]) {
        const dir = join(projectDir, ideRoot, sub);
        if (!existsSync(dir))
            continue;
        for (const f of readdirSync(dir)) {
            if (!f.endsWith('.md'))
                continue;
            const p = join(dir, f);
            if (!symlinkResolvesUnder(p, bundleCommands)) {
                warnings.push(`${relative(projectDir, p)} should be a symlink into bundle commands/`);
            }
        }
    }
    const bundleSkills = join(bundleDir, 'skills');
    const skillBases = [
        ['.cursor', 'skills'],
        ['.claude', 'skills'],
        ['.codex', 'skills'],
        ['.agent', 'skills'],
    ];
    for (const [ideRoot, sub] of skillBases) {
        const root = join(projectDir, ideRoot, sub);
        if (!existsSync(root))
            continue;
        for (const name of readdirSync(root)) {
            if (name === '.install-manifest')
                continue;
            const p = join(root, name);
            try {
                const st = lstatSync(p);
                if (!st.isSymbolicLink()) {
                    warnings.push(`${relative(projectDir, p)} should be a symlink into bundle skills/`);
                }
                else if (!symlinkResolvesUnder(p, bundleSkills)) {
                    warnings.push(`${relative(projectDir, p)} should resolve under bundle skills/`);
                }
            }
            catch {
                warnings.push(`${relative(projectDir, p)} could not be inspected`);
            }
        }
    }
    return warnings;
}
function cmdVerifyBundleInstall(args, _repoRoot) {
    const projectDir = resolve(String(args['project-dir'] || '.'));
    const resolved = resolveConsumerBundleDir(projectDir);
    const errs = [];
    if (!resolved) {
        errs.push('Missing installed bundle: expected .agents/devkit/.devkit-bundle or legacy vendor/own-skills/.own-skills-bundle');
    }
    const bundleDir = resolved?.bundleDir ?? join(projectDir, '.agents', 'devkit');
    if (resolved && !existsSync(join(bundleDir, 'scripts')))
        errs.push(`Missing ${join(bundleDir, 'scripts')}`);
    if (resolved && resolved.kind === 'devkit' && !existsSync(join(bundleDir, 'commands'))) {
        errs.push(`Missing bundle commands/ (devkit layout)`);
    }
    if (!existsSync(join(projectDir, '.cursor', 'skills')))
        errs.push('Missing .cursor/skills');
    const toolsJs = join(bundleDir, 'dist', 'tools.js');
    if (resolved && !existsSync(toolsJs))
        errs.push(`Missing ${toolsJs}`);
    const canValidateSkills = resolved &&
        existsSync(toolsJs) &&
        existsSync(join(bundleDir, 'node_modules', 'minimist'));
    if (!Boolean(args['skip-validate-skills']) && resolved && existsSync(toolsJs)) {
        if (!canValidateSkills) {
            console.warn('Skipping validate-skills: bundle has no node_modules (full install excludes them). Run: cd .agents/devkit && npm ci');
        }
        else {
            try {
                execFileSync('node', [toolsJs, 'validate-skills'], {
                    cwd: bundleDir,
                    stdio: 'pipe',
                });
            }
            catch {
                errs.push('validate-skills failed in bundle');
            }
        }
    }
    if (errs.length > 0) {
        errs.forEach((e) => console.error(`- ${e}`));
        process.exit(2);
    }
    console.log('Bundle install verification: OK');
    if (Boolean(args.strict) && resolved) {
        const w = strictBundleInstallWarnings(projectDir, bundleDir);
        if (w.length) {
            console.warn('Strict mode: expected symlinks into the bundle —');
            w.forEach((x) => console.warn(`- ${x}`));
        }
        else {
            console.log('Strict mode: no drift detected');
        }
    }
}
function buildKb(repoRoot, dry = false) {
    const cfg = loadKbConfig(repoRoot);
    const docsRoot = resolve(repoRoot, cfg.documentsPath);
    const files = collectMarkdownFiles(docsRoot);
    const manifest = [];
    const vectors = [];
    let idx = 0;
    for (const f of files) {
        const raw = readText(f);
        const p = matter(raw);
        const chunks = chunkText(p.content || '', cfg.chunkSize, cfg.chunkOverlap);
        chunks.forEach((c, i) => {
            const id = `chunk_${idx++}`;
            manifest.push({ id, path: relative(repoRoot, f).replace(/\\/g, '/'), title: p.data.title || undefined, chunk_index: i, text: c });
            vectors.push(embedText(c));
        });
    }
    if (dry) {
        console.log(`Would index ${files.length} files -> ${manifest.length} chunks`);
        return;
    }
    const embPath = resolve(repoRoot, cfg.embeddingsPath);
    const manifestPath = resolve(repoRoot, cfg.manifestPath);
    mkdirSync(join(embPath, '..'), { recursive: true });
    writeFileSync(embPath, `${JSON.stringify(vectors)}\n`, 'utf8');
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log(`Wrote embeddings: ${relative(repoRoot, embPath)} (${vectors.length} vectors)`);
    console.log(`Wrote manifest: ${relative(repoRoot, manifestPath)}`);
}
function loadKbData(repoRoot, indexDir) {
    let embPath;
    let manifestPath;
    if (indexDir) {
        const dir = resolve(String(indexDir));
        embPath = join(dir, 'embeddings.json');
        manifestPath = join(dir, 'manifest.json');
    }
    else {
        const cfg = loadKbConfig(repoRoot);
        embPath = resolve(repoRoot, cfg.embeddingsPath);
        manifestPath = resolve(repoRoot, cfg.manifestPath);
    }
    if (!existsSync(embPath) || !existsSync(manifestPath)) {
        throw new Error(indexDir
            ? `Missing project index in ${resolve(String(indexDir))} (expected embeddings.json + manifest.json). Run index-project first.`
            : 'Missing KB artifacts. Run build-kb first.');
    }
    const vectors = JSON.parse(readFileSync(embPath, 'utf8'));
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    return { vectors, manifest };
}
function queryKb(repoRoot, q, topK, indexDir) {
    const { vectors, manifest } = loadKbData(repoRoot, indexDir);
    const qv = embedText(q);
    const scored = vectors
        .map((v, i) => ({ i, score: cosine(v, qv) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
    return scored.map(({ i, score }) => ({ score, item: manifest[i] }));
}
function cmdQueryKb(args, repoRoot) {
    const q = String(args._[1] || '');
    if (!q)
        throw new Error('query-kb requires query text');
    const topK = Number(args.k || args['top-k'] || 5);
    const indexDir = args.index ? String(args.index) : undefined;
    const rows = queryKb(repoRoot, q, topK, indexDir);
    rows.forEach((r, idx) => {
        console.log(`${idx + 1}. score=${r.score.toFixed(4)} path=${r.item.path} chunk=${r.item.chunk_index}`);
        console.log(`   ${r.item.text.slice(0, 180).replace(/\s+/g, ' ')}...`);
    });
}
function cmdQueryKbBatch(args, repoRoot) {
    const topK = Number(args.k || args['top-k'] || 5);
    const queries = [];
    const qArg = args.q ?? args.query;
    if (typeof qArg === 'string')
        queries.push(qArg);
    if (Array.isArray(qArg))
        queries.push(...qArg.map(String));
    if (args.f || args.file) {
        const file = resolve(String(args.f || args.file));
        const lines = readFileSync(file, 'utf8')
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);
        queries.push(...lines);
    }
    if (queries.length === 0)
        throw new Error('query-kb-batch requires -q/--query or -f/--file');
    const indexDir = args.index ? String(args.index) : undefined;
    const out = queries.map((q) => ({ query: q, results: queryKb(repoRoot, q, topK, indexDir) }));
    if (args.json) {
        console.log(JSON.stringify(out, null, 2));
        return;
    }
    out.forEach((item) => {
        console.log(`\nQuery: ${item.query}`);
        item.results.forEach((r, idx) => {
            console.log(`  ${idx + 1}. ${r.score.toFixed(4)}  ${r.item.path}#${r.item.chunk_index}`);
        });
    });
}
function cmdVerifyKb(_args, repoRoot) {
    const cfg = loadKbConfig(repoRoot);
    const embPath = resolve(repoRoot, cfg.embeddingsPath);
    const manifestPath = resolve(repoRoot, cfg.manifestPath);
    const errors = [];
    if (!existsSync(embPath))
        errors.push(`Missing embeddings: ${embPath}`);
    if (!existsSync(manifestPath))
        errors.push(`Missing manifest: ${manifestPath}`);
    if (errors.length === 0) {
        const v = JSON.parse(readFileSync(embPath, 'utf8'));
        const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
        if (!Array.isArray(v) || !Array.isArray(m))
            errors.push('Embeddings/manifest format invalid');
        if (v.length !== m.length)
            errors.push(`Vector count (${v.length}) != manifest count (${m.length})`);
    }
    if (errors.length > 0) {
        errors.forEach((e) => console.error(`- ${e}`));
        process.exit(2);
    }
    console.log('KB verification: OK');
}
function cmdBuildGraph(args) {
    const targetDir = resolve(String(args.dir || args.d || '.'));
    const outDir = resolve(String(args.out || join(targetDir, '.agents', 'devkit', 'project-graph')));
    const dry = Boolean(args['dry-run']);
    if (!existsSync(outDir)) {
        mkdirSync(outDir, { recursive: true });
    }
    const graphPath = join(outDir, 'graph.json');
    if (dry) {
        console.log(`[dry-run] Would build graph for ${targetDir} → ${graphPath}`);
        return;
    }
    console.log(`Building code graph for ${targetDir}...`);
    const graph = buildGraph(targetDir);
    saveGraph(graph, graphPath);
    console.log(`Graph built: ${graph.nodes.length} nodes, ${graph.edges.length} edges`);
    console.log(`Saved to: ${graphPath}`);
}
function cmdQueryGraph(args) {
    const targetDir = resolve(String(args.dir || args.d || '.'));
    const graphPath = resolve(String(args.graph || join(targetDir, '.agents', 'devkit', 'project-graph', 'graph.json')));
    const query = String(args._[1] || '');
    const mode = String(args.mode || 'search'); // search, callers, callees
    if (!existsSync(graphPath)) {
        console.error(`Graph not found: ${graphPath}. Run build-graph first.`);
        process.exit(1);
    }
    const graph = loadGraph(graphPath);
    if (!query) {
        console.log(`Graph stats: ${graph.nodes.length} nodes, ${graph.edges.length} edges`);
        return;
    }
    console.log(`Query: "${query}" (mode: ${mode})`);
    let results = [];
    switch (mode) {
        case 'callers':
            results = getCallers(graph, query);
            console.log(`\nCallers of "${query}":`);
            break;
        case 'callees':
            results = getCallees(graph, query);
            console.log(`\nCallees of "${query}":`);
            break;
        case 'search':
        default:
            results = queryGraph(graph, query);
            console.log(`\nSearch results for "${query}":`);
            break;
    }
    if (results.length === 0) {
        console.log('  No results found.');
        return;
    }
    results.forEach((r, i) => {
        console.log(`  ${i + 1}. ${r.name} (${r.type}) @ ${r.file}:${r.line}`);
    });
}
function cmdImpactAnalysis(args) {
    const targetDir = resolve(String(args.dir || args.d || '.'));
    const graphPath = resolve(String(args.graph || join(targetDir, '.agents', 'devkit', 'project-graph', 'graph.json')));
    const filePath = String(args._[1] || '');
    if (!existsSync(graphPath)) {
        console.error(`Graph not found: ${graphPath}. Run build-graph first.`);
        process.exit(1);
    }
    if (!filePath) {
        console.error('Usage: impact-analysis <file-path>');
        process.exit(1);
    }
    const graph = loadGraph(graphPath);
    console.log(`Analyzing impact of changes to: ${filePath}`);
    const impacted = impactAnalysis(graph, filePath);
    console.log(`\nBlast radius: ${impacted.length} affected symbols`);
    impacted.forEach((node, i) => {
        console.log(`  ${i + 1}. ${node.name} (${node.type}) @ ${node.file}:${node.line}`);
    });
}
function help() {
    console.log(`Usage: node dist/tools.js <command> [args]

Commands:
  list-skills [--include-template] [--json]
  validate-skills [--include-template]
  build-skill-index [--output <path>] [--with-embeddings] [--dry-run]
  analyze-skills [--json|--markdown|--self-review] [--with-references] [--only-actionable]
  install-skill <skill-path> [--project-dir <dir>] [--mode symlink|copy] [--force] [--all-ides]
  verify-bundle-install [--project-dir <dir>] [--skip-validate-skills] [--strict]
  build-kb [--dry-run]
  index-project [--dir <path>] [--out <path>] [--include <globs>] [--chunk-size N] [--chunk-overlap N] [--dry-run]
  generate-wiki [--docs <project-index/docs>] [--out <wiki-dir>] [--watch] [--open]
  query-kb "<query>" [-k 5] [--index <project-index-dir>]
  query-kb-batch [-q "..."]... [-f file] [-k 5] [--json] [--index <project-index-dir>]
  verify-kb
  build-graph [--dir <path>] [--out <path>] [--dry-run]
  query-graph <query> [--mode search|callers|callees] [--graph <path>]
  impact-analysis <file-path> [--graph <path>]`);
}
function main() {
    const args = minimist(process.argv.slice(2), {
        boolean: [
            'json',
            'markdown',
            'self-review',
            'with-references',
            'include-template',
            'with-embeddings',
            'dry-run',
            'force',
            'all-ides',
            'skip-validate-skills',
            'strict',
            'watch',
            'open',
        ],
        string: [
            'output',
            'project-dir',
            'mode',
            'name',
            'ides',
            'skill-dir',
            'k',
            'top-k',
            'q',
            'query',
            'f',
            'file',
            'index',
            'dir',
            'd',
            'out',
            'include',
            'chunk-size',
            'chunk-overlap',
            'docs',
            'graph',
        ],
    });
    const cmd = String(args._[0] || '');
    const root = process.cwd();
    switch (cmd) {
        case 'list-skills':
            cmdListSkills(args, root);
            break;
        case 'validate-skills':
            cmdValidateSkills(args, root);
            break;
        case 'build-skill-index':
            cmdBuildSkillIndex(args, root);
            break;
        case 'analyze-skills':
            cmdAnalyzeSkills(args, root);
            break;
        case 'install-skill':
            cmdInstallSkill(args, root);
            break;
        case 'verify-bundle-install':
            cmdVerifyBundleInstall(args, root);
            break;
        case 'build-kb':
            buildKb(root, Boolean(args['dry-run']));
            break;
        case 'index-project':
            cmdIndexProject(args);
            break;
        case 'generate-wiki':
            cmdGenerateWiki(args);
            break;
        case 'query-kb':
            cmdQueryKb(args, root);
            break;
        case 'query-kb-batch':
            cmdQueryKbBatch(args, root);
            break;
        case 'verify-kb':
            cmdVerifyKb(args, root);
            break;
        case 'build-graph':
            cmdBuildGraph(args);
            break;
        case 'query-graph':
            cmdQueryGraph(args);
            break;
        case 'impact-analysis':
            cmdImpactAnalysis(args);
            break;
        default:
            help();
            process.exit(cmd ? 1 : 0);
    }
}
try {
    main();
}
catch (e) {
    console.error(e.message);
    process.exit(1);
}
