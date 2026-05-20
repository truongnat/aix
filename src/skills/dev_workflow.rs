use crate::engine::context::ExecutionContext;
use crate::engine::git::{BranchingPolicy, GitBranchOrchestrator};
use crate::engine::project::AgentProjectLayout;
use crate::skill::capability::{
    CapabilityPermissions, SideEffectClass, SkillCapability, SkillIOType, TrustTier,
};
use crate::skill::io::{SkillInput, SkillOutput};
use crate::skill::Skill;
use crate::skills::idempotency;
use anyhow::{anyhow, Result};
use async_trait::async_trait;
use serde_json::json;
use serde_json::Value;
use std::collections::HashSet;
use std::path::{Component, PathBuf};
use std::process::Command as StdCommand;
use std::process::Stdio;
use tokio::io::AsyncReadExt;
use tokio::process::Command;
use tokio::time::{timeout, Duration};

const DEFAULT_RUN_SCRIPT_TIMEOUT_MS: u64 = 30_000;
const MAX_CAPTURED_OUTPUT_LEN: usize = 8000;
const VALIDATION_STATUS_ENV: &str = "AGENTIC_SDLC_LAST_VALIDATION_PASSED";
const RUN_SCRIPT_ALLOW_SHELL_OPERATORS_ENV: &str = "AGENTIC_SDLC_RUN_SCRIPT_ALLOW_SHELL_OPERATORS";
const RUN_SCRIPT_DENYLIST_ENV: &str = "AGENTIC_SDLC_RUN_SCRIPT_DENYLIST";

fn load_branching_policy(project_root: &str) -> Result<BranchingPolicy> {
    let layout = AgentProjectLayout::discover(project_root)?;
    let rules = layout.load_branching_rules()?;
    Ok(BranchingPolicy {
        prefix: rules.prefix.unwrap_or_else(|| "thread/".to_string()),
        allow_auto_create: rules.allow_auto_create.unwrap_or(true),
        allow_auto_checkout: rules.allow_auto_checkout.unwrap_or(true),
    })
}

fn run_script_timeout_ms() -> u64 {
    std::env::var("AGENTIC_SDLC_RUN_SCRIPT_TIMEOUT_MS")
        .ok()
        .and_then(|v| v.trim().parse::<u64>().ok())
        .filter(|v| *v > 0)
        .unwrap_or(DEFAULT_RUN_SCRIPT_TIMEOUT_MS)
}

fn run_script_allowlist() -> HashSet<String> {
    std::env::var("AGENTIC_SDLC_RUN_SCRIPT_ALLOWLIST")
        .ok()
        .map(|v| {
            v.split(',')
                .map(|cmd| cmd.trim().to_ascii_lowercase())
                .filter(|cmd| !cmd.is_empty())
                .collect()
        })
        .unwrap_or_else(|| {
            [
                "cargo", "git", "npm", "pnpm", "yarn", "make", "just", "go", "pytest", "flutter",
                "dart", "python", "python3",
            ]
            .into_iter()
            .map(|cmd| cmd.to_string())
            .collect()
        })
}

fn run_script_denylist() -> HashSet<String> {
    std::env::var(RUN_SCRIPT_DENYLIST_ENV)
        .ok()
        .map(|v| {
            v.split(',')
                .map(|cmd| cmd.trim().to_ascii_lowercase())
                .filter(|cmd| !cmd.is_empty())
                .collect()
        })
        .unwrap_or_else(|| {
            [
                "sudo",
                "dd",
                "mkfs",
                "shutdown",
                "reboot",
                "poweroff",
                "launchctl",
            ]
            .into_iter()
            .map(|cmd| cmd.to_string())
            .collect()
        })
}

fn run_script_allow_shell_operators() -> bool {
    std::env::var(RUN_SCRIPT_ALLOW_SHELL_OPERATORS_ENV)
        .ok()
        .map(|v| matches!(v.trim(), "1" | "true" | "TRUE" | "yes" | "YES"))
        .unwrap_or(false)
}

fn extract_command_head(command: &str) -> Option<String> {
    for token in command.split_whitespace() {
        if token.contains('=')
            && !token.starts_with("./")
            && !token.starts_with('/')
            && !token.contains('/')
        {
            continue;
        }
        let head = token.trim_matches(|ch| ch == '\'' || ch == '"');
        if !head.is_empty() {
            return Some(head.to_ascii_lowercase());
        }
    }
    None
}

fn is_validation_command(command: &str) -> bool {
    let lowered = command.to_ascii_lowercase();
    lowered.contains(" test")
        || lowered.starts_with("test ")
        || lowered.contains(" lint")
        || lowered.contains(" check")
        || lowered.contains(" validate")
        || lowered.contains(" analyze")
}

fn has_shell_operators(command: &str) -> bool {
    command.contains("&&")
        || command.contains("||")
        || command.contains('|')
        || command.contains(';')
}

fn split_command_segments(command: &str) -> Result<Vec<String>> {
    let mut segments = Vec::new();
    let mut current = String::new();
    let mut chars = command.chars().peekable();
    let mut in_single = false;
    let mut in_double = false;
    let mut escaped = false;

    while let Some(ch) = chars.next() {
        if escaped {
            current.push(ch);
            escaped = false;
            continue;
        }
        if ch == '\\' && !in_single {
            escaped = true;
            current.push(ch);
            continue;
        }
        if ch == '\'' && !in_double {
            in_single = !in_single;
            current.push(ch);
            continue;
        }
        if ch == '"' && !in_single {
            in_double = !in_double;
            current.push(ch);
            continue;
        }

        if !in_single && !in_double {
            if ch == ';' {
                let trimmed = current.trim();
                if !trimmed.is_empty() {
                    segments.push(trimmed.to_string());
                }
                current.clear();
                continue;
            }
            if ch == '&' && chars.peek() == Some(&'&') {
                chars.next();
                let trimmed = current.trim();
                if !trimmed.is_empty() {
                    segments.push(trimmed.to_string());
                }
                current.clear();
                continue;
            }
            if ch == '|' {
                if chars.peek() == Some(&'|') {
                    chars.next();
                }
                let trimmed = current.trim();
                if !trimmed.is_empty() {
                    segments.push(trimmed.to_string());
                }
                current.clear();
                continue;
            }
        }

        current.push(ch);
    }

    if in_single || in_double {
        return Err(anyhow!("run_script command has unmatched quote"));
    }

    let trimmed = current.trim();
    if !trimmed.is_empty() {
        segments.push(trimmed.to_string());
    }
    Ok(segments)
}

fn has_forbidden_shell_constructs(command: &str) -> bool {
    command.contains("$(")
        || command.contains('`')
        || command.contains('\n')
        || command.contains('\r')
}

fn segment_matches_dangerous_pattern(segment: &str) -> bool {
    let mut compact = segment.to_ascii_lowercase();
    while compact.contains("  ") {
        compact = compact.replace("  ", " ");
    }
    let compact = compact.trim().to_string();
    compact.starts_with("git reset --hard")
        || compact.starts_with("git clean -fd")
        || compact.starts_with("git clean -xdf")
        || compact.starts_with("rm -rf /")
        || compact.starts_with("rm -rf ~")
        || compact.starts_with("rm -rf $home")
}

fn validate_run_script_policy_with_config(
    command: &str,
    allowlist: &HashSet<String>,
    denylist: &HashSet<String>,
    allow_shell_operators: bool,
) -> Result<String> {
    if has_forbidden_shell_constructs(command) {
        return Err(anyhow!(
            "run_script blocked command due to forbidden shell construct"
        ));
    }
    if !allow_shell_operators && has_shell_operators(command) {
        return Err(anyhow!(
            "run_script blocked shell operator usage; enable policy if required"
        ));
    }

    let segments = split_command_segments(command)?;
    if segments.is_empty() {
        return Err(anyhow!("run_script requires non-empty command input"));
    }

    let mut first_head = None::<String>;
    for segment in segments {
        let head = extract_command_head(&segment)
            .ok_or_else(|| anyhow!("Unable to parse command head from '{}'", segment))?;
        if first_head.is_none() {
            first_head = Some(head.clone());
        }
        if !allowlist.is_empty() && !allowlist.contains(&head) {
            return Err(anyhow!(
                "run_script blocked command '{}'. Allowlist={:?}",
                head,
                allowlist
            ));
        }
        if denylist.contains(&head) {
            return Err(anyhow!(
                "run_script blocked denied command '{}'. Denylist={:?}",
                head,
                denylist
            ));
        }
        if segment_matches_dangerous_pattern(&segment) {
            return Err(anyhow!("run_script blocked dangerous command pattern"));
        }
    }

    Ok(first_head.unwrap_or_default())
}

fn validate_run_script_policy(command: &str) -> Result<String> {
    let allowlist = run_script_allowlist();
    let denylist = run_script_denylist();
    let allow_shell_operators = run_script_allow_shell_operators();
    validate_run_script_policy_with_config(command, &allowlist, &denylist, allow_shell_operators)
}

fn resolve_script_workdir() -> Result<PathBuf> {
    let cwd = std::env::current_dir()?;
    let output = StdCommand::new("git")
        .arg("rev-parse")
        .arg("--show-toplevel")
        .current_dir(&cwd)
        .output()?;
    if !output.status.success() {
        return Ok(cwd.canonicalize()?);
    }
    let root = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if root.is_empty() {
        return Ok(cwd.canonicalize()?);
    }
    let root_path = PathBuf::from(root).canonicalize()?;
    let cwd_path = cwd.canonicalize()?;
    if !cwd_path.starts_with(&root_path) {
        return Err(anyhow!(
            "run_script current directory is outside detected repo root"
        ));
    }
    Ok(root_path)
}

fn build_safe_path_env() -> String {
    let mut entries = vec![
        "/usr/bin".to_string(),
        "/bin".to_string(),
        "/usr/sbin".to_string(),
        "/sbin".to_string(),
        "/usr/local/bin".to_string(),
        "/usr/local/sbin".to_string(),
        "/opt/homebrew/bin".to_string(),
        "/opt/homebrew/sbin".to_string(),
    ];
    if let Ok(current_path) = std::env::var("PATH") {
        for entry in current_path
            .split(':')
            .map(str::trim)
            .filter(|v| !v.is_empty())
        {
            if !entries.iter().any(|existing| existing == entry) {
                entries.push(entry.to_string());
            }
        }
    }
    entries.join(":")
}

fn truncated(text: &str) -> String {
    if text.len() <= MAX_CAPTURED_OUTPUT_LEN {
        return text.to_string();
    }
    let keep = MAX_CAPTURED_OUTPUT_LEN / 2;
    format!(
        "{}...(truncated)...{}",
        &text[..keep],
        &text[text.len() - keep..]
    )
}

fn parse_write_file_input(input: &SkillInput) -> Result<(PathBuf, String)> {
    let text = input
        .as_text()
        .ok_or_else(|| anyhow!("write_file requires text input"))?;
    let (path_str, content) = text
        .split_once(":::")
        .ok_or_else(|| anyhow!("write_file input must be 'relative/path:::content'"))?;
    let rel_path = PathBuf::from(path_str.trim());
    if rel_path.is_absolute()
        || rel_path
            .components()
            .any(|component| matches!(component, Component::ParentDir))
    {
        return Err(anyhow!("write_file only allows safe relative paths"));
    }
    Ok((rel_path, content.to_string()))
}

fn parse_safe_relative_path(path_str: &str) -> Result<PathBuf> {
    let rel_path = PathBuf::from(path_str.trim());
    if rel_path.as_os_str().is_empty() {
        return Err(anyhow!("path must be non-empty"));
    }
    if rel_path.is_absolute()
        || rel_path
            .components()
            .any(|component| matches!(component, Component::ParentDir))
    {
        return Err(anyhow!("only safe relative paths are allowed"));
    }
    Ok(rel_path)
}

fn extract_run_script_command(input: &SkillInput) -> Result<String> {
    match input {
        SkillInput::Text(text) => {
            let command = text.trim();
            if command.is_empty() {
                return Err(anyhow!("run_script requires non-empty command input"));
            }
            Ok(command.to_string())
        }
        SkillInput::Json(value) => {
            let command = value
                .get("validation_command")
                .or_else(|| value.get("command"))
                .and_then(Value::as_str)
                .map(str::trim)
                .filter(|v| !v.is_empty())
                .ok_or_else(|| {
                    anyhow!(
                        "run_script expected JSON with non-empty 'validation_command' or 'command'"
                    )
                })?;
            Ok(command.to_string())
        }
        other => Err(anyhow!(
            "run_script expected text or JSON command input, got {:?}",
            other
        )),
    }
}

fn parse_write_files_from_json_input(input: &SkillInput) -> Result<(Option<PathBuf>, Vec<(PathBuf, String)>)> {
    let value = match input {
        SkillInput::Json(value) => value,
        SkillInput::Text(text) => {
            return Err(anyhow!(
                "write_files_from_json expected JSON input, got text preview '{}'",
                truncated(text.trim())
            ))
        }
        other => {
            return Err(anyhow!(
                "write_files_from_json expected JSON input, got {:?}",
                other
            ))
        }
    };

    let root_dir = value
        .get("root_dir")
        .and_then(Value::as_str)
        .map(parse_safe_relative_path)
        .transpose()?;

    let files = value
        .get("files")
        .and_then(Value::as_array)
        .ok_or_else(|| anyhow!("write_files_from_json requires a 'files' array"))?;

    let mut out = Vec::new();
    for entry in files {
        let path = entry
            .get("path")
            .and_then(Value::as_str)
            .ok_or_else(|| anyhow!("file entry missing string 'path'"))?;
        let content = if let Some(content) = entry.get("content").and_then(Value::as_str) {
            content.to_string()
        } else if let Some(lines) = entry.get("content_lines").and_then(Value::as_array) {
            let mut joined = Vec::new();
            for line in lines {
                let value = line
                    .as_str()
                    .ok_or_else(|| anyhow!("content_lines entries must be strings"))?;
                joined.push(value.to_string());
            }
            joined.join("\n")
        } else {
            return Err(anyhow!(
                "file entry missing string 'content' or string[] 'content_lines'"
            ));
        };
        let rel_path = parse_safe_relative_path(path)?;
        out.push((rel_path, content));
    }

    if out.is_empty() {
        return Err(anyhow!("write_files_from_json requires at least one file entry"));
    }

    Ok((root_dir, out))
}

#[derive(Debug, Clone)]
pub struct EnsureBranchSkill;

#[derive(Debug, Clone)]
pub struct RunScriptSkill;

#[derive(Debug, Clone)]
pub struct WriteFileSkill;

#[derive(Debug, Clone)]
pub struct WriteFilesFromJsonSkill;

#[derive(Debug, Clone)]
pub struct ExtractValidationCommandSkill;

#[derive(Debug, Clone)]
pub struct ArtifactBlueprintGateSkill;

#[derive(Debug, Clone)]
pub struct ArtifactBuilderSkill;

fn build_node_todo_cli_blueprint() -> Value {
    json!({
        "root_dir": "local_tmp/generated-app",
        "validation_command": "npm test --prefix local_tmp/generated-app",
        "files": [
            {
                "path": "package.json",
                "content_lines": [
                    "{",
                    "  \"name\": \"generated-todo-cli\",",
                    "  \"version\": \"1.0.0\",",
                    "  \"private\": true,",
                    "  \"bin\": {",
                    "    \"todo\": \"bin/todo.js\"",
                    "  },",
                    "  \"scripts\": {",
                    "    \"test\": \"node --test\"",
                    "  }",
                    "}"
                ]
            },
            {
                "path": "bin/todo.js",
                "content_lines": [
                    "#!/usr/bin/env node",
                    "const fs = require('fs');",
                    "const path = require('path');",
                    "",
                    "const todoFile = process.env.TODO_FILE || path.join(process.cwd(), 'todos.json');",
                    "",
                    "function loadTodos() {",
                    "  if (!fs.existsSync(todoFile)) {",
                    "    return [];",
                    "  }",
                    "  return JSON.parse(fs.readFileSync(todoFile, 'utf8'));",
                    "}",
                    "",
                    "function saveTodos(todos) {",
                    "  fs.writeFileSync(todoFile, JSON.stringify(todos, null, 2) + '\\n');",
                    "}",
                    "",
                    "function printUsage() {",
                    "  console.log('Usage: todo <add|list|done> [args]');",
                    "}",
                    "",
                    "const [, , command, ...args] = process.argv;",
                    "if (!command) {",
                    "  printUsage();",
                    "  process.exit(1);",
                    "}",
                    "",
                    "const todos = loadTodos();",
                    "",
                    "if (command === 'add') {",
                    "  const text = args.join(' ').trim();",
                    "  if (!text) {",
                    "    console.error('Missing todo text');",
                    "    process.exit(1);",
                    "  }",
                    "  todos.push({ text, done: false });",
                    "  saveTodos(todos);",
                    "  console.log(`Added: ${text}`);",
                    "} else if (command === 'list') {",
                    "  todos.forEach((todo, index) => {",
                    "    const mark = todo.done ? 'x' : ' ';",
                    "    console.log(`${index + 1}. [${mark}] ${todo.text}`);",
                    "  });",
                    "} else if (command === 'done') {",
                    "  const index = Number(args[0]);",
                    "  if (!Number.isInteger(index) || index < 1 || index > todos.length) {",
                    "    console.error('Invalid todo index');",
                    "    process.exit(1);",
                    "  }",
                    "  todos[index - 1].done = true;",
                    "  saveTodos(todos);",
                    "  console.log(`Completed: ${todos[index - 1].text}`);",
                    "} else {",
                    "  printUsage();",
                    "  process.exit(1);",
                    "}"
                ]
            },
            {
                "path": "test/todo.test.js",
                "content_lines": [
                    "const test = require('node:test');",
                    "const assert = require('node:assert/strict');",
                    "const fs = require('fs');",
                    "const os = require('os');",
                    "const path = require('path');",
                    "const { spawnSync } = require('child_process');",
                    "",
                    "test('todo cli add/list/done flow', () => {",
                    "  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-cli-'));",
                    "  const todoFile = path.join(tmpDir, 'todos.json');",
                    "  const cliPath = path.join(__dirname, '..', 'bin', 'todo.js');",
                    "  const env = { ...process.env, TODO_FILE: todoFile };",
                    "",
                    "  let result = spawnSync(process.execPath, [cliPath, 'add', 'ship harness'], { env, encoding: 'utf8' });",
                    "  assert.equal(result.status, 0, result.stderr);",
                    "  assert.match(result.stdout, /Added: ship harness/);",
                    "",
                    "  result = spawnSync(process.execPath, [cliPath, 'done', '1'], { env, encoding: 'utf8' });",
                    "  assert.equal(result.status, 0, result.stderr);",
                    "  assert.match(result.stdout, /Completed: ship harness/);",
                    "",
                    "  result = spawnSync(process.execPath, [cliPath, 'list'], { env, encoding: 'utf8' });",
                    "  assert.equal(result.status, 0, result.stderr);",
                    "  assert.match(result.stdout, /1\\. \\[x\\] ship harness/);",
                    "});"
                ]
            },
            {
                "path": "README.md",
                "content_lines": [
                    "# Generated Todo CLI",
                    "",
                    "A minimal Node.js todo list CLI generated by agentic-sdlc.",
                    "",
                    "## Commands",
                    "",
                    "- `node bin/todo.js add \"task\"`",
                    "- `node bin/todo.js list`",
                    "- `node bin/todo.js done 1`"
                ]
            }
        ]
    })
}

fn build_python_todo_cli_blueprint() -> Value {
    json!({
        "root_dir": "local_tmp/generated-app",
        "validation_command": "python3 -m unittest discover -s local_tmp/generated-app/tests -q",
        "files": [
            {
                "path": "todo.py",
                "content_lines": [
                    "import json",
                    "import os",
                    "import sys",
                    "",
                    "TODO_FILE = os.environ.get(\"TODO_FILE\", os.path.join(os.getcwd(), \"todos.json\"))",
                    "",
                    "def load_todos():",
                    "    if not os.path.exists(TODO_FILE):",
                    "        return []",
                    "    with open(TODO_FILE, \"r\", encoding=\"utf-8\") as handle:",
                    "        return json.load(handle)",
                    "",
                    "def save_todos(todos):",
                    "    with open(TODO_FILE, \"w\", encoding=\"utf-8\") as handle:",
                    "        json.dump(todos, handle, indent=2)",
                    "        handle.write(\"\\n\")",
                    "",
                    "def cmd_add(args):",
                    "    text = \" \".join(args).strip()",
                    "    if not text:",
                    "        raise SystemExit(\"Missing todo text\")",
                    "    todos = load_todos()",
                    "    todos.append({\"text\": text, \"done\": False})",
                    "    save_todos(todos)",
                    "    print(f\"Added: {text}\")",
                    "",
                    "def cmd_list(_args):",
                    "    todos = load_todos()",
                    "    for index, todo in enumerate(todos, start=1):",
                    "        mark = \"x\" if todo.get(\"done\") else \" \"",
                    "        print(f\"{index}. [{mark}] {todo.get('text', '')}\")",
                    "",
                    "def cmd_done(args):",
                    "    if not args:",
                    "        raise SystemExit(\"Missing todo index\")",
                    "    index = int(args[0])",
                    "    todos = load_todos()",
                    "    if index < 1 or index > len(todos):",
                    "        raise SystemExit(\"Invalid todo index\")",
                    "    todos[index - 1][\"done\"] = True",
                    "    save_todos(todos)",
                    "    print(f\"Completed: {todos[index - 1]['text']}\")",
                    "",
                    "def main(argv=None):",
                    "    argv = list(sys.argv[1:] if argv is None else argv)",
                    "    if not argv:",
                    "        raise SystemExit(\"Usage: python todo.py <add|list|done> [args]\")",
                    "    command, *args = argv",
                    "    if command == \"add\":",
                    "        cmd_add(args)",
                    "    elif command == \"list\":",
                    "        cmd_list(args)",
                    "    elif command == \"done\":",
                    "        cmd_done(args)",
                    "    else:",
                    "        raise SystemExit(f\"Unknown command: {command}\")",
                    "",
                    "if __name__ == \"__main__\":",
                    "    main()"
                ]
            },
            {
                "path": "tests/test_todo.py",
                "content_lines": [
              "import os",
              "import subprocess",
              "import sys",
              "import tempfile",
              "import unittest",
              "from pathlib import Path",
              "",
              "CLI = os.path.join(os.path.dirname(os.path.dirname(__file__)), \"todo.py\")",
                    "",
                    "class TodoCliTest(unittest.TestCase):",
                    "    def test_add_done_list(self):",
                    "        with tempfile.TemporaryDirectory() as tmp_dir:",
                    "            todo_file = Path(tmp_dir) / \"todos.json\"",
                    "            env = dict(os.environ)",
                    "            env[\"TODO_FILE\"] = str(todo_file)",
                    "",
                    "            result = subprocess.run(",
                    "                [sys.executable, CLI, \"add\", \"ship\", \"harness\"],",
                    "                check=True,",
                    "                capture_output=True,",
                    "                text=True,",
                    "                env=env,",
                    "            )",
                    "            self.assertIn(\"Added: ship harness\", result.stdout)",
                    "",
                    "            result = subprocess.run(",
                    "                [sys.executable, CLI, \"done\", \"1\"],",
                    "                check=True,",
                    "                capture_output=True,",
                    "                text=True,",
                    "                env=env,",
                    "            )",
                    "            self.assertIn(\"Completed: ship harness\", result.stdout)",
                    "",
                    "            result = subprocess.run(",
                    "                [sys.executable, CLI, \"list\"],",
                    "                check=True,",
                    "                capture_output=True,",
                    "                text=True,",
                    "                env=env,",
                    "            )",
                    "            self.assertIn(\"1. [x] ship harness\", result.stdout)",
                    "",
                    "if __name__ == \"__main__\":",
                    "    unittest.main()"
                ]
            },
            {
                "path": "README.md",
                "content_lines": [
                    "# Generated Python Todo CLI",
                    "",
                    "Run `python3 todo.py add \"task\"`, `python3 todo.py list`, or `python3 todo.py done 1`."
                ]
            }
        ]
    })
}

fn build_rust_todo_cli_blueprint() -> Value {
    json!({
        "root_dir": "local_tmp/generated-app",
        "validation_command": "cargo test --manifest-path local_tmp/generated-app/Cargo.toml",
        "files": [
            {
                "path": "Cargo.toml",
                "content_lines": [
                    "[package]",
                    "name = \"generated_todo_cli\"",
                    "version = \"0.1.0\"",
                    "edition = \"2021\"",
                    "",
                    "[dependencies]"
                ]
            },
            {
                "path": "src/main.rs",
                "content_lines": [
                    "use std::env;",
                    "use std::fs;",
                    "use std::path::PathBuf;",
                    "",
                    "fn todo_file() -> PathBuf {",
                    "    env::var(\"TODO_FILE\")",
                    "        .map(PathBuf::from)",
                    "        .unwrap_or_else(|_| env::current_dir().expect(\"cwd\").join(\"todos.json\"))",
                    "}",
                    "",
                    "fn load_todos() -> Vec<(String, bool)> {",
                    "    let path = todo_file();",
                    "    let Ok(raw) = fs::read_to_string(path) else {",
                    "        return Vec::new();",
                    "    };",
                    "    raw.lines()",
                    "        .filter_map(|line| {",
                    "            let (status, text) = line.split_once('|')?;",
                    "            Some((text.to_string(), status == \"1\"))",
                    "        })",
                    "        .collect()",
                    "}",
                    "",
                    "fn save_todos(todos: &[(String, bool)]) {",
                    "    let body = todos",
                    "        .iter()",
                    "        .map(|(text, done)| format!(\"{}|{}\", if *done { \"1\" } else { \"0\" }, text))",
                    "        .collect::<Vec<_>>()",
                    "        .join(\"\\n\");",
                    "    fs::write(todo_file(), format!(\"{}\\n\", body)).expect(\"write todos\");",
                    "}",
                    "",
                    "fn main() {",
                    "    let mut args = env::args().skip(1);",
                    "    let command = args.next().unwrap_or_else(|| panic!(\"usage: todo <add|list|done> [args]\"));",
                    "    let mut todos = load_todos();",
                    "    match command.as_str() {",
                    "        \"add\" => {",
                    "            let text = args.collect::<Vec<_>>().join(\" \");",
                    "            if text.trim().is_empty() {",
                    "                panic!(\"missing todo text\");",
                    "            }",
                    "            todos.push((text.clone(), false));",
                    "            save_todos(&todos);",
                    "            println!(\"Added: {}\", text);",
                    "        }",
                    "        \"list\" => {",
                    "            for (index, (text, done)) in todos.iter().enumerate() {",
                    "                let mark = if *done { 'x' } else { ' ' };",
                    "                println!(\"{}. [{}] {}\", index + 1, mark, text);",
                    "            }",
                    "        }",
                    "        \"done\" => {",
                    "            let index = args.next().expect(\"missing todo index\").parse::<usize>().expect(\"invalid todo index\");",
                    "            if index == 0 || index > todos.len() {",
                    "                panic!(\"invalid todo index\");",
                    "            }",
                    "            todos[index - 1].1 = true;",
                    "            let text = todos[index - 1].0.clone();",
                    "            save_todos(&todos);",
                    "            println!(\"Completed: {}\", text);",
                    "        }",
                    "        _ => panic!(\"unknown command\"),",
                    "    }",
                    "}"
                ]
            },
            {
                "path": "tests/cli_flow.rs",
                "content_lines": [
                    "use std::fs;",
                    "use std::path::PathBuf;",
                    "use std::process::Command;",
                    "use std::time::{SystemTime, UNIX_EPOCH};",
                    "",
                    "fn binary_path() -> PathBuf {",
                    "    PathBuf::from(env!(\"CARGO_BIN_EXE_generated_todo_cli\"))",
                    "}",
                    "",
                    "fn temp_todo_file() -> PathBuf {",
                    "    let unique = SystemTime::now()",
                    "        .duration_since(UNIX_EPOCH)",
                    "        .expect(\"time\")",
                    "        .as_nanos();",
                    "    std::env::temp_dir().join(format!(\"generated-todo-cli-{}.json\", unique))",
                    "}",
                    "",
                    "fn run(args: &[&str], todo_file: &PathBuf) -> String {",
                    "    let output = Command::new(binary_path())",
                    "        .args(args)",
                    "        .env(\"TODO_FILE\", todo_file)",
                    "        .output()",
                    "        .expect(\"run cli\");",
                    "    assert!(output.status.success(), \"stderr={}\", String::from_utf8_lossy(&output.stderr));",
                    "    String::from_utf8_lossy(&output.stdout).to_string()",
                    "}",
                    "",
                    "#[test]",
                    "fn add_done_list_flow() {",
                    "    let todo_file = temp_todo_file();",
                    "    let added = run(&[\"add\", \"ship\", \"harness\"], &todo_file);",
                    "    assert!(added.contains(\"Added: ship harness\"));",
                    "    let completed = run(&[\"done\", \"1\"], &todo_file);",
                    "    assert!(completed.contains(\"Completed: ship harness\"));",
                    "    let listed = run(&[\"list\"], &todo_file);",
                    "    assert!(listed.contains(\"1. [x] ship harness\"));",
                    "    let _ = fs::remove_file(todo_file);",
                    "}"
                ]
            },
            {
                "path": "README.md",
                "content_lines": [
                    "# Generated Rust Todo CLI",
                    "",
                    "Run `cargo run --manifest-path Cargo.toml -- add \"task\"`, `list`, or `done 1`."
                ]
            }
        ]
    })
}

fn build_artifact_blueprint(task: &str) -> Value {
    let normalized = task.trim().to_ascii_lowercase();
    if normalized.contains("todo")
        && (normalized.contains("node") || normalized.contains("javascript"))
    {
        return build_node_todo_cli_blueprint();
    }
    if normalized.contains("todo")
        && (normalized.contains("python") || normalized.contains("py "))
    {
        return build_python_todo_cli_blueprint();
    }
    if normalized.contains("todo")
        && (normalized.contains("rust") || normalized.contains("cargo"))
    {
        return build_rust_todo_cli_blueprint();
    }
    if normalized.contains("todo") && normalized.contains("cli") {
        return build_node_todo_cli_blueprint();
    }

    json!({
        "status": "failed",
        "summary": "Built-in artifact builder does not support this task yet.",
        "actions": [
            "use starter/app-builder for supported todo/node tasks",
            "extend agent.artifact_builder with a new deterministic blueprint template"
        ],
        "risks": ["unsupported_task"]
    })
}

#[async_trait]
impl Skill for EnsureBranchSkill {
    fn name(&self) -> &str {
        "ensure_branch"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "Ensure a deterministic branch exists for a thread id",
            SkillIOType::Text,
            SkillIOType::Json,
            CapabilityPermissions::new(true, true, false, false, true),
            SideEffectClass::ExternalMutation,
        )
        .with_trust_tier(TrustTier::Constrained)
    }

    fn is_idempotent(&self) -> bool {
        true
    }

    async fn detect_already_applied(
        &self,
        input: &SkillInput,
        ctx: &mut ExecutionContext,
    ) -> Result<Option<SkillOutput>> {
        ctx.require_process_spawn()?;
        ctx.require_fs_read()?;
        let thread_id = input
            .as_text()
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .unwrap_or("default-thread");
        let cwd = std::env::current_dir()?;
        let policy = load_branching_policy(&cwd.to_string_lossy())?;
        let target_branch =
            GitBranchOrchestrator::branch_for_thread_with_prefix(thread_id, &policy.prefix);
        let current = StdCommand::new("git")
            .arg("rev-parse")
            .arg("--abbrev-ref")
            .arg("HEAD")
            .current_dir(&cwd)
            .output()?;
        if current.status.success() {
            let current_branch = String::from_utf8_lossy(&current.stdout).trim().to_string();
            if current_branch == target_branch {
                return Ok(Some(SkillOutput::json(json!({
                    "status": "already_on_branch",
                    "thread_id": thread_id,
                    "branch": target_branch
                }))));
            }
        }
        Ok(None)
    }

    async fn execute(&self, input: SkillInput, ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        ctx.require_process_spawn()?;
        ctx.require_fs_write()?;
        let thread_id = input
            .as_text()
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .unwrap_or("default-thread");
        let cwd = std::env::current_dir()?;
        let policy = load_branching_policy(&cwd.to_string_lossy())?;
        let orchestrator =
            GitBranchOrchestrator::new_with_policy(cwd.to_string_lossy().to_string(), policy);
        let branch = orchestrator.ensure_branch_for_thread(thread_id)?;
        Ok(SkillOutput::json(json!({
            "status": "ok",
            "thread_id": thread_id,
            "branch": branch
        })))
    }
}

#[async_trait]
impl Skill for RunScriptSkill {
    fn name(&self) -> &str {
        "run_script"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "Run a validation/build/test script in project root",
            SkillIOType::Text,
            SkillIOType::Json,
            CapabilityPermissions::new(true, true, false, false, true),
            SideEffectClass::ExternalMutation,
        )
        .with_trust_tier(TrustTier::Constrained)
    }

    fn is_idempotent(&self) -> bool {
        true
    }

    async fn detect_already_applied(
        &self,
        input: &SkillInput,
        ctx: &mut ExecutionContext,
    ) -> Result<Option<SkillOutput>> {
        ctx.require_fs_read()?;
        let command = extract_run_script_command(input)?;
        if !is_validation_command(&command) {
            return Ok(None);
        }
        idempotency::load_marker(self.name(), &command)
    }

    async fn execute(&self, input: SkillInput, ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        ctx.require_process_spawn()?;
        ctx.require_fs_read()?;
        let command = extract_run_script_command(&input)?;
        let command_head = validate_run_script_policy(&command)?;
        let timeout_ms = run_script_timeout_ms();
        let is_validation = is_validation_command(&command);
        let workdir = resolve_script_workdir()?;
        let mut child = Command::new("/bin/sh")
            .arg("-c")
            .arg(&command)
            .env_clear()
            .env("PATH", build_safe_path_env())
            .env("LC_ALL", "C")
            .env("PWD", &workdir)
            .current_dir(&workdir)
            .stdin(Stdio::null())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()?;
        let stdout = child
            .stdout
            .take()
            .ok_or_else(|| anyhow!("Failed to capture stdout"))?;
        let stderr = child
            .stderr
            .take()
            .ok_or_else(|| anyhow!("Failed to capture stderr"))?;
        let stdout_reader = tokio::spawn(async move {
            let mut reader = stdout;
            let mut bytes = Vec::new();
            reader.read_to_end(&mut bytes).await.map(|_| bytes)
        });
        let stderr_reader = tokio::spawn(async move {
            let mut reader = stderr;
            let mut bytes = Vec::new();
            reader.read_to_end(&mut bytes).await.map(|_| bytes)
        });

        let exit_status = match timeout(Duration::from_millis(timeout_ms), child.wait()).await {
            Ok(result) => result?,
            Err(_) => {
                let _ = child.kill().await;
                let _ = child.wait().await;
                let _ = stdout_reader.await;
                let _ = stderr_reader.await;
                if is_validation {
                    std::env::set_var(VALIDATION_STATUS_ENV, "0");
                }
                return Err(anyhow!(
                    "run_script timeout after {}ms (command='{}')",
                    timeout_ms,
                    command
                ));
            }
        };

        let stdout_bytes = stdout_reader
            .await
            .map_err(|e| anyhow!("Failed to join stdout reader: {}", e))??;
        let stderr_bytes = stderr_reader
            .await
            .map_err(|e| anyhow!("Failed to join stderr reader: {}", e))??;

        let code = exit_status.code().unwrap_or(-1);
        let stdout = truncated(String::from_utf8_lossy(&stdout_bytes).trim());
        let stderr = truncated(String::from_utf8_lossy(&stderr_bytes).trim());
        if !exit_status.success() {
            if is_validation {
                std::env::set_var(VALIDATION_STATUS_ENV, "0");
            }
            let failure = json!({
                "status": "failed",
                "command": command,
                "command_head": command_head,
                "exit_code": code,
                "stdout": stdout,
                "stderr": stderr
            });
            return Err(anyhow!(
                "run_script failed: {}",
                serde_json::to_string(&failure)?
            ));
        }
        if is_validation {
            std::env::set_var(VALIDATION_STATUS_ENV, "1");
        }

        let output = SkillOutput::json(json!({
            "status": "ok",
            "command": command,
            "command_head": command_head,
            "working_dir": workdir.to_string_lossy(),
            "timeout_ms": timeout_ms,
            "exit_code": code,
            "stdout": stdout,
            "stderr": stderr
        }));
        if is_validation {
            let _ = idempotency::save_marker(self.name(), &command, &output);
        }
        Ok(output)
    }
}

#[async_trait]
impl Skill for WriteFileSkill {
    fn name(&self) -> &str {
        "write_file"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "Write file content using 'relative/path:::content' input format",
            SkillIOType::Text,
            SkillIOType::Json,
            CapabilityPermissions::new(true, true, false, false, false),
            SideEffectClass::ExternalMutation,
        )
        .with_trust_tier(TrustTier::Trusted)
    }

    fn is_idempotent(&self) -> bool {
        true
    }

    async fn detect_already_applied(
        &self,
        input: &SkillInput,
        ctx: &mut ExecutionContext,
    ) -> Result<Option<SkillOutput>> {
        ctx.require_fs_read()?;
        let (rel_path, content) = parse_write_file_input(input)?;
        let full_path = std::env::current_dir()?.join(&rel_path);
        if !full_path.exists() {
            return Ok(None);
        }
        let existing = std::fs::read_to_string(&full_path)?;
        if existing == content {
            return Ok(Some(SkillOutput::json(json!({
                "status": "already_written",
                "path": rel_path.to_string_lossy(),
                "bytes": content.len()
            }))));
        }
        Ok(None)
    }

    async fn execute(&self, input: SkillInput, ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        ctx.require_fs_write()?;
        let (rel_path, content) = parse_write_file_input(&input)?;

        let full_path = std::env::current_dir()?.join(&rel_path);
        if let Some(parent) = full_path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(&full_path, &content)?;

        Ok(SkillOutput::json(json!({
            "status": "written",
            "path": rel_path.to_string_lossy(),
            "bytes": content.len()
        })))
    }
}

#[async_trait]
impl Skill for WriteFilesFromJsonSkill {
    fn name(&self) -> &str {
        "write_files_from_json"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "Write multiple files from JSON input with optional root_dir and files[] entries",
            SkillIOType::Json,
            SkillIOType::Json,
            CapabilityPermissions::new(true, true, false, false, false),
            SideEffectClass::ExternalMutation,
        )
        .with_trust_tier(TrustTier::Trusted)
    }

    fn is_idempotent(&self) -> bool {
        true
    }

    async fn detect_already_applied(
        &self,
        input: &SkillInput,
        ctx: &mut ExecutionContext,
    ) -> Result<Option<SkillOutput>> {
        ctx.require_fs_read()?;
        let (root_dir, files) = parse_write_files_from_json_input(input)?;
        let cwd = std::env::current_dir()?;
        let base_dir = root_dir.map(|root| cwd.join(root)).unwrap_or(cwd);

        let mut all_match = true;
        for (rel_path, content) in &files {
            let full_path = base_dir.join(rel_path);
            if !full_path.exists() {
                all_match = false;
                break;
            }
            let existing = std::fs::read_to_string(&full_path)?;
            if existing != *content {
                all_match = false;
                break;
            }
        }

        if !all_match {
            return Ok(None);
        }

        Ok(Some(SkillOutput::json(json!({
            "status": "already_written",
            "root_dir": base_dir.to_string_lossy(),
            "file_count": files.len()
        }))))
    }

    async fn execute(&self, input: SkillInput, ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        ctx.require_fs_write()?;
        let (root_dir, files) = parse_write_files_from_json_input(&input)?;
        let cwd = std::env::current_dir()?;
        let base_dir = root_dir.map(|root| cwd.join(root)).unwrap_or(cwd);

        let mut written = Vec::new();
        for (rel_path, content) in files {
            let full_path = base_dir.join(&rel_path);
            if let Some(parent) = full_path.parent() {
                std::fs::create_dir_all(parent)?;
            }
            std::fs::write(&full_path, content)?;
            written.push(rel_path.to_string_lossy().to_string());
        }

        Ok(SkillOutput::json(json!({
            "status": "written",
            "root_dir": base_dir.to_string_lossy(),
            "file_count": written.len(),
            "files": written
        })))
    }
}

#[async_trait]
impl Skill for ExtractValidationCommandSkill {
    fn name(&self) -> &str {
        "extract_validation_command"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "Extract validation_command or command from JSON payload as text",
            SkillIOType::Json,
            SkillIOType::Text,
            CapabilityPermissions::new(false, false, false, false, false),
            SideEffectClass::Pure,
        )
        .with_trust_tier(TrustTier::Trusted)
    }

    fn is_idempotent(&self) -> bool {
        true
    }

    async fn execute(&self, input: SkillInput, _ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        let command = extract_run_script_command(&input)?;
        Ok(SkillOutput::text(command))
    }
}

#[async_trait]
impl Skill for ArtifactBlueprintGateSkill {
    fn name(&self) -> &str {
        "artifact_blueprint_gate"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "Validate that an artifact blueprint contains root_dir, files, and validation_command",
            SkillIOType::Json,
            SkillIOType::Json,
            CapabilityPermissions::new(false, false, false, false, false),
            SideEffectClass::Pure,
        )
        .with_trust_tier(TrustTier::Trusted)
    }

    fn is_idempotent(&self) -> bool {
        true
    }

    async fn execute(&self, input: SkillInput, _ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        let value = match input {
            SkillInput::Json(value) => value,
            other => {
                return Ok(SkillOutput::json(json!({
                    "status": "failed",
                    "summary": "Artifact blueprint gate received non-JSON input.",
                    "actions": ["rerun blueprint generation with strict JSON output"],
                    "risks": [format!("unexpected_input_type:{:?}", other)]
                })))
            }
        };

        let root_dir = value.get("root_dir").and_then(Value::as_str);
        let has_root_dir = root_dir.is_some();
        let root_dir_safe = root_dir
            .map(|dir| dir == "local_tmp" || dir.starts_with("local_tmp/"))
            .unwrap_or(false);
        let has_files = value
            .get("files")
            .and_then(Value::as_array)
            .map(|files| !files.is_empty())
            .unwrap_or(false);
        let command = value
            .get("validation_command")
            .or_else(|| value.get("command"))
            .and_then(Value::as_str);
        let has_command = command.is_some();
        let command_safe = command
            .map(validate_run_script_policy)
            .transpose()
            .is_ok();
        let degraded = value
            .get("risks")
            .and_then(Value::as_array)
            .map(|risks| {
                risks.iter().filter_map(Value::as_str).any(|risk| {
                    risk.contains("llm_backend_unavailable")
                        || risk.contains("output_confidence_reduced")
                        || risk.contains("simulation")
                })
            })
            .unwrap_or(false);

        if has_root_dir && root_dir_safe && has_files && has_command && command_safe && !degraded {
            return Ok(SkillOutput::json(json!({
                "status": "ok",
                "summary": "Artifact blueprint passed structure and degradation checks.",
                "actions": ["apply file mutations", "run validation command"],
                "risks": []
            })));
        }

        Ok(SkillOutput::json(json!({
            "status": "failed",
            "summary": "Artifact blueprint is incomplete or degraded and cannot be applied safely.",
                "actions": ["regenerate blueprint", "verify model/provider availability"],
                "risks": [
                    if !has_root_dir { "missing_root_dir" } else { "root_dir_ok" },
                    if !root_dir_safe { "unsafe_root_dir" } else { "safe_root_dir" },
                    if !has_files { "missing_files" } else { "files_ok" },
                    if !has_command { "missing_validation_command" } else { "validation_command_ok" },
                    if !command_safe { "unsafe_validation_command" } else { "safe_validation_command" },
                    if degraded { "degraded_or_simulated_output" } else { "not_degraded" }
                ]
            })))
    }
}

#[async_trait]
impl Skill for ArtifactBuilderSkill {
    fn name(&self) -> &str {
        "artifact_builder"
    }

    fn capability(&self) -> SkillCapability {
        SkillCapability::new(
            self.name(),
            "Generate a deterministic local artifact blueprint for supported starter tasks",
            SkillIOType::Text,
            SkillIOType::Json,
            CapabilityPermissions::new(false, false, false, false, false),
            SideEffectClass::Pure,
        )
        .with_trust_tier(TrustTier::Trusted)
    }

    fn is_idempotent(&self) -> bool {
        true
    }

    async fn execute(&self, input: SkillInput, _ctx: &mut ExecutionContext) -> Result<SkillOutput> {
        let task = input.as_text().unwrap_or_default();
        Ok(SkillOutput::json(build_artifact_blueprint(task)))
    }
}

#[cfg(test)]
mod tests {
    use super::{
        build_artifact_blueprint, extract_command_head, extract_run_script_command,
        is_validation_command, parse_write_files_from_json_input,
        validate_run_script_policy_with_config,
    };
    use crate::skill::io::SkillInput;
    use serde_json::{json, Value};
    use std::collections::HashSet;

    #[test]
    fn extract_command_head_skips_env_assignments() {
        let head = extract_command_head("RUSTFLAGS=-Dwarnings cargo test").expect("head");
        assert_eq!(head, "cargo");
    }

    #[test]
    fn validation_command_detects_common_keywords() {
        assert!(is_validation_command("cargo test"));
        assert!(is_validation_command("flutter analyze"));
        assert!(!is_validation_command("git status"));
    }

    #[test]
    fn run_script_policy_blocks_shell_operators_by_default() {
        let allowlist = HashSet::from([String::from("cargo"), String::from("git")]);
        let denylist = HashSet::new();
        let result = validate_run_script_policy_with_config(
            "cargo test && git status",
            &allowlist,
            &denylist,
            false,
        );
        assert!(result.is_err());
    }

    #[test]
    fn run_script_policy_blocks_dangerous_patterns() {
        let allowlist = HashSet::from([String::from("git")]);
        let denylist = HashSet::new();
        let result =
            validate_run_script_policy_with_config("git reset --hard", &allowlist, &denylist, true);
        assert!(result.is_err());
    }

    #[test]
    fn run_script_policy_accepts_safe_allowed_command() {
        let allowlist = HashSet::from([String::from("cargo")]);
        let denylist = HashSet::from([String::from("sudo")]);
        let head =
            validate_run_script_policy_with_config("cargo test -q", &allowlist, &denylist, false)
                .expect("safe command should pass");
        assert_eq!(head, "cargo");
    }

    #[test]
    fn extract_run_script_command_supports_json_payload() {
        let input = SkillInput::Json(json!({
            "validation_command": "npm test --prefix local_tmp/app"
        }));
        let command = extract_run_script_command(&input).expect("command");
        assert_eq!(command, "npm test --prefix local_tmp/app");
    }

    #[test]
    fn parse_write_files_from_json_input_supports_root_dir_and_files() {
        let input = SkillInput::Json(json!({
            "root_dir": "local_tmp/generated-app",
            "files": [
                { "path": "package.json", "content": "{\"name\":\"demo\"}" },
                { "path": "src/index.js", "content_lines": ["const x = 1;", "console.log(x);"] }
            ]
        }));
        let (root_dir, files) = parse_write_files_from_json_input(&input).expect("parse");
        assert_eq!(
            root_dir.map(|v| v.to_string_lossy().to_string()),
            Some("local_tmp/generated-app".to_string())
        );
        assert_eq!(files.len(), 2);
        assert_eq!(files[0].0.to_string_lossy(), "package.json");
        assert_eq!(files[1].0.to_string_lossy(), "src/index.js");
        assert_eq!(files[1].1, "const x = 1;\nconsole.log(x);");
    }

    #[test]
    fn extract_run_script_command_accepts_command_alias() {
        let input = SkillInput::Json(json!({
            "command": "cargo test -q"
        }));
        let command = extract_run_script_command(&input).expect("command");
        assert_eq!(command, "cargo test -q");
    }

    #[test]
    fn artifact_builder_generates_node_todo_cli_blueprint() {
        let value = build_artifact_blueprint("create a todo list cli app in nodejs");
        assert_eq!(
            value.get("root_dir").and_then(Value::as_str),
            Some("local_tmp/generated-app")
        );
        assert_eq!(
            value.get("validation_command").and_then(Value::as_str),
            Some("npm test --prefix local_tmp/generated-app")
        );
        let files = value
            .get("files")
            .and_then(Value::as_array)
            .expect("files");
        assert!(files.iter().any(|entry| {
            entry.get("path").and_then(Value::as_str) == Some("bin/todo.js")
        }));
    }

    #[test]
    fn artifact_builder_generates_python_todo_cli_blueprint() {
        let value = build_artifact_blueprint("create a todo cli in python");
        assert_eq!(
            value.get("validation_command").and_then(Value::as_str),
            Some("python3 -m unittest discover -s local_tmp/generated-app/tests -q")
        );
        let files = value
            .get("files")
            .and_then(Value::as_array)
            .expect("files");
        assert!(files.iter().any(|entry| {
            entry.get("path").and_then(Value::as_str) == Some("todo.py")
        }));
    }

    #[test]
    fn artifact_builder_generates_rust_todo_cli_blueprint() {
        let value = build_artifact_blueprint("create a rust todo cli");
        assert_eq!(
            value.get("validation_command").and_then(Value::as_str),
            Some("cargo test --manifest-path local_tmp/generated-app/Cargo.toml")
        );
        let files = value
            .get("files")
            .and_then(Value::as_array)
            .expect("files");
        assert!(files.iter().any(|entry| {
            entry.get("path").and_then(Value::as_str) == Some("src/main.rs")
        }));
    }
}
