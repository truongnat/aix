/**
 * Tree-sitter based graph analysis for code relationships
 * Provides accurate AST-based parsing as an upgrade from regex parsing
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type TreeSitter from 'web-tree-sitter';
import { Parser, Language, Query } from 'web-tree-sitter';

// Types matching the regex-based graph module
export type NodeType = 'function' | 'class' | 'method' | 'import' | 'export' | 'interface' | 'type';

export interface GraphNode {
  id: string;
  type: NodeType;
  name: string;
  file: string;
  line: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: 'calls' | 'imports' | 'extends' | 'uses' | 'references';
}

export interface CodeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Language to WASM file mapping
const LANGUAGE_WASM_MAP: Record<string, string> = {
  typescript: 'tree-sitter-typescript.wasm',
  tsx: 'tree-sitter-tsx.wasm',
  javascript: 'tree-sitter-javascript.wasm',
  python: 'tree-sitter-python.wasm',
  go: 'tree-sitter-go.wasm',
  rust: 'tree-sitter-rust.wasm',
  java: 'tree-sitter-java.wasm',
  'c-sharp': 'tree-sitter-c-sharp.wasm',
  cpp: 'tree-sitter-cpp.wasm',
  php: 'tree-sitter-php.wasm',
  ruby: 'tree-sitter-ruby.wasm',
  bash: 'tree-sitter-bash.wasm',
  css: 'tree-sitter-css.wasm',
};

// File extension to language mapping
const EXT_LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'tsx',
  '.js': 'javascript',
  '.jsx': 'tsx',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.py': 'python',
  '.go': 'go',
  '.rs': 'rust',
  '.java': 'java',
  '.cs': 'c-sharp',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.hpp': 'cpp',
  '.php': 'php',
  '.rb': 'ruby',
  '.sh': 'bash',
  '.css': 'css',
};

let initialized = false;
const languageCache: Map<string, Language> = new Map();

function getWasmDir(): string {
  // Try to find the @vscode/tree-sitter-wasm package
  const possiblePaths = [
    join(process.cwd(), 'node_modules', '@vscode', 'tree-sitter-wasm', 'wasm'),
    join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'node_modules', '@vscode', 'tree-sitter-wasm', 'wasm'),
    '/Users/truongdev/Documents/projects/labs/skills/node_modules/@vscode/tree-sitter-wasm/wasm',
  ];

  for (const p of possiblePaths) {
    if (existsSync(p)) {
      return p;
    }
  }

  // Fallback: search from current working directory
  return join(process.cwd(), 'node_modules', '@vscode', 'tree-sitter-wasm', 'wasm');
}

export async function initTreeSitter(): Promise<boolean> {
  if (initialized) return true;

  try {
    await Parser.init();
    initialized = true;
    return true;
  } catch {
    return false;
  }
}

async function loadLanguage(lang: string): Promise<Language | null> {
  if (!initialized) return null;

  if (languageCache.has(lang)) {
    return languageCache.get(lang)!;
  }

  const wasmFile = LANGUAGE_WASM_MAP[lang];
  if (!wasmFile) return null;

  const wasmDir = getWasmDir();
  const wasmPath = join(wasmDir, wasmFile);

  if (!existsSync(wasmPath)) {
    return null;
  }

  try {
    const language = await Language.load(wasmPath);
    languageCache.set(lang, language);
    return language;
  } catch {
    return null;
  }
}

function getLanguage(file: string): string | null {
  const ext = file.slice(file.lastIndexOf('.'));
  return EXT_LANGUAGE_MAP[ext] || null;
}

function isCodeFile(file: string): boolean {
  const ext = file.slice(file.lastIndexOf('.'));
  return ext in EXT_LANGUAGE_MAP;
}

// Tree-sitter queries for different languages
// These are simplified queries that capture common code structures
const QUERIES: Record<string, string> = {
  typescript: `
    (function_declaration
      name: (identifier) @function.name
      parameters: (formal_parameters
        (required_parameter
          (identifier) @param.name))) @function

    (function_declaration
      name: (identifier) @method.name) @method

    (class_declaration
      name: (type_identifier) @class.name) @class

    (class_declaration
      name: (type_identifier) @class.name
      (class_heritage
        (extends_clause
          type: (type_identifier) @extends.name))) @class.extends

    (interface_declaration
      name: (type_identifier) @interface.name) @interface

    (type_alias_declaration
      name: (type_identifier) @typealias.name) @typealias

    (import_statement
      source: (string) @import.source) @import

    (import_statement
      (import_clause
        [(identifier) @import.default
         (named_imports
           (import_specifier
             name: (identifier) @import.named))])) @import.named

    (import_statement
      (import_clause
        (namespace_import
          name: (identifier) @import.namespace))) @import.namespace

    (call_expression
      function: (identifier) @call.name) @call

    (call_expression
      function: (member_expression
        object: (identifier) @call.object
        property: (property_identifier) @call.property)) @call.member

    (type_identifier) @type.reference
    (type_annotation
      type: (type_identifier) @type.name)) @type.annotation
  `,

  tsx: `
    (function_declaration
      name: (identifier) @function.name) @function

    (function_declaration
      name: (identifier) @method.name) @method

    (class_declaration
      name: (type_identifier) @class.name) @class

    (class_declaration
      name: (type_identifier) @class.name
      (class_heritage
        (extends_clause
          type: (type_identifier) @extends.name))) @class.extends

    (import_statement
      source: (string) @import.source) @import

    (call_expression
      function: (identifier) @call.name) @call

    (call_expression
      function: (member_expression
        object: (identifier) @call.object
        property: (property_identifier) @call.property)) @call.member
  `,

  javascript: `
    (function_declaration
      name: (identifier) @function.name) @function

    (class_declaration
      name: (identifier) @class.name) @class

    (class_declaration
      name: (identifier) @class.name
      (class_heritage
        (extends_clause
          value: (identifier) @extends.name))) @class.extends

    (import_statement
      source: (string) @import.source) @import

    (call_expression
      function: (identifier) @call.name) @call

    (call_expression
      function: (member_expression
        object: (identifier) @call.object
        property: (property_identifier) @call.property)) @call.member

    (arrow_function) @arrow

    (function_expression
      name: (identifier)? @function.name) @function.expr
  `,

  python: `
    (function_definition
      name: (identifier) @function.name) @function

    (class_definition
      name: (identifier) @class.name) @class

    (class_definition
      name: (identifier) @class.name
      (argument_list
        (identifier) @extends.name)) @class.extends

    (import_statement
      (dotted_name) @import.name) @import

    (import_from_statement
      module_name: (dotted_name) @import.from) @import

    (call
      function: (identifier) @call.name) @call

    (call
      function: (attribute
        object: (identifier) @call.object
        attribute: (identifier) @call.property)) @call.member
  `,

  go: `
    (function_declaration
      name: (identifier) @function.name) @function

    (method_declaration
      name: (field_identifier) @method.name) @method

    (type_declaration
      (type_spec
        name: (type_identifier) @class.name
        type: (struct_type))) @struct

    (import_declaration
      (import_spec
        path: (interpreted_string_literal) @import.path)) @import

    (call_expression
      function: (identifier) @call.name) @call

    (call_expression
      function: (selector_expression
        operand: (identifier) @call.object
        field: (field_identifier) @call.property)) @call.member
  `,

  rust: `
    (function_item
      name: (identifier) @function.name) @function

    (function_item
      name: (identifier) @method.name) @method

    (struct_item
      name: (type_identifier) @class.name) @struct

    (impl_item
      type: (type_identifier) @impl.type) @impl

    (use_declaration
      (use_list) @use.list) @use

    (use_declaration
      (scoped_identifier) @use.path) @use

    (call_expression
      function: (identifier) @call.name) @call

    (call_expression
      function: (field_expression
        value: (identifier) @call.object
        field: (field_identifier) @call.property)) @call.member
  `,

  java: `
    (method_declaration
      name: (identifier) @method.name) @method

    (class_declaration
      name: (identifier) @class.name) @class

    (class_declaration
      name: (identifier) @class.name
      (superclass
        (type_identifier) @extends.name)) @class.extends

    (import_declaration
      (scoped_identifier) @import.name) @import

    (method_invocation
      name: (identifier) @call.name) @call

    (method_invocation
      object: (identifier) @call.object
      name: (identifier) @call.property) @call.member
  `,
};

function getLineFromPosition(content: string, pos: number): number {
  return content.substring(0, pos).split('\n').length;
}

function createNodeId(file: string, name: string): string {
  return `${file}#${name}`;
}

export async function parseFileWithTreeSitter(
  filePath: string,
  baseDir: string
): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] } | null> {
  if (!initialized) {
    const ok = await initTreeSitter();
    if (!ok) return null;
  }

  const lang = getLanguage(filePath);
  if (!lang) return null;

  const language = await loadLanguage(lang);
  if (!language) return null;

  const queryStr = QUERIES[lang];
  if (!queryStr) return null;

  try {
    const content = readFileSync(filePath, 'utf8');
    const relativePath = relative(baseDir, filePath);

    const parser = new Parser();
    parser.setLanguage(language);

    const tree = parser.parse(content);
    if (!tree) return null;
    const rootNode = tree.rootNode;

    const query = new Query(language, queryStr);
    const captures = query.captures(rootNode);

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const localSymbols = new Set<string>();

    // Group captures by node for easier processing
    const nodeCaptures = new Map<TreeSitter.Node | null, Map<string, TreeSitter.Node[]>>();

    for (const capture of captures) {
      const tsNode: TreeSitter.Node = capture.node;
      const captureName: string = capture.name;

      if (!nodeCaptures.has(tsNode)) {
        nodeCaptures.set(tsNode, new Map());
      }
      const capMap = nodeCaptures.get(tsNode)!;
      if (!capMap.has(captureName)) {
        capMap.set(captureName, []);
      }
      capMap.get(captureName)!.push(tsNode);
    }

    // Process captures to extract symbols
    for (const [tsNode, caps] of nodeCaptures as Map<TreeSitter.Node, Map<string, TreeSitter.Node[]>>) {
      const startPos = tsNode.startIndex;
      const line = getLineFromPosition(content, startPos);

      // Functions
      if (caps.has('function.name') || caps.has('method.name')) {
        const nameNode = caps.get('function.name')?.[0] || caps.get('method.name')?.[0];
        if (nameNode) {
          const name = nameNode.text;
          const type = caps.has('method.name') ? 'method' : 'function';
          const nodeId = createNodeId(relativePath, name);

          if (!localSymbols.has(name)) {
            localSymbols.add(name);
            nodes.push({
              id: nodeId,
              type: type as NodeType,
              name,
              file: relativePath,
              line,
            });
          }
        }
      }

      // Classes
      if (caps.has('class.name')) {
        const nameNode = caps.get('class.name')![0];
        if (nameNode) {
          const name = nameNode.text;
          const nodeId = createNodeId(relativePath, name);

          if (!localSymbols.has(name)) {
            localSymbols.add(name);
            nodes.push({
              id: nodeId,
              type: 'class',
              name,
              file: relativePath,
              line,
            });
          }

          // Extends
          if (caps.has('extends.name')) {
            const extendsNode = caps.get('extends.name')![0];
            edges.push({
              from: nodeId,
              to: extendsNode.text,
              type: 'extends',
            });
          }
        }
      }

      // Imports - capture for cross-file resolution
      if (caps.has('import.source')) {
        const sourceNode = caps.get('import.source')![0];
        const importPath = sourceNode.text.replace(/['"]/g, '');

        // Store import for cross-file resolution
        edges.push({
          from: relativePath,
          to: importPath,
          type: 'imports',
        });

        // Capture default import
        if (caps.has('import.default')) {
          const defaultNode = caps.get('import.default')![0];
          localSymbols.add(defaultNode.text);
        }

        // Capture named imports
        if (caps.has('import.named')) {
          const namedNodes = caps.get('import.named')!;
          for (const namedNode of namedNodes) {
            localSymbols.add(namedNode.text);
          }
        }

        // Capture namespace imports
        if (caps.has('import.namespace')) {
          const namespaceNode = caps.get('import.namespace')![0];
          localSymbols.add(namespaceNode.text);
        }
      }

      // Type references
      if (caps.has('type.reference')) {
        const typeNode = caps.get('type.reference')![0];
        const typeName = typeNode.text;
        if (!localSymbols.has(typeName)) {
          edges.push({
            from: relativePath,
            to: typeName,
            type: 'references',
          });
        }
      }

      // Interfaces
      if (caps.has('interface.name')) {
        const nameNode = caps.get('interface.name')![0];
        if (nameNode) {
          const name = nameNode.text;
          const nodeId = createNodeId(relativePath, name);

          if (!localSymbols.has(name)) {
            localSymbols.add(name);
            nodes.push({
              id: nodeId,
              type: 'interface',
              name,
              file: relativePath,
              line,
            });
          }
        }
      }

      // Type aliases
      if (caps.has('typealias.name')) {
        const nameNode = caps.get('typealias.name')![0];
        if (nameNode) {
          const name = nameNode.text;
          const nodeId = createNodeId(relativePath, name);

          if (!localSymbols.has(name)) {
            localSymbols.add(name);
            nodes.push({
              id: nodeId,
              type: 'type',
              name,
              file: relativePath,
              line,
            });
          }
        }
      }

      // Type annotations
      if (caps.has('type.name')) {
        const typeNode = caps.get('type.name')![0];
        const typeName = typeNode.text;
        edges.push({
          from: relativePath,
          to: typeName,
          type: 'references',
        });
      }

      // Function parameters
      if (caps.has('param.name')) {
        const paramNodes = caps.get('param.name')!;
        for (const paramNode of paramNodes) {
          localSymbols.add(paramNode.text);
        }
      }

      // Structs (Go/Rust)
      if (caps.has('struct') && caps.has('class.name')) {
        const nameNode = caps.get('class.name')![0];
        if (nameNode) {
          const name = nameNode.text;
          const nodeId = createNodeId(relativePath, name);

          if (!localSymbols.has(name)) {
            localSymbols.add(name);
            nodes.push({
              id: nodeId,
              type: 'class',
              name,
              file: relativePath,
              line,
            });
          }
        }
      }

      // Imports
      if (caps.has('import')) {
        const sourceNode = caps.get('import.source')?.[0];
        if (sourceNode) {
          const source = sourceNode.text.replace(/['"]/g, '');
          edges.push({
            from: relativePath,
            to: source,
            type: 'imports',
          });
        }
      }
    }

    // Second pass: function calls
    // Build a map of node ranges to function names for containment checking
    const functionRanges = nodes
      .filter(n => n.type === 'function' || n.type === 'method')
      .map(n => {
        const nodeId = n.id;
        // Find the tree-sitter node for this function
        for (const [tsNode, caps] of nodeCaptures) {
          if (!tsNode) continue;
          const fnName = caps.get('function.name')?.[0]?.text || caps.get('method.name')?.[0]?.text;
          if (fnName === n.name) {
            return { nodeId, start: tsNode.startIndex, end: tsNode.endIndex };
          }
        }
        return null;
      })
      .filter(Boolean) as { nodeId: string; start: number; end: number }[];

    // Process calls
    for (const [tsNode, caps] of nodeCaptures) {
      if (!tsNode) continue;
      if (caps.has('call')) {
        const callNameNode = caps.get('call.name')?.[0];
        // const memberObjNode = caps.get('call.object')?.[0];
        // const memberPropNode = caps.get('call.property')?.[0];

        if (callNameNode) {
          const callName = callNameNode.text;

          // Skip common non-function patterns
          if (['if', 'for', 'while', 'switch', 'catch', 'console', 'Math', 'JSON', 'Object', 'Array', 'String', 'Number', 'require'].includes(callName)) {
            continue;
          }

          // Only track calls to local symbols
          if (localSymbols.has(callName)) {
            const callPos = callNameNode.startIndex;
            const containingFunc = functionRanges.find(f => f.start <= callPos && f.end >= callPos);

            if (containingFunc) {
              edges.push({
                from: containingFunc.nodeId,
                to: createNodeId(relativePath, callName),
                type: 'calls',
              });
            }
          }
        }
      }
    }

    tree.delete();
    parser.delete();

    return { nodes, edges };
  } catch (err) {
    return null;
  }
}

export function isTreeSitterAvailable(): boolean {
  return initialized;
}

// Re-export graph building helpers
export { isCodeFile };
