#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readFileSync, readlinkSync, readdirSync, statSync, writeFileSync, } from 'node:fs';
import { basename, dirname, relative, resolve, join, sep } from 'node:path';
import matter from 'gray-matter';
import { globSync } from 'glob';
// Simple CLI argument parser (replaces minimist)
function parseArgs(argv, options = {}) {
    const args = {};
    const positional = [];
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg.startsWith('--')) {
            const key = arg.slice(2);
            const isBoolean = options.boolean?.includes(key);
            const isString = options.string?.includes(key);
            if (isBoolean) {
                args[key] = true;
            }
            else if (isString || i + 1 < argv.length && !argv[i + 1].startsWith('-')) {
                args[key] = argv[++i];
            }
            else {
                args[key] = true;
            }
        }
        else if (arg.startsWith('-')) {
            const key = arg.slice(1);
            const isBoolean = options.boolean?.includes(key);
            const isString = options.string?.includes(key);
            if (isBoolean) {
                args[key] = true;
            }
            else if (isString || i + 1 < argv.length && !argv[i + 1].startsWith('-')) {
                args[key] = argv[++i];
            }
            else {
                args[key] = true;
            }
        }
        else {
            positional.push(arg);
        }
    }
    args._ = positional;
    return args;
}
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
import chalk from 'chalk';
function cmdListSkills(args, repoRoot) {
    const includeTemplate = Boolean(args['include-template']);
    const asJson = Boolean(args.json);
    const dirs = listSkillDirs(repoRoot, includeTemplate);
    const rows = dirs.map((dir) => readSkillInfo(dir));
    if (asJson) {
        console.log(JSON.stringify(rows.map((r) => ({ folder: r.folder, name: r.name || null, path: r.path, has_skill_md: r.hasSkillMd })), null, 2));
        return;
    }
    const maxLen = Math.max(...rows.map((r) => r.folder.length));
    for (const r of rows) {
        console.log(`  ${chalk.cyan(r.folder.padEnd(maxLen))}  ${chalk.dim(r.name || '-')}`);
    }
    console.log(chalk.dim(`\n  ${rows.length} skills`));
}
function cmdValidateSkills(args, repoRoot) {
    const includeTemplate = Boolean(args['include-template']);
    const dirs = listSkillDirs(repoRoot, includeTemplate);
    const errs = [];
    for (const dir of dirs) {
        const info = readSkillInfo(dir);
        if (!info.name) {
            errs.push({ folder: info.folder, reason: 'missing frontmatter name' });
            continue;
        }
        if (info.name !== info.folder) {
            errs.push({ folder: info.folder, reason: `name "${info.name}" must match folder` });
        }
    }
    if (errs.length > 0) {
        console.error(chalk.red(`\nValidation failed — ${errs.length} error${errs.length > 1 ? 's' : ''}:\n`));
        const maxLen = Math.max(...errs.map((e) => e.folder.length));
        for (const { folder, reason } of errs) {
            console.error(`  ${chalk.red('✘')} ${chalk.yellow(folder.padEnd(maxLen))}  ${chalk.dim(reason)}`);
        }
        console.error();
        process.exit(2);
    }
    console.log(chalk.green(`Validated ${dirs.length} skills: OK`));
}
function extractTriggers(content) {
    const m = content.match(/^(?:[-*]\s*)?(?:\*\*)?(?:Triggers?|Trigger keywords?)(?:\*\*)?:\s*([\s\S]*?)(?:\n\n|\n##|\n###|$)/im);
    if (!m)
        return [];
    return m[1]
        .split(/,|\r?\n/)
        .map((s) => s.replace(/^\s*[-*]\s*/, ''))
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
function extractSkillTriggers(info) {
    const fromDescription = extractTriggers(info.description || '');
    if (fromDescription.length > 0)
        return fromDescription;
    return extractTriggers(info.content || '');
}
function loadRoutingSkillRows(repoRoot, includeTemplate = false) {
    const dirs = listSkillDirs(repoRoot, includeTemplate);
    return dirs.map((dir) => {
        const info = readSkillInfo(dir);
        return {
            name: info.name || info.folder,
            folder: info.folder,
            description: info.description || '',
            triggers: extractSkillTriggers(info),
            when_to_use: extractWhenToUse(info.content || ''),
            references: extractReferences(dir),
        };
    });
}
function normalizeRoutingText(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function promptContainsTriggerTokensInOrder(promptTokens, triggerTokens) {
    if (triggerTokens.length === 0)
        return false;
    let cursor = 0;
    for (const token of triggerTokens) {
        let found = false;
        while (cursor < promptTokens.length) {
            if (promptTokens[cursor] === token) {
                found = true;
                cursor++;
                break;
            }
            cursor++;
        }
        if (!found)
            return false;
    }
    return true;
}
function matchPromptToTriggers(prompt, triggers) {
    const normalizedPrompt = normalizeRoutingText(prompt);
    if (!normalizedPrompt)
        return [];
    const promptTokens = normalizedPrompt.split(' ').filter(Boolean);
    return triggers
        .map((trigger) => {
        const normalized = normalizeRoutingText(trigger);
        if (!normalized)
            return null;
        const triggerTokens = normalized.split(' ').filter(Boolean);
        const isExact = normalizedPrompt.includes(normalized);
        const isOrderedTokenMatch = !isExact && triggerTokens.length > 1 && promptContainsTriggerTokensInOrder(promptTokens, triggerTokens);
        if (!isExact && !isOrderedTokenMatch)
            return null;
        return {
            trigger,
            normalized,
            score: isExact ? triggerTokens.length * 100 + normalized.length : triggerTokens.length * 60 + normalized.length,
        };
    })
        .filter((row) => row !== null)
        .sort((a, b) => b.score - a.score || b.normalized.length - a.normalized.length || a.trigger.localeCompare(b.trigger));
}
function routingCaseAllowedSkills(testCase) {
    if (Array.isArray(testCase.expected_any_of) && testCase.expected_any_of.length > 0) {
        return [...testCase.expected_any_of];
    }
    if (typeof testCase.expected_skill === 'string' && testCase.expected_skill.length > 0) {
        return [testCase.expected_skill];
    }
    return [];
}
function routingCasePrimaryExpected(testCase) {
    if (typeof testCase.expected_skill === 'string' && testCase.expected_skill.length > 0) {
        return testCase.expected_skill;
    }
    const any = testCase.expected_any_of;
    if (Array.isArray(any) && any.length > 0)
        return any[0];
    return '';
}
function cmdEvalSkillRouting(args, repoRoot) {
    const datasetPath = resolve(repoRoot, String(args.file || join('evals', 'routing', 'skill-routing-cases.json')));
    const asJson = Boolean(args.json);
    const asMarkdown = Boolean(args.markdown);
    const strict = Boolean(args.strict);
    if (!existsSync(datasetPath)) {
        throw new Error(`Missing routing eval dataset: ${datasetPath}`);
    }
    const rawCases = JSON.parse(readFileSync(datasetPath, 'utf8'));
    if (!Array.isArray(rawCases) || rawCases.length === 0) {
        throw new Error(`Routing eval dataset must be a non-empty JSON array: ${datasetPath}`);
    }
    const skills = loadRoutingSkillRows(repoRoot, false);
    const bySkill = new Map(skills.map((skill) => [skill.folder, skill]));
    const datasetErrors = [];
    rawCases.forEach((row, index) => {
        if (!row || typeof row.prompt !== 'string') {
            datasetErrors.push(`case[${index}] must include string prompt`);
            return;
        }
        const allowed = routingCaseAllowedSkills(row);
        if (allowed.length === 0) {
            datasetErrors.push(`case[${index}] needs expected_skill and/or non-empty expected_any_of`);
            return;
        }
        for (const name of allowed) {
            if (!bySkill.has(name)) {
                datasetErrors.push(`case[${index}] unknown expected skill "${name}"`);
            }
        }
        if (Array.isArray(row.hard_negative_skills)) {
            for (const name of row.hard_negative_skills) {
                if (!bySkill.has(name)) {
                    datasetErrors.push(`case[${index}] unknown hard_negative_skills entry "${name}"`);
                }
            }
        }
    });
    if (datasetErrors.length > 0) {
        datasetErrors.forEach((msg) => console.error(`- ${msg}`));
        process.exit(2);
    }
    const rows = rawCases.map((testCase, index) => {
        const ranked = skills
            .map((skill) => {
            const matches = matchPromptToTriggers(testCase.prompt, skill.triggers);
            const totalScore = matches.reduce((sum, match) => sum + match.score, 0);
            return {
                skill: skill.folder,
                triggerCount: skill.triggers.length,
                matches,
                totalScore,
            };
        })
            .filter((row) => row.totalScore > 0)
            .sort((a, b) => b.totalScore - a.totalScore || b.matches[0].score - a.matches[0].score || a.skill.localeCompare(b.skill));
        const predicted = ranked[0]?.skill ?? null;
        const allowedSet = new Set(routingCaseAllowedSkills(testCase));
        const primaryExpected = routingCasePrimaryExpected(testCase);
        const expectedSkillRow = bySkill.get(primaryExpected);
        const neg = new Set(Array.isArray(testCase.hard_negative_skills) ? testCase.hard_negative_skills.filter((s) => typeof s === 'string') : []);
        const firstAllowedRanked = ranked.find((r) => allowedSet.has(r.skill) && r.matches.length > 0);
        const expectedMatches = firstAllowedRanked?.matches ?? [];
        let status;
        if (predicted && neg.has(predicted)) {
            status = 'fail_hard_negative';
        }
        else if (predicted && allowedSet.has(predicted)) {
            status = 'pass';
        }
        else if ([...allowedSet].every((s) => (bySkill.get(s)?.triggers.length ?? 0) === 0)) {
            status = 'missing_triggers';
        }
        else if (predicted === null) {
            status = 'no_match';
        }
        else if (![...allowedSet].some((s) => ranked.some((row) => row.skill === s && row.matches.length > 0))) {
            status = 'wrong_match_no_expected_trigger';
        }
        else {
            status = 'wrong_match';
        }
        return {
            id: testCase.id || `case-${index + 1}`,
            prompt: testCase.prompt,
            expectedSkill: primaryExpected,
            expectedAnyOf: [...allowedSet],
            hardNegativeSkills: testCase.hard_negative_skills ?? [],
            predictedSkill: predicted,
            status,
            note: testCase.note || null,
            expectedTriggerCount: expectedSkillRow.triggers.length,
            expectedMatches: expectedMatches.map((match) => match.trigger),
            topMatches: ranked.slice(0, 3).map((row) => ({
                skill: row.skill,
                score: row.totalScore,
                matchedTriggers: row.matches.slice(0, 3).map((match) => match.trigger),
            })),
        };
    });
    const summary = {
        total: rows.length,
        pass: rows.filter((row) => row.status === 'pass').length,
        fail: rows.filter((row) => row.status !== 'pass').length,
        missingTriggers: rows.filter((row) => row.status === 'missing_triggers').length,
        noMatch: rows.filter((row) => row.status === 'no_match').length,
        wrongMatchNoExpectedTrigger: rows.filter((row) => row.status === 'wrong_match_no_expected_trigger').length,
        wrongMatch: rows.filter((row) => row.status === 'wrong_match').length,
        failHardNegative: rows.filter((row) => row.status === 'fail_hard_negative').length,
        coverage: Number(((rows.filter((row) => row.status === 'pass').length / rows.length) * 100).toFixed(1)),
    };
    if (asJson) {
        console.log(JSON.stringify({ dataset: relative(repoRoot, datasetPath), summary, rows }, null, 2));
        if (strict && summary.fail > 0)
            process.exit(2);
        return;
    }
    if (asMarkdown) {
        console.log('# Skill routing eval\n');
        console.log(`Dataset: \`${relative(repoRoot, datasetPath)}\``);
        console.log(`Pass: **${summary.pass}/${summary.total}** (${summary.coverage}%)\n`);
        console.log('| Case | Expected | Predicted | Status | Prompt |');
        console.log('|---|---|---|---|---|');
        rows.forEach((row) => {
            const prompt = row.prompt.replace(/\|/g, '\\|');
            const exp = row.expectedAnyOf.length > 1 ? `\`${row.expectedAnyOf.join('`, `')}\` (any)` : `\`${row.expectedSkill}\``;
            console.log(`| \`${row.id}\` | ${exp} | ${row.predictedSkill ? `\`${row.predictedSkill}\`` : '—'} | ${row.status} | ${prompt} |`);
        });
        if (strict && summary.fail > 0)
            process.exit(2);
        return;
    }
    console.log(chalk.bold('Skill routing eval'));
    console.log(chalk.dim(`  dataset ${relative(repoRoot, datasetPath)}`));
    console.log(chalk.dim(`  total ${summary.total}  ·  pass ${summary.pass}  ·  fail ${summary.fail}  ·  coverage ${summary.coverage}%`));
    console.log('');
    console.log(`  ${chalk.green('pass'.padEnd(30))} ${chalk.bold(String(summary.pass))}`);
    console.log(`  ${chalk.red('fail'.padEnd(30))} ${chalk.bold(String(summary.fail))}`);
    console.log(`  ${chalk.yellow('missing expected skill triggers'.padEnd(30))} ${chalk.bold(String(summary.missingTriggers))}`);
    console.log(`  ${chalk.yellow('no trigger matched any skill'.padEnd(30))} ${chalk.bold(String(summary.noMatch))}`);
    console.log(`  ${chalk.yellow('wrong match, expected had no hit'.padEnd(30))} ${chalk.bold(String(summary.wrongMatchNoExpectedTrigger))}`);
    console.log(`  ${chalk.yellow('wrong match, expected also matched'.padEnd(30))} ${chalk.bold(String(summary.wrongMatch))}`);
    console.log(`  ${chalk.red('fail hard negative'.padEnd(30))} ${chalk.bold(String(summary.failHardNegative))}`);
    const failures = rows.filter((row) => row.status !== 'pass');
    if (failures.length > 0) {
        console.log('');
        failures.forEach((row) => {
            const predicted = row.predictedSkill ? chalk.cyan(row.predictedSkill) : chalk.dim('—');
            const reason = row.status === 'missing_triggers' ? `expected skill has 0 extracted triggers` :
                row.status === 'no_match' ? 'no skill trigger matched prompt' :
                    row.status === 'wrong_match_no_expected_trigger' ? 'prompt matched another skill, not expected skill' :
                        row.status === 'fail_hard_negative' ? 'top prediction is a declared hard-negative skill' :
                            'prompt matched expected skill, but another skill scored higher';
            const want = row.expectedAnyOf.length > 1 ? `one of: ${row.expectedAnyOf.join(', ')}` : row.expectedSkill;
            console.log(`  ${chalk.red('FAIL')}  ${want}  ←  ${predicted}  ${chalk.dim(`(${reason})`)}`);
            console.log(`        ${chalk.dim(row.prompt)}`);
            if (row.topMatches.length > 0) {
                const top = row.topMatches
                    .map((match) => `${match.skill} [${match.matchedTriggers.join(', ')}]`)
                    .join(chalk.dim('  ·  '));
                console.log(`        top matches: ${chalk.dim(top)}`);
            }
        });
    }
    if (strict && summary.fail > 0)
        process.exit(2);
}
function findSectionLabelPosition(response, label) {
    const pattern = new RegExp(`(?:^|\\n)\\s*(?:#{1,6}\\s*)?(?:\\d+\\.\\s+)?(?:\\*\\*)?${escapeRegExp(label)}(?:\\*\\*)?\\s*(?:—|:|$)`, 'im');
    const match = pattern.exec(response);
    return match ? match.index : -1;
}
function evalOutputFormatCaseHeuristic(response, spec) {
    const positions = spec.required_sections.map((section) => ({
        section,
        position: findSectionLabelPosition(response, section),
    }));
    const missingSections = positions.filter((row) => row.position < 0).map((row) => row.section);
    const presentPositions = positions.filter((row) => row.position >= 0);
    let orderOk = true;
    for (let i = 1; i < presentPositions.length; i++) {
        if (presentPositions[i].position < presentPositions[i - 1].position) {
            orderOk = false;
            break;
        }
    }
    const hasCodeFence = /```[\s\S]*?```/.test(response);
    const codeFenceOk = spec.require_code_fence ? hasCodeFence : true;
    const pass = missingSections.length === 0 && orderOk && codeFenceOk;
    return { pass, missingSections, orderOk, codeFenceOk };
}
function parseJsonObjectFromJudgeText(raw) {
    const trimmed = raw.trim();
    try {
        return JSON.parse(trimmed);
    }
    catch {
        const start = trimmed.indexOf('{');
        const end = trimmed.lastIndexOf('}');
        if (start >= 0 && end > start) {
            try {
                return JSON.parse(trimmed.slice(start, end + 1));
            }
            catch {
                return null;
            }
        }
        return null;
    }
}
async function judgeOutputFormatWithLlm(params) {
    const apiKey = process.env.SKILL_EVAL_JUDGE_API_KEY || process.env.OPENAI_API_KEY || '';
    const base = (process.env.SKILL_EVAL_JUDGE_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
    const model = process.env.SKILL_EVAL_JUDGE_MODEL || 'gpt-4o-mini';
    if (!apiKey) {
        return { ok: false, error: 'Set SKILL_EVAL_JUDGE_API_KEY or OPENAI_API_KEY for --mode ai-judge' };
    }
    const sections = params.spec.required_sections.map((s) => `- ${s}`).join('\n');
    const fenceRule = params.spec.require_code_fence
        ? 'A fenced code block using triple backticks must appear at least once.'
        : 'Code fences are optional unless clearly needed; do not fail solely for missing fences.';
    const system = `You grade assistant draft responses against a fixed per-skill output contract.
Return ONLY valid JSON (no markdown fences) with keys:
pass (boolean),
missing_sections (string[] — labels from the contract that are missing or not clearly a section),
section_order_ok (boolean),
code_fence_ok (boolean),
brief_rationale (string, one or two sentences).

pass is true only if every required section is clearly present, order matches the contract list, and code_fence_ok matches the fence rule.`;
    const user = `Skill: ${params.skill}

Required sections (in this order — same schema as skill-output-format-specs.json):
${sections}

Fence rule: ${fenceRule}

User prompt:
${params.prompt}

Assistant response to grade:
---
${params.response}
---`;
    const url = `${base}/chat/completions`;
    let res;
    try {
        res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                temperature: 0,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: system },
                    { role: 'user', content: user },
                ],
            }),
        });
    }
    catch (e) {
        return { ok: false, error: e.message };
    }
    if (!res.ok) {
        const t = await res.text().catch(() => '');
        return { ok: false, error: `HTTP ${res.status} ${res.statusText}${t ? `: ${t.slice(0, 200)}` : ''}` };
    }
    const body = (await res.json());
    const content = body.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
        return { ok: false, error: 'Empty model response' };
    }
    const parsed = parseJsonObjectFromJudgeText(content);
    if (!parsed || typeof parsed.pass !== 'boolean') {
        return { ok: false, error: 'Model did not return parseable JSON with boolean pass' };
    }
    return { ok: true, judge: parsed };
}
async function cmdEvalSkillOutputFormat(args, repoRoot) {
    const specPath = resolve(repoRoot, String(args.spec || join('evals', 'output', 'skill-output-format-specs.json')));
    const casesPath = resolve(repoRoot, String(args.file || join('evals', 'output', 'skill-output-format-cases.json')));
    const asJson = Boolean(args.json);
    const asMarkdown = Boolean(args.markdown);
    const strict = Boolean(args.strict);
    const mode = String(args.mode || 'heuristic').toLowerCase();
    if (mode !== 'heuristic' && mode !== 'ai-judge') {
        throw new Error(`Invalid --mode "${mode}" (use heuristic or ai-judge)`);
    }
    if (!existsSync(specPath))
        throw new Error(`Missing output eval spec file: ${specPath}`);
    if (!existsSync(casesPath))
        throw new Error(`Missing output eval cases file: ${casesPath}`);
    const specs = JSON.parse(readFileSync(specPath, 'utf8'));
    const cases = JSON.parse(readFileSync(casesPath, 'utf8'));
    if (!Array.isArray(specs) || specs.length === 0)
        throw new Error(`Output eval specs must be a non-empty JSON array: ${specPath}`);
    if (!Array.isArray(cases) || cases.length === 0)
        throw new Error(`Output eval cases must be a non-empty JSON array: ${casesPath}`);
    const specBySkill = new Map(specs.map((spec) => [spec.skill, spec]));
    const datasetErrors = [];
    cases.forEach((row, index) => {
        if (!row || typeof row.skill !== 'string' || typeof row.prompt !== 'string' || typeof row.response !== 'string') {
            datasetErrors.push(`case[${index}] must include string skill + prompt + response`);
            return;
        }
        if (!specBySkill.has(row.skill)) {
            datasetErrors.push(`case[${index}] references unknown skill spec "${row.skill}"`);
        }
    });
    if (datasetErrors.length > 0) {
        datasetErrors.forEach((msg) => console.error(`- ${msg}`));
        process.exit(2);
    }
    if (mode === 'ai-judge') {
        const preKey = process.env.SKILL_EVAL_JUDGE_API_KEY || process.env.OPENAI_API_KEY || '';
        if (!preKey) {
            console.error('- Missing SKILL_EVAL_JUDGE_API_KEY or OPENAI_API_KEY for --mode ai-judge');
            process.exit(2);
        }
    }
    const rows = [];
    for (let index = 0; index < cases.length; index++) {
        const testCase = cases[index];
        const spec = specBySkill.get(testCase.skill);
        const h = evalOutputFormatCaseHeuristic(testCase.response, spec);
        if (mode === 'heuristic') {
            rows.push({
                id: testCase.id || `case-${index + 1}`,
                skill: testCase.skill,
                prompt: testCase.prompt,
                pass: h.pass,
                note: testCase.note || null,
                evalMode: mode,
                missingSections: h.missingSections,
                orderOk: h.orderOk,
                codeFenceOk: h.codeFenceOk,
                requireCodeFence: Boolean(spec.require_code_fence),
                heuristicPass: h.pass,
            });
            continue;
        }
        const judged = await judgeOutputFormatWithLlm({
            skill: testCase.skill,
            prompt: testCase.prompt,
            response: testCase.response,
            spec,
        });
        if (!judged.ok) {
            rows.push({
                id: testCase.id || `case-${index + 1}`,
                skill: testCase.skill,
                prompt: testCase.prompt,
                pass: false,
                note: testCase.note || null,
                evalMode: mode,
                missingSections: h.missingSections,
                orderOk: h.orderOk,
                codeFenceOk: h.codeFenceOk,
                requireCodeFence: Boolean(spec.require_code_fence),
                heuristicPass: h.pass,
                judgeRationale: null,
                judgeError: judged.error,
            });
            continue;
        }
        const j = judged.judge;
        const jMissing = Array.isArray(j.missing_sections) ? j.missing_sections : [];
        const jOrder = typeof j.section_order_ok === 'boolean' ? j.section_order_ok : h.orderOk;
        const jFence = typeof j.code_fence_ok === 'boolean' ? j.code_fence_ok : h.codeFenceOk;
        const aiPass = Boolean(j.pass);
        rows.push({
            id: testCase.id || `case-${index + 1}`,
            skill: testCase.skill,
            prompt: testCase.prompt,
            pass: aiPass,
            note: testCase.note || null,
            evalMode: mode,
            missingSections: h.missingSections,
            orderOk: h.orderOk,
            codeFenceOk: h.codeFenceOk,
            requireCodeFence: Boolean(spec.require_code_fence),
            heuristicPass: h.pass,
            judgeRationale: typeof j.brief_rationale === 'string' ? j.brief_rationale : null,
            judgeError: null,
            judgeMissingSections: jMissing,
            judgeOrderOk: jOrder,
            judgeCodeFenceOk: jFence,
        });
    }
    const summary = {
        mode,
        total: rows.length,
        pass: rows.filter((row) => row.pass).length,
        fail: rows.filter((row) => !row.pass).length,
        missingSections: rows.filter((row) => row.missingSections.length > 0).length,
        wrongOrder: rows.filter((row) => row.missingSections.length === 0 && !row.orderOk).length,
        missingCodeFence: rows.filter((row) => row.requireCodeFence && !row.codeFenceOk).length,
        judgeErrors: rows.filter((row) => Boolean(row.judgeError)).length,
        coverage: Number(((rows.filter((row) => row.pass).length / rows.length) * 100).toFixed(1)),
    };
    if (asJson) {
        console.log(JSON.stringify({ specs: relative(repoRoot, specPath), cases: relative(repoRoot, casesPath), summary, rows }, null, 2));
        if (strict && summary.fail > 0)
            process.exit(2);
        return;
    }
    if (asMarkdown) {
        console.log('# Skill output format eval\n');
        console.log(`Mode: **${mode}**`);
        console.log(`Specs: \`${relative(repoRoot, specPath)}\``);
        console.log(`Cases: \`${relative(repoRoot, casesPath)}\``);
        console.log(`Pass: **${summary.pass}/${summary.total}** (${summary.coverage}%)\n`);
        if (mode === 'ai-judge') {
            console.log('| Case | Skill | Pass | Heuristic | Judge missing | Judge order | Judge code | Rationale / error |');
            console.log('|---|---|---|---|---|---|---|---|');
            rows.forEach((row) => {
                const rat = (row.judgeError || row.judgeRationale || '—').replace(/\|/g, '\\|');
                const jm = (row.judgeMissingSections ?? []).join(', ') || '—';
                console.log(`| \`${row.id}\` | \`${row.skill}\` | ${row.pass ? 'yes' : 'no'} | ${row.heuristicPass ? 'yes' : 'no'} | ${jm} | ${row.judgeOrderOk === false ? 'bad' : 'ok'} | ${row.requireCodeFence ? (row.judgeCodeFenceOk ? 'ok' : 'bad') : 'n/a'} | ${rat} |`);
            });
        }
        else {
            console.log('| Case | Skill | Pass | Missing sections | Order | Code |');
            console.log('|---|---|---|---|---|---|');
            rows.forEach((row) => {
                console.log(`| \`${row.id}\` | \`${row.skill}\` | ${row.pass ? 'yes' : 'no'} | ${row.missingSections.join(', ') || '—'} | ${row.orderOk ? 'ok' : 'bad'} | ${row.requireCodeFence ? (row.codeFenceOk ? 'ok' : 'missing') : 'n/a'} |`);
            });
        }
        if (strict && summary.fail > 0)
            process.exit(2);
        return;
    }
    console.log(chalk.bold('Skill output format eval'));
    console.log(chalk.dim(`  mode ${mode}`));
    console.log(chalk.dim(`  specs ${relative(repoRoot, specPath)}`));
    console.log(chalk.dim(`  cases ${relative(repoRoot, casesPath)}`));
    console.log(chalk.dim(`  total ${summary.total}  ·  pass ${summary.pass}  ·  fail ${summary.fail}  ·  coverage ${summary.coverage}%`));
    console.log('');
    console.log(`  ${chalk.green('pass'.padEnd(24))} ${chalk.bold(String(summary.pass))}`);
    console.log(`  ${chalk.red('fail'.padEnd(24))} ${chalk.bold(String(summary.fail))}`);
    console.log(`  ${chalk.yellow('missing sections'.padEnd(24))} ${chalk.bold(String(summary.missingSections))}`);
    console.log(`  ${chalk.yellow('wrong section order'.padEnd(24))} ${chalk.bold(String(summary.wrongOrder))}`);
    console.log(`  ${chalk.yellow('missing code fence'.padEnd(24))} ${chalk.bold(String(summary.missingCodeFence))}`);
    if (mode === 'ai-judge') {
        console.log(`  ${chalk.yellow('judge transport errors'.padEnd(24))} ${chalk.bold(String(summary.judgeErrors))}`);
    }
    const failures = rows.filter((row) => !row.pass);
    if (failures.length > 0) {
        console.log('');
        failures.forEach((row) => {
            console.log(`  ${chalk.red('FAIL')}  ${chalk.cyan(row.skill)}  ${chalk.dim(row.id)}`);
            console.log(`        ${chalk.dim(row.prompt)}`);
            if (row.judgeError)
                console.log(`        judge: ${chalk.red(row.judgeError)}`);
            if (mode === 'ai-judge' && row.judgeRationale)
                console.log(`        rationale: ${chalk.dim(row.judgeRationale)}`);
            if (row.missingSections.length > 0)
                console.log(`        heuristic missing: ${chalk.dim(row.missingSections.join(', '))}`);
            if (!row.orderOk)
                console.log(`        heuristic order: ${chalk.dim('section labels out of order')}`);
            if (row.requireCodeFence && !row.codeFenceOk)
                console.log(`        heuristic code: ${chalk.dim('required code fence missing')}`);
        });
    }
    if (strict && summary.fail > 0)
        process.exit(2);
}
function cmdBuildSkillIndex(args, repoRoot) {
    const cfg = loadKbConfig(repoRoot);
    const output = resolve(repoRoot, String(args.output || cfg.skillIndexPath));
    const withEmbeddings = Boolean(args['with-embeddings']);
    const dry = Boolean(args['dry-run']);
    const rows = loadRoutingSkillRows(repoRoot, false);
    const dirs = listSkillDirs(repoRoot, false);
    if (dry) {
        console.log(JSON.stringify(rows, null, 2));
        return;
    }
    mkdirSync(join(output, '..'), { recursive: true });
    writeFileSync(output, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
    // Domain breakdown
    const byDomain = {};
    for (const dir of dirs) {
        const raw = readFileSync(join(dir, 'SKILL.md'), 'utf8');
        const meta = (matter(raw).data.metadata ?? {});
        const domain = meta.domain ?? 'uncategorized';
        byDomain[domain] = (byDomain[domain] ?? 0) + 1;
    }
    const domainLine = Object.entries(byDomain)
        .sort((a, b) => b[1] - a[1])
        .map(([d, n]) => `${chalk.cyan(d)} ${chalk.bold(String(n))}`)
        .join(chalk.dim('  ·  '));
    console.log(`${chalk.green('✔')} ${chalk.bold(String(rows.length))} skills → ${chalk.dim(relative(repoRoot, output))}`);
    console.log(chalk.dim(`  ${domainLine}`));
    if (withEmbeddings) {
        const vectors = rows.map((r) => embedText(`${r.name}\n${r.description}\n${r.triggers.join(', ')}`));
        const embPath = resolve(repoRoot, cfg.skillEmbeddingsPath);
        mkdirSync(join(embPath, '..'), { recursive: true });
        writeFileSync(embPath, `${JSON.stringify(vectors)}\n`, 'utf8');
        console.log(chalk.dim(`  embeddings → ${relative(repoRoot, embPath)}`));
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
    const tierBadge = (t) => t === 'strong' ? chalk.green('strong ') :
        t === 'consider' ? chalk.yellow('consider') :
            chalk.red('low    ');
    if (md) {
        console.log('# Skills analysis\n');
        console.log('| Skill | Tier | Score | Refs | Recommendation |');
        console.log('|---|---|---:|---:|---|');
        outRows.forEach((r) => console.log(`| \`${r.skill}\` | ${r.tier} | ${r.score} | ${r.references} | ${r.recommendation} |`));
        const counts = { strong: 0, consider: 0, low: 0 };
        for (const r of rows)
            counts[r.tier]++;
        console.log(`\n**Total:** ${rows.length}  |  strong: ${counts.strong}  consider: ${counts.consider}  low: ${counts.low}`);
        return;
    }
    const maxLen = Math.max(...outRows.map((r) => r.skill.length));
    for (const r of outRows) {
        const refs = r.references > 0 ? chalk.dim(`${r.references} refs`) : chalk.red('no refs');
        console.log(`  ${tierBadge(r.tier)}  ${chalk.cyan(r.skill.padEnd(maxLen))}  ${refs}`);
    }
    const counts = { strong: 0, consider: 0, low: 0 };
    for (const r of rows)
        counts[r.tier]++;
    console.log(chalk.dim(`\n  ${rows.length} skills  ·  ${counts.strong} strong  ${counts.consider} consider  ${counts.low} low`));
}
const STRUCTURAL_SECTION_CHECKS = [
    { key: 'boundary', label: 'Boundary', pattern: /^## Boundary$/m },
    { key: 'when_to_use', label: 'When to use', pattern: /^## When to use$/m },
    { key: 'workflow', label: 'Workflow', pattern: /^## Workflow$/m },
    { key: 'operating_principles', label: 'Operating principles', pattern: /^### Operating principles$/m },
    { key: 'suggested_response_format', label: 'Suggested response format', pattern: /^## Suggested response format(?:\b.*)?$/m },
    { key: 'resources', label: 'Resources in this skill', pattern: /^## Resources in this skill$/m },
    { key: 'quick_example', label: 'Quick example', pattern: /^## Quick example$/m },
    { key: 'checklist', label: 'Checklist before calling the skill done', pattern: /^## Checklist before calling the skill done$/m },
];
function cmdAuditSkillStructure(args, repoRoot) {
    const includeTemplate = Boolean(args['include-template']);
    const asJson = Boolean(args.json);
    const asMarkdown = Boolean(args.markdown);
    const onlyActionable = Boolean(args['only-actionable']);
    const strict = Boolean(args.strict);
    const dirs = listSkillDirs(repoRoot, includeTemplate);
    const rows = dirs.map((dir) => {
        const info = readSkillInfo(dir);
        const content = info.content || '';
        const missing = STRUCTURAL_SECTION_CHECKS.filter((section) => !section.pattern.test(content)).map((section) => section.label);
        return {
            skill: info.folder,
            missing,
            missingCount: missing.length,
            isComplete: missing.length === 0,
        };
    });
    const outRows = onlyActionable ? rows.filter((row) => !row.isComplete) : rows;
    const missingBySection = STRUCTURAL_SECTION_CHECKS.map((section) => ({
        label: section.label,
        count: rows.filter((row) => row.missing.includes(section.label)).length,
    }));
    const incompleteCount = rows.filter((row) => !row.isComplete).length;
    if (asJson) {
        console.log(JSON.stringify({
            totalSkills: rows.length,
            incompleteSkills: incompleteCount,
            missingBySection,
            rows: outRows,
        }, null, 2));
        if (strict && incompleteCount > 0)
            process.exit(2);
        return;
    }
    if (asMarkdown) {
        console.log('# Skill structure audit\n');
        console.log(`Total skills: **${rows.length}**`);
        console.log(`Incomplete skills: **${incompleteCount}**\n`);
        console.log('## Missing sections by type\n');
        console.log('| Section | Missing skills |');
        console.log('|---|---:|');
        missingBySection.forEach((section) => console.log(`| ${section.label} | ${section.count} |`));
        console.log('\n## Skill results\n');
        console.log('| Skill | Missing count | Missing sections |');
        console.log('|---|---:|---|');
        outRows.forEach((row) => console.log(`| \`${row.skill}\` | ${row.missingCount} | ${row.missing.length ? row.missing.join(', ') : '—'} |`));
        if (strict && incompleteCount > 0)
            process.exit(2);
        return;
    }
    const maxLen = Math.max(...outRows.map((row) => row.skill.length), 'Skill'.length);
    console.log(chalk.bold('Skill structure audit'));
    console.log(chalk.dim(`  total ${rows.length}  ·  incomplete ${incompleteCount}  ·  complete ${rows.length - incompleteCount}`));
    console.log('');
    missingBySection.forEach((section) => {
        const color = section.count === 0 ? chalk.green :
            section.count <= 5 ? chalk.yellow :
                chalk.red;
        console.log(`  ${color(section.label.padEnd(36))} ${chalk.bold(String(section.count))}`);
    });
    if (outRows.length > 0) {
        console.log('');
        outRows
            .sort((a, b) => b.missingCount - a.missingCount || a.skill.localeCompare(b.skill))
            .forEach((row) => {
            const badge = row.isComplete ? chalk.green('OK ') : chalk.red('MISS');
            console.log(`  ${badge}  ${chalk.cyan(row.skill.padEnd(maxLen))}  ${chalk.dim(row.missing.join(', ') || '—')}`);
        });
    }
    if (strict && incompleteCount > 0)
        process.exit(2);
}
function cmdInstallSkill(args, _repoRoot) {
    const skillPath = args._?.[1] ? String(args._[1]) : String(args['skill-dir'] || '.');
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
    const q = String(args._?.[1] || '');
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
    const query = String(args._?.[1] || '');
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
    const filePath = String(args._?.[1] || '');
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
const DOMAIN_TAXONOMY = {
    'ui-framework': ['react-pro', 'nextjs-pro', 'react-native-pro', 'flutter-pro'],
    'ui-design': ['design-system-pro', 'mobile-design-pro', 'motion-design-pro', 'platform-design-pro', 'frontend-design-pro', 'ui-ux-system-pro', 'ui-design-brain-pro', 'ui-stack-pro', 'shadcn-mastery-pro', 'figma-mcp-pro', 'ui-reverse-engineer-pro'],
    'backend': ['nestjs-pro', 'api-design-pro', 'graphql-pro', 'microservices-pro', 'websocket-pro', 'stream-rtc-pro'],
    'devops': ['docker-pro', 'ci-cd-pro', 'deployment-pro', 'caching-pro', 'network-infra-pro', 'infrastructure-as-code-pro'],
    'database': ['postgresql-pro', 'sql-data-access-pro'],
    'language': ['typescript-pro', 'javascript-pro'],
    'quality': ['testing-pro', 'test-driven-development-pro', 'security-pro', 'performance-tuning-pro', 'clean-code-architecture-pro', 'systematic-debugging-pro'],
    'planning': ['planning-pro', 'writing-plans-pro', 'executing-plans-pro', 'brainstorming-pro', 'to-prd-pro', 'to-issues-pro', 'grill-me-pro', 'business-analysis-pro'],
    'meta-coding': ['karpathy-coding-pro', 'git-operations-pro', 'algorithm-pro', 'cli-pro', 'code-packaging-pro'],
    'meta': ['router-pro', 'skills-self-review-pro', 'skill-creator-pro', 'repo-tooling-pro', 'self-improve-agent-pro', 'parallel-agents-pro', 'feedback-pro', 'sync-custom-to-repo', 'bug-discovery-pro'],
    'analysis': ['data-analysis-pro', 'content-analysis-pro', 'web-research-pro', 'market-research-pro', 'strategic-consulting-pro', 'ocr-pro', 'image-processing-pro', 'seo-pro'],
    'desktop-mobile': ['electron-pro', 'tauri-pro'],
    'ai': ['ai-integration-pro'],
    'auth': ['auth-pro'],
};
function cmdGenerateGapAnalysis(args, repoRoot) {
    const outPath = resolve(repoRoot, 'knowledge-base', 'documents', 'repo', 'PROJECT_GAP_ANALYSIS.md');
    const dirs = listSkillDirs(repoRoot, false);
    const today = new Date().toISOString().slice(0, 10);
    // Read full frontmatter for each skill
    const skills = dirs.map((dir) => {
        const skillMd = join(dir, 'SKILL.md');
        const raw = readFileSync(skillMd, 'utf8');
        const parsed = matter(raw);
        const meta = (parsed.data.metadata ?? {});
        return {
            folder: basename(dir),
            name: parsed.data.name ?? basename(dir),
            domain: meta.domain ?? 'uncategorized',
            level: meta.level ?? 'unknown',
            hasRefs: existsSync(join(dir, 'references')),
        };
    });
    // Group by domain (from actual frontmatter)
    const byDomain = {};
    for (const s of skills) {
        (byDomain[s.domain] ??= []).push(s.folder);
    }
    // Cross-reference against taxonomy — check by folder existence, not frontmatter domain match
    const skillFolders = new Set(skills.map((s) => s.folder));
    const taxonomyDomains = Object.keys(DOMAIN_TAXONOMY);
    const gapsByDomain = [];
    for (const domain of taxonomyDomains) {
        const expected = DOMAIN_TAXONOMY[domain];
        const missing = expected.filter((s) => !skillFolders.has(s));
        if (missing.length > 0)
            gapsByDomain.push({ domain, expected, missing });
    }
    // Skills not in taxonomy at all
    const allTaxonomySkills = new Set(Object.values(DOMAIN_TAXONOMY).flat());
    const untaxonomized = skills.map((s) => s.folder).filter((f) => !allTaxonomySkills.has(f));
    // Skills without references/
    const noRefs = skills.filter((s) => !s.hasRefs).map((s) => s.folder);
    // Build markdown report
    const lines = [
        `# Project Gap Analysis`,
        ``,
        `Generated: ${today}  `,
        `Total skills: **${skills.length}**`,
        ``,
        `---`,
        ``,
        `## Coverage by domain`,
        ``,
        `| Domain | Count | Skills |`,
        `|--------|------:|--------|`,
    ];
    const allDomains = [...new Set([...Object.keys(byDomain), ...taxonomyDomains])].sort();
    for (const d of allDomains) {
        const list = (byDomain[d] ?? []).sort();
        lines.push(`| \`${d}\` | ${list.length} | ${list.join(', ') || '—'} |`);
    }
    lines.push(``, `---`, ``, `## Taxonomy gaps (expected but missing)`);
    if (gapsByDomain.length === 0) {
        lines.push(``, `_No taxonomy gaps — all expected skills are present._`);
    }
    else {
        lines.push(``);
        for (const { domain, missing } of gapsByDomain) {
            lines.push(`### \`${domain}\``, ``);
            for (const m of missing)
                lines.push(`- [ ] \`${m}\` — not found`);
            lines.push(``);
        }
    }
    lines.push(`---`, ``, `## Skills not in taxonomy (new or uncategorized)`);
    if (untaxonomized.length === 0) {
        lines.push(``, `_All skills are in the taxonomy._`);
    }
    else {
        lines.push(``);
        for (const s of untaxonomized.sort())
            lines.push(`- \`${s}\` — add to DOMAIN_TAXONOMY in tools.ts`);
    }
    lines.push(``, `---`, ``, `## Skills without references/ folder`);
    if (noRefs.length === 0) {
        lines.push(``, `_All skills have a \`references/\` folder._`);
    }
    else {
        lines.push(``);
        for (const s of noRefs.sort())
            lines.push(`- \`${s}\``);
    }
    lines.push(``, `---`, ``, `## Suggested improvements`);
    const suggestions = [];
    if (gapsByDomain.length > 0)
        suggestions.push(`Add ${gapsByDomain.reduce((n, g) => n + g.missing.length, 0)} missing skills from taxonomy gaps above.`);
    if (untaxonomized.length > 0)
        suggestions.push(`Register ${untaxonomized.length} untaxonomized skill(s) in DOMAIN_TAXONOMY in \`src/tools.ts\`.`);
    if (noRefs.length > 0)
        suggestions.push(`Add \`references/\` folders to ${noRefs.length} skill(s) without one.`);
    if (suggestions.length === 0)
        suggestions.push(`No gaps detected — re-run quarterly or after adding 5+ skills.`);
    lines.push(``);
    suggestions.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
    lines.push(``);
    const content = lines.join('\n');
    if (Boolean(args['dry-run'])) {
        console.log(content);
        return;
    }
    mkdirSync(join(outPath, '..'), { recursive: true });
    writeFileSync(outPath, content, 'utf8');
    console.log(`${chalk.green('✔')} Gap analysis → ${chalk.dim(relative(repoRoot, outPath))}`);
    console.log(chalk.dim(`  ${skills.length} skills  ·  ${Object.keys(byDomain).length} domains`));
    if (gapsByDomain.length > 0) {
        console.log(chalk.yellow(`\n  Taxonomy gaps (${gapsByDomain.length} domain${gapsByDomain.length > 1 ? 's' : ''}):`));
        for (const { domain, missing } of gapsByDomain) {
            console.log(`    ${chalk.yellow(domain)}: ${missing.map((m) => chalk.dim(m)).join(', ')}`);
        }
    }
    else {
        console.log(chalk.green('  No taxonomy gaps.'));
    }
    if (untaxonomized.length > 0) {
        console.log(chalk.yellow(`\n  Unregistered in taxonomy (${untaxonomized.length}):`));
        for (const s of untaxonomized)
            console.log(`    ${chalk.dim(s)}`);
    }
    if (noRefs.length > 0) {
        console.log(chalk.yellow(`\n  Missing references/ (${noRefs.length}):`));
        for (const s of noRefs)
            console.log(`    ${chalk.dim(s)}`);
    }
}
function help() {
    console.log(`
${chalk.bold.cyan('devkit tools')} ${chalk.dim('— skill authoring & knowledge base CLI')}
${chalk.dim('Usage:')} node dist/tools.js ${chalk.yellow('<command>')} ${chalk.dim('[options]')}

${chalk.bold('SKILLS')}
  ${chalk.yellow('list-skills')}           List all skills  ${chalk.dim('[--include-template] [--json]')}
  ${chalk.yellow('validate-skills')}       Check frontmatter correctness  ${chalk.dim('[--include-template]')}
  ${chalk.yellow('audit-skill-structure')} Check required skill sections  ${chalk.dim('[--markdown|--json] [--only-actionable] [--strict]')}
  ${chalk.yellow('eval-skill-routing')}    Run trigger-based routing evals  ${chalk.dim('[--file <json>] [--markdown|--json] [--strict] — cases: expected_skill | expected_any_of, hard_negative_skills')}
  ${chalk.yellow('eval-skill-output-format')} Check golden responses against format specs  ${chalk.dim('[--spec <json>] [--file <json>] [--mode heuristic|ai-judge] [--markdown|--json] [--strict]')}
  ${chalk.yellow('build-skill-index')}     Rebuild skill_index.json  ${chalk.dim('[--output <path>] [--with-embeddings] [--dry-run]')}
  ${chalk.yellow('analyze-skills')}        Audit skill quality  ${chalk.dim('[--markdown|--self-review] [--only-actionable] [--json]')}
  ${chalk.yellow('install-skill')}         Install one skill  ${chalk.dim('<path> [--project-dir] [--mode symlink|copy] [--all-ides]')}
  ${chalk.yellow('generate-gap-analysis')} Regenerate domain coverage report  ${chalk.dim('[--dry-run]')}

${chalk.bold('BUNDLE')}
  ${chalk.yellow('verify-bundle-install')} Check installed bundle integrity  ${chalk.dim('[--project-dir] [--strict]')}

${chalk.bold('KNOWLEDGE BASE')}
  ${chalk.yellow('build-kb')}              Chunk & embed documents  ${chalk.dim('[--dry-run]')}
  ${chalk.yellow('query-kb')}              Semantic search  ${chalk.dim('"<query>" [-k 5] [--index <dir>]')}
  ${chalk.yellow('query-kb-batch')}        Batch queries  ${chalk.dim('[-q "..."]... [-f file] [--json]')}
  ${chalk.yellow('verify-kb')}             Validate KB integrity

${chalk.bold('CODE GRAPH')}
  ${chalk.yellow('index-project')}         Index a codebase  ${chalk.dim('[--dir <path>] [--out <path>] [--include <globs>]')}
  ${chalk.yellow('generate-wiki')}         Auto-generate wiki  ${chalk.dim('[--docs <dir>] [--out <dir>]')}
  ${chalk.yellow('build-graph')}           Build symbol dependency graph  ${chalk.dim('[--dir <path>] [--dry-run]')}
  ${chalk.yellow('query-graph')}           Search graph  ${chalk.dim('<query> [--mode search|callers|callees]')}
  ${chalk.yellow('impact-analysis')}       Blast radius of a file change  ${chalk.dim('<file-path>')}

${chalk.bold('EXAMPLES')}
  ${chalk.dim('# After adding a new skill:')}
  node dist/tools.js validate-skills
  node dist/tools.js audit-skill-structure --strict
  node dist/tools.js eval-skill-routing --strict
  node dist/tools.js eval-skill-output-format --strict
  ${chalk.dim('# AI judge (OpenAI-compatible): SKILL_EVAL_JUDGE_API_KEY or OPENAI_API_KEY; optional SKILL_EVAL_JUDGE_BASE_URL, SKILL_EVAL_JUDGE_MODEL')}
  node dist/tools.js eval-skill-output-format --mode ai-judge --markdown
  node dist/tools.js build-skill-index

  ${chalk.dim('# Audit quality:')}
  node dist/tools.js analyze-skills --self-review

  ${chalk.dim('# Refresh gap report:')}
  node dist/tools.js generate-gap-analysis

  ${chalk.dim('# Semantic search over KB:')}
  node dist/tools.js query-kb "how do I handle auth tokens"
`);
}
async function main() {
    const args = parseArgs(process.argv.slice(2), {
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
    const cmd = String(args._?.[0] || '');
    const root = process.cwd();
    switch (cmd) {
        case 'list-skills':
            cmdListSkills(args, root);
            break;
        case 'validate-skills':
            cmdValidateSkills(args, root);
            break;
        case 'audit-skill-structure':
            cmdAuditSkillStructure(args, root);
            break;
        case 'eval-skill-routing':
            cmdEvalSkillRouting(args, root);
            break;
        case 'eval-skill-output-format':
            await cmdEvalSkillOutputFormat(args, root);
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
        case 'generate-gap-analysis':
            cmdGenerateGapAnalysis(args, root);
            break;
        default:
            help();
            process.exit(cmd ? 1 : 0);
    }
}
main().catch((e) => {
    console.error(e.message);
    process.exit(1);
});
