/**
 * Graph analysis for code relationships
 * Lightweight implementation using regex parsing
 */
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { relative } from 'node:path';
import { globSync } from 'glob';
// Supported file extensions
const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py', '.go', '.java', '.rs'];
const PATTERNS = {
    typescript: {
        function: /(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(|(\w+)\s*\([^)]*\)\s*{/g,
        class: /(?:export\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?/g,
        method: /(\w+)\s*\([^)]*\)\s*{/g,
        import: /import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/g,
        call: /(\w+)\s*\(/g,
    },
    python: {
        function: /def\s+(\w+)\s*\(/g,
        class: /class\s+(\w+)(?:\([^)]*\))?/g,
        import: /(?:from\s+(\S+)\s+)?import\s+([^\n]+)/g,
        call: /(\w+)\s*\(/g,
    },
    go: {
        function: /func\s+(?:\([^)]*\)\s+)?(\w+)\s*\(/g,
        struct: /type\s+(\w+)\s+struct/g,
        import: /import\s+["']([^"']+)["']/g,
        call: /(\w+)\s*\(/g,
    },
    rust: {
        function: /fn\s+(\w+)\s*\(/g,
        struct: /struct\s+(\w+)/g,
        impl: /impl(?:\s+\w+)?\s+for\s+(\w+)|impl\s+(\w+)/g,
        use: /use\s+([^;]+)/g,
        call: /(\w+)\s*\(/g,
    },
};
function getFileExtension(file) {
    return file.slice(file.lastIndexOf('.'));
}
function isCodeFile(file) {
    return CODE_EXTENSIONS.includes(getFileExtension(file));
}
function getLanguage(file) {
    const ext = getFileExtension(file);
    const langMap = {
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.js': 'typescript',
        '.jsx': 'typescript',
        '.mjs': 'typescript',
        '.cjs': 'typescript',
        '.py': 'python',
        '.go': 'go',
        '.rs': 'rust',
    };
    return langMap[ext] || null;
}
function parseFile(filePath, baseDir) {
    const nodes = [];
    const edges = [];
    if (!existsSync(filePath))
        return { nodes, edges };
    const content = readFileSync(filePath, 'utf8');
    const lang = getLanguage(filePath);
    const relativePath = relative(baseDir, filePath);
    if (!lang)
        return { nodes, edges };
    const patterns = PATTERNS[lang];
    const lines = content.split('\n');
    // Track defined symbols in this file for call resolution
    const localSymbols = new Set();
    // Parse functions
    const funcPattern = patterns.function;
    if (funcPattern) {
        const funcRegex = new RegExp(funcPattern.source, 'g');
        let match;
        while ((match = funcRegex.exec(content)) !== null) {
            const name = match[1] || match[2] || match[3];
            if (name && !localSymbols.has(name)) {
                localSymbols.add(name);
                const line = content.substring(0, match.index).split('\n').length;
                const nodeId = `${relativePath}#${name}`;
                nodes.push({
                    id: nodeId,
                    type: 'function',
                    name,
                    file: relativePath,
                    line,
                });
            }
        }
    }
    // Parse classes
    const classPattern = patterns.class;
    if (classPattern) {
        const classRegex = new RegExp(classPattern.source, 'g');
        let match;
        while ((match = classRegex.exec(content)) !== null) {
            const name = match[1];
            if (name && !localSymbols.has(name)) {
                localSymbols.add(name);
                const line = content.substring(0, match.index).split('\n').length;
                const nodeId = `${relativePath}#${name}`;
                nodes.push({
                    id: nodeId,
                    type: 'class',
                    name,
                    file: relativePath,
                    line,
                });
                // Check for extends
                if (match[2]) {
                    edges.push({
                        from: nodeId,
                        to: match[2],
                        type: 'extends',
                    });
                }
            }
        }
    }
    // Parse imports (handle different property names)
    const importPattern = patterns.import || patterns.use;
    if (importPattern) {
        const importRegex = new RegExp(importPattern.source, 'g');
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const line = content.substring(0, match.index).split('\n').length;
            // Handle different import formats
            if (match[1]) {
                // from X import { a, b }
                const imports = match[1].split(',').map(s => s.trim()).filter(Boolean);
                imports.forEach(imp => {
                    edges.push({
                        from: relativePath,
                        to: imp,
                        type: 'imports',
                    });
                });
            }
            else if (match[2]) {
                // import X from 'Y'
                edges.push({
                    from: relativePath,
                    to: match[2],
                    type: 'imports',
                });
            }
        }
    }
    // Parse function calls (simple heuristic)
    if (patterns.call) {
        const callPattern = new RegExp(patterns.call.source, 'g');
        let match;
        const seenCalls = new Set();
        while ((match = callPattern.exec(content)) !== null) {
            const callName = match[1];
            // Filter out common non-function patterns
            if (callName &&
                !['if', 'for', 'while', 'switch', 'catch', 'console', 'Math', 'JSON', 'Object', 'Array', 'String', 'Number'].includes(callName) &&
                localSymbols.has(callName) &&
                !seenCalls.has(callName)) {
                seenCalls.add(callName);
                // Find which function contains this call
                const pos = match.index;
                const lineNum = content.substring(0, pos).split('\n').length;
                const containingFunc = findContainingFunction(content, pos, nodes);
                if (containingFunc) {
                    edges.push({
                        from: containingFunc,
                        to: `${relativePath}#${callName}`,
                        type: 'calls',
                    });
                }
            }
        }
    }
    return { nodes, edges };
}
function findContainingFunction(content, pos, nodes) {
    // Simple heuristic: find the closest function before pos
    const before = content.substring(0, pos);
    const lines = before.split('\n');
    // Look for function declaration patterns going backward
    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        const funcMatch = line.match(/function\s+(\w+)|def\s+(\w+)|fn\s+(\w+)|func\s+(?:\([^)]*\)\s+)?(\w+)/);
        if (funcMatch) {
            const name = funcMatch[1] || funcMatch[2] || funcMatch[3] || funcMatch[4];
            const node = nodes.find(n => n.name === name);
            if (node)
                return node.id;
        }
    }
    return null;
}
export function buildGraph(baseDir, includePatterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.py', '**/*.go', '**/*.rs'], ignorePatterns = ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/.venv/**']) {
    const graph = { nodes: [], edges: [] };
    const fileSet = new Set();
    for (const pattern of includePatterns) {
        const matches = globSync(pattern, {
            cwd: baseDir,
            absolute: true,
            nodir: true,
            ignore: ignorePatterns,
        });
        matches.forEach(f => fileSet.add(f));
    }
    const files = [...fileSet].sort();
    for (const file of files) {
        if (!isCodeFile(file))
            continue;
        const { nodes, edges } = parseFile(file, baseDir);
        graph.nodes.push(...nodes);
        graph.edges.push(...edges);
    }
    return graph;
}
export function saveGraph(graph, outputPath) {
    writeFileSync(outputPath, JSON.stringify(graph, null, 2), 'utf8');
}
export function loadGraph(graphPath) {
    if (!existsSync(graphPath)) {
        throw new Error(`Graph file not found: ${graphPath}`);
    }
    return JSON.parse(readFileSync(graphPath, 'utf8'));
}
export function queryGraph(graph, query) {
    const lowerQuery = query.toLowerCase();
    return graph.nodes.filter(n => n.name.toLowerCase().includes(lowerQuery) ||
        n.file.toLowerCase().includes(lowerQuery));
}
export function getCallers(graph, symbolName) {
    const targetIds = graph.nodes
        .filter(n => n.name === symbolName)
        .map(n => n.id);
    const callerIds = new Set();
    for (const edge of graph.edges) {
        if (edge.type === 'calls' && targetIds.includes(edge.to)) {
            callerIds.add(edge.from);
        }
    }
    return graph.nodes.filter(n => callerIds.has(n.id));
}
export function getCallees(graph, symbolName) {
    const targetIds = graph.nodes
        .filter(n => n.name === symbolName)
        .map(n => n.id);
    const calleeIds = new Set();
    for (const edge of graph.edges) {
        if (edge.type === 'calls' && targetIds.includes(edge.from)) {
            calleeIds.add(edge.to);
        }
    }
    return graph.nodes.filter(n => calleeIds.has(n.id));
}
export function impactAnalysis(graph, filePath) {
    // Find all symbols defined in this file
    const fileSymbols = new Set(graph.nodes
        .filter(n => n.file === filePath)
        .map(n => n.id));
    // Find all nodes that depend on these symbols
    const impacted = new Set();
    for (const edge of graph.edges) {
        if (fileSymbols.has(edge.to) && edge.type !== 'imports') {
            impacted.add(edge.from);
        }
    }
    // Include transitive impacts
    let changed = true;
    while (changed) {
        changed = false;
        for (const edge of graph.edges) {
            if (impacted.has(edge.to) && !impacted.has(edge.from) && edge.type !== 'imports') {
                impacted.add(edge.from);
                changed = true;
            }
        }
    }
    return graph.nodes.filter(n => impacted.has(n.id));
}
