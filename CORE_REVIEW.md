# ai-engineering-harness — Core Deep Review

> Date: 2026-06-07 · Reviewer: Claude Code (claude-sonnet-4-6)  
> Scope: Deep audit of 6 core subsystems — policy engine, eval system, git-hygiene, backend constants, scoring, live-runner  
> Baseline: previous review closed 29/29 surface findings (commit `1987bb9`)

---

## Executive Summary

Sau khi close hết 29 findings của lần review trước, phần **core implementation** vẫn còn 18 issues mới — gồm 1 critical (silent data corruption trong git worktrees), 4 high (eval leaks + bad metrics), và 13 medium/low (type safety, logic gaps, missing features). Các vấn đề này không bị phát hiện trong lần review trước vì nằm sâu trong logic xử lý, không phải ở tầng wiring/config.

**Modules được audit:**
- `lib/backend/git-hygiene.ts` — git worktree support
- `lib/policy/engine.ts` + `lib/policy/schema.ts` — policy evaluation engine  
- `lib/evals/ab-runner.ts` — A/B eval orchestration
- `lib/evals/fixture-manager.ts` — temp workspace management
- `lib/evals/extended-metrics.ts` — eval metrics
- `lib/evals/scoring.ts` — score aggregation
- `lib/evals/live-runner.ts` — live provider execution
- `lib/evals/run-context.ts` — artifact directory management
- `lib/evals/reporter.ts` — JSON output
- `lib/backend/constants.ts` — provider path registry

---

## Findings

### 🔴 Critical

---

#### C-1 — git-hygiene silently fails trong git worktrees

**File:** `lib/backend/git-hygiene.ts:159-165` (applyPrivateIgnore), `lib/backend/git-hygiene.ts:208` (removeIgnoreBlock)

**Vấn đề:** Cả hai hàm `applyPrivateIgnore` và `removeIgnoreBlock` đều assume `.git` là một **directory**. Trong git worktrees (dùng `git worktree add`), `.git` là một **plain file** chứa `gitdir: /path/to/main-repo/.git/worktrees/...`.

```typescript
// applyPrivateIgnore:159
const gitDir = path.join(ctx.targetAbs, ".git");
if (!fs.existsSync(gitDir)) { ... }   // PASS — file tồn tại nên check này qua

// applyPrivateIgnore:165
const excludeFile = path.join(ctx.targetAbs, ".git", "info", "exclude");
// ↑ Đây là path KHÔNG HỢP LỆ — ".git" là file, không thể append tiếp

// applyPrivateIgnore:179
fs.mkdirSync(path.join(ctx.targetAbs, ".git", "info"), { recursive: true });
// ↑ Sẽ throw ENOTDIR vì ".git" là file
```

**Impact:** Bất kỳ user nào dùng `git worktree` để manage branches sẽ bị lỗi ENOTDIR khi install hoặc uninstall harness. Error này xảy ra sau khi check `existsSync` đã pass, nên rất khó debug.

**Fix cần làm:**
```typescript
function resolveGitDir(targetAbs: string): string | null {
  const gitPath = path.join(targetAbs, ".git");
  if (!fs.existsSync(gitPath)) return null;
  const stat = fs.statSync(gitPath);
  if (stat.isDirectory()) return gitPath;
  // Worktree case: read "gitdir: <path>" from file
  const content = fs.readFileSync(gitPath, "utf8").trim();
  const match = content.match(/^gitdir:\s*(.+)$/m);
  if (!match) return null;
  const resolved = path.resolve(targetAbs, match[1].trim());
  return fs.existsSync(resolved) ? resolved : null;
}
```
Sau đó thay `path.join(ctx.targetAbs, ".git", ...)` bằng `path.join(resolveGitDir(ctx.targetAbs), ...)` ở cả hai hàm.

---

### 🟠 High

---

#### C-2 — Eval temp dirs không bao giờ được dọn dẹp

**Files:** `lib/evals/fixture-manager.ts:57`, `lib/evals/ab-runner.ts:118-119`

**Vấn đề:** `materializeFixture` tạo temp dir bằng `fs.mkdtempSync` nhưng không có code nào gọi cleanup — không `finally`, không `process.on("exit")`, không explicit cleanup call.

```typescript
// fixture-manager.ts:57
const root = fs.mkdtempSync(path.join(os.tmpdir(), "aih-eval-"));
// ↑ Tạo dir nhưng không bao giờ xóa

// ab-runner.ts:118-119  
const withHarness = await runMode(...);    // tạo 1 temp dir
const withoutHarness = await runMode(...); // tạo thêm 1 temp dir
// ↑ Cả 2 workspace.root không được cleanup sau khi dùng xong
```

**Impact:** Mỗi eval run để lại 2 temp dirs trong `os.tmpdir()`. Với CI chạy nhiều eval tasks, `os.tmpdir()` sẽ bị fill up dần. Trên macOS, `/var/folders/...` không được dọn tự động trừ khi reboot.

**Fix cần làm:**
- Export `cleanupWorkspace(workspace: Workspace): void` từ `fixture-manager.ts`
- Trong `runAbTask` ở `ab-runner.ts`, wrap trong `try/finally` để gọi cleanup

---

#### C-3 — A/B modes chạy tuần tự dù hoàn toàn độc lập

**File:** `lib/evals/ab-runner.ts:118-119`

**Vấn đề:**
```typescript
const withHarness = await runMode(packRoot, task, runContext, "with-harness", options);
const withoutHarness = await runMode(packRoot, task, runContext, "without-harness", options);
```

Hai modes không share state, không có dependency vào nhau. Chạy tuần tự làm eval mất gấp đôi thời gian so với cần thiết.

**Impact:** Live-provider eval runs (dùng thật Claude/Cursor/Gemini) có thể mất 5-20 phút mỗi mode. Sequential → 10-40 phút tổng. Với CI matrix (18, 20, 22 × ubuntu + windows), thời gian tổng cộng rất lớn.

**Fix cần làm:**
```typescript
const [withHarness, withoutHarness] = await Promise.all([
  runMode(packRoot, task, runContext, "with-harness", options),
  runMode(packRoot, task, runContext, "without-harness", options),
]);
```

---

#### C-4 — `selfCorrectionReady` là metric giả, hardcoded

**File:** `lib/evals/extended-metrics.ts:56`

**Vấn đề:**
```typescript
selfCorrectionReady: mode === "with-harness",
```

Metric này luôn trả về `true` cho bất kỳ with-harness run nào, bất kể agent có thực sự self-correct hay không. Không dựa vào check results thực tế.

**Impact:** Metric `selfCorrectionReady` trong eval reports là vô nghĩa. Downstream consumers (dashboards, A/B comparison) sẽ thấy 100% self-correction rate cho mọi with-harness run, kể cả khi agent fail hết checks.

**Fix cần làm:** Dựa vào actual check results:
```typescript
selfCorrectionReady: mode === "with-harness" && baseScore.behavior.percent >= 0.8,
```
Hoặc tốt hơn: so sánh với without-harness checks ở cấp `compareAbMetrics`, không phải per-mode.

---

#### C-5 — `copyDirectory` không handle symlinks

**File:** `lib/evals/fixture-manager.ts:39-52`

**Vấn đề:**
```typescript
for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
  if (entry.isDirectory()) {
    copyDirectory(sourcePath, targetPath);
    continue;
  }
  fs.copyFileSync(sourcePath, targetPath); // ← không check isSymbolicLink()
}
```

`fs.copyFileSync` trên symlink: trên Linux/macOS, nó follow symlink và copy target file (lose symlink semantics). Trên Windows với symlinks cần elevated privileges, có thể throw.

**Impact:** Fixtures chứa symlinks (thường gặp trong Node.js projects với `node_modules/.bin/`) sẽ bị xử lý sai. Behavior khác nhau giữa platforms, khó debug.

**Fix cần làm:**
```typescript
if (entry.isSymbolicLink()) {
  fs.symlinkSync(fs.readlinkSync(sourcePath), targetPath);
  continue;
}
```

---

### 🟡 Medium

---

#### C-6 — `PolicyCondition.value: string | RegExp` — branch RegExp là dead code

**File:** `lib/policy/schema.ts:16`

**Vấn đề:**
```typescript
export interface PolicyCondition {
  value: string | RegExp;  // RegExp branch không bao giờ xảy ra sau JSON.parse
}
```

`JSON.parse` không bao giờ tạo ra `RegExp` instance. Branch `RegExp` trong union type là dead code. Điều này buộc `engine.ts` phải cast `value as string` ở nhiều chỗ, misleads người đọc rằng có thể pass pre-compiled RegExp.

**Fix cần làm:** Đổi thành `value: string`.

---

#### C-7 — Không có regex compilation cache trong policy engine

**File:** `lib/policy/engine.ts:46-53` (compileRegex), calls tại :150, :180, :229

**Vấn đề:** `compileRegex` gọi `new RegExp(pattern)` fresh mỗi lần `evaluateCondition` được gọi. Trong một Claude Code session, policy engine có thể được gọi hàng nghìn lần (mỗi tool call trigger một evaluation). Với N rules và M evaluations, `N × M` regex compilations xảy ra.

**Fix cần làm:**
```typescript
private static readonly regexCache = new Map<string, RegExp>();

private static compileRegex(pattern: string, context: string): RegExp {
  const cached = PolicyEngine.regexCache.get(pattern);
  if (cached) return cached;
  try {
    const regex = new RegExp(pattern);
    PolicyEngine.regexCache.set(pattern, regex);
    return regex;
  } catch (error) { ... }
}
```

---

#### C-8 — Conditions chỉ support AND logic, không có OR

**File:** `lib/policy/engine.ts:243-245`

**Vấn đề:**
```typescript
const conditionsMet = rule.conditions.every((condition) =>
  this.evaluateCondition(condition, context)
);
```

Tất cả conditions trong một rule đều được AND. Không thể viết rule "block nếu command là `harness-run` **HOẶC** `harness-ship`" mà không duplicate toàn bộ rule.

**Schema hiện tại:**
```typescript
interface PolicyRule {
  conditions: PolicyCondition[];  // implicit AND only
}
```

**Fix cần làm:** Thêm optional field `conditionLogic: "and" | "or"` vào `PolicyRule`, default `"and"`:
```typescript
interface PolicyRule {
  conditions: PolicyCondition[];
  conditionLogic?: "and" | "or";  // default "and"
}
```

---

#### C-9 — Non-null assertions trong `scoreRun` mask missing fields

**File:** `lib/evals/scoring.ts:74-76`

**Vấn đề:**
```typescript
rubric: rubricJudge
  ? {
      mode: rubricJudge.mode!,      // có thể undefined
      rubricId: rubricJudge.rubricId!,  // THƯỜNG undefined (khi no-rubric)
      passed: rubricJudge.passed!,  // có thể undefined
    }
  : null,
```

`runDeterministicRubric(cwd, null)` trả về `{ mode: "none", checks: [], passed: true }` — không có `rubricId`. Assertion `rubricId!` không throw nhưng produce `rubricId: undefined` trong Score output. Downstream code expect `rubricId: string` sẽ bị surprise.

**Fix cần làm:** Dùng nullish coalescing:
```typescript
mode: rubricJudge.mode ?? "none",
rubricId: rubricJudge.rubricId ?? "",
passed: rubricJudge.passed ?? false,
```

---

#### C-10 — `Score.extended` typed `any` mất type safety

**File:** `lib/evals/scoring.ts:48`

**Vấn đề:**
```typescript
interface Score {
  extended?: any;  // ← lose all type safety
}
```

`ExtendedMetrics` là interface đã được define rõ ràng trong `extended-metrics.ts`. Việc type `any` cho phép caller assign bất kỳ shape nào vào field này mà không có compile-time error.

**Root cause:** `extended-metrics.ts` import `Score` từ `scoring.ts`, nên nếu `scoring.ts` import `ExtendedMetrics` từ `extended-metrics.ts` sẽ tạo circular dependency.

**Fix cần làm:** Move `ExtendedMetrics` và `ComparisonMetrics` interfaces sang `scoring.ts` (hoặc file `evals/types.ts` riêng). `extended-metrics.ts` import từ đó thay vì define local.

---

#### C-11 — `runId` bị break khi taskId chứa `/`

**File:** `lib/evals/run-context.ts:11`

**Vấn đề:**
```typescript
const runId = `${new Date().toISOString().replace(/[:.]/g, "-")}-${taskId}`;
const runRoot = path.join(packRoot, "artifacts", "runs", runId);
```

TaskId dạng `"regression/task-1"` tạo ra `runId = "2026-06-07...-regression/task-1"` và `runRoot = "packRoot/artifacts/runs/...-regression/task-1"`. Directory structure bị nest thêm một tầng ngoài ý muốn.

**Fix cần làm:**
```typescript
const safeTaskId = taskId.replace(/[/\\:*?"<>|]/g, "-");
const runId = `${new Date().toISOString().replace(/[:.]/g, "-")}-${safeTaskId}`;
```

---

#### C-12 — Eval artifacts tích lũy vô hạn trong source tree

**File:** `lib/evals/run-context.ts:12`

**Vấn đề:**
```typescript
const runRoot = path.join(packRoot, "artifacts", "runs", runId);
```

Mỗi eval run tạo một directory mới trong `packRoot/artifacts/runs/` chứa JSON, markdown và transcripts. Không có TTL, rotation, hay giới hạn số lượng. Trong CI với nhiều runs, directory này phình to vô tận.

**Fix cần làm:** Check env var trước:
```typescript
const artifactsBase = process.env.AIH_EVAL_ARTIFACTS_DIR
  ? path.resolve(process.env.AIH_EVAL_ARTIFACTS_DIR)
  : path.join(packRoot, "artifacts");
const runRoot = path.join(artifactsBase, "runs", runId);
```

---

#### C-13 — Live-runner timeout hardcoded, không configurable

**File:** `lib/evals/live-runner.ts:136`

**Vấn đề:**
```typescript
const result = childProcess.spawnSync(executable, args, {
  timeout: 10 * 60 * 1000,  // 10 phút hardcoded
  ...
});
```

Provider chạy trên large codebase hợp lệ có thể cần hơn 10 phút. Không có cách override mà không sửa source code.

**Fix cần làm:** Thêm `timeoutMs?: number` vào `LiveRunOptions`, fallback về `10 * 60 * 1000`.

---

#### C-14 — `case "all"` trong `ignorePathsForProvider` thiếu opencode path

**File:** `lib/backend/constants.ts:43-53`

**Vấn đề:** `case "opencode"` có `.opencode/plugins/ai-engineering-harness.js` nhưng `case "all"` không bao gồm path này:

```typescript
case "all":
  out.push(
    ".cursor/commands/",
    ".cursor/rules/",
    ".claude/CLAUDE.md",
    ".claude/settings.json",
    ".claude/commands/",
    ".gemini/extensions/ai-engineering-harness/",
    "AGENTS.md"
    // ← THIẾU: ".opencode/plugins/ai-engineering-harness.js"
  );
```

**Impact:** User install opencode + cursor (multi-provider), chạy `ignorePathsForProvider("all", ...)`, opencode file sẽ không bị exclude khỏi git tracking.

**Fix cần làm:** Thêm `".opencode/plugins/ai-engineering-harness.js"` vào `case "all"`.

---

#### C-15 — `evaluateStateCondition` bị truncate khi value chứa dấu `:`

**File:** `lib/policy/engine.ts:168`

**Vấn đề:**
```typescript
const [key, expectedValue] = value.split(":");
// "plan_content:https://example.com" → key="plan_content", expectedValue="https"
// Phần "//example.com" bị DROP SILENTLY
```

State matcher `"plan_content:https://..."` sẽ compare với `"https"` thay vì full URL. Bug này hoàn toàn silent — không warning, không error.

**Fix cần làm:**
```typescript
const sep = value.indexOf(":");
const key = value.slice(0, sep);
const expectedValue = value.slice(sep + 1);  // preserve everything after first colon
```

---

### 🟢 Low

---

#### C-16 — Reporter JSON không có schema version

**File:** `lib/evals/reporter.ts:41-44`

**Vấn đề:** `writeModeArtifacts` và `writeRunSummary` emit raw JSON không có `schemaVersion` field. Khi format thay đổi, consumers không thể detect họ đang đọc version nào.

**Fix cần làm:** Thêm `schemaVersion: "1"` vào cả hai payloads.

---

#### C-17 — `validateCondition` chỉ validate `"matches"` operator

**File:** `lib/policy/engine.ts:55-78`

**Vấn đề:** Validation khi `loadPolicySet` chỉ compile-check patterns của `"matches"` operator. `"equals"` conditions với typo trong value không được detect ở load time, chỉ fail ở evaluation time (hoặc silently không match).

**Fix cần làm:** Document limitation hoặc thêm basic validation cho `"equals"` conditions.

---

#### C-18 — `efficiencyGain` dùng static fixture counts, không phải live measurements

**File:** `lib/evals/extended-metrics.ts:37`

**Vấn đề:** `metrics.withHarnessSteps` và `metrics.withoutHarnessSteps` đến từ `mutationMetrics()` → đọc `registry.json` (static fixture metadata). Trong live-provider runs, actual step counts từ transcript không được wire vào `ExtendedMetrics`. Mọi live run của cùng một task đều báo cáo **cùng số steps** bất kể agent thực sự làm gì.

**Fix cần làm (minimal):** Rename thành `estimatedEfficiencyGain` và document rõ đây là fixture-derived estimate, không phải live measurement.

---

## Tổng hợp

| # | Severity | Module | Finding | Status |
|---|---|---|---|---|
| C-1 | 🔴 Critical | git-hygiene.ts | Git worktrees: .git là file, ENOTDIR khi install | Open |
| C-2 | 🟠 High | fixture-manager + ab-runner | Eval temp dirs không cleanup | Open |
| C-3 | 🟠 High | ab-runner.ts | A/B modes chạy sequential, gấp đôi thời gian | Open |
| C-4 | 🟠 High | extended-metrics.ts | selfCorrectionReady hardcoded synthetic metric | Open |
| C-5 | 🟠 High | fixture-manager.ts | copyDirectory không handle symlinks | Open |
| C-6 | 🟡 Medium | policy/schema.ts | value: string \| RegExp — RegExp là dead code | Open |
| C-7 | 🟡 Medium | policy/engine.ts | Không có regex cache, compile lại mỗi lần | Open |
| C-8 | 🟡 Medium | policy/engine.ts | AND-only conditions, không có OR logic | Open |
| C-9 | 🟡 Medium | scoring.ts | Non-null assertions produce undefined silently | Open |
| C-10 | 🟡 Medium | scoring.ts | Score.extended typed any | Open |
| C-11 | 🟡 Medium | run-context.ts | runId breaks với taskId có `/` | Open |
| C-12 | 🟡 Medium | run-context.ts | Artifacts tích lũy vô hạn trong source tree | Open |
| C-13 | 🟡 Medium | live-runner.ts | Timeout 10 phút hardcoded | Open |
| C-14 | 🟡 Medium | constants.ts | case "all" thiếu opencode path | Open |
| C-15 | 🟡 Medium | policy/engine.ts | State value với `:` bị truncate silently | Open |
| C-16 | 🟢 Low | reporter.ts | JSON output không có schemaVersion | Open |
| C-17 | 🟢 Low | policy/engine.ts | Chỉ validate "matches" operator lúc load | Open |
| C-18 | 🟢 Low | extended-metrics.ts | efficiencyGain dùng static counts, tên misleading | Open |

### Priority thực hiện

1. **Ngay lập tức (C-1):** Git worktree bug — silent failure cho developer workflow phổ biến
2. **Sprint tới (C-2, C-3, C-4, C-5):** Eval system reliability — cleanup leaks + parallel execution
3. **Technical debt (C-6 → C-15):** Type safety, policy engine improvements, configurable options
4. **Khi có time (C-16 → C-18):** Future-proofing và naming clarity

---

*End of core review. File: CORE_REVIEW.md*
