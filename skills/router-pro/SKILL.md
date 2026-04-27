---
name: router-pro
description: |
  System skill for automatic request analysis, prompt optimization, and intelligent routing to skills, workflows, or templates. Instead of calling skills individually, this skill analyzes user input, researches and improves the prompt for clarity and accuracy, identifies relevant skills, workflows, or templates, and coordinates execution.

  Use this skill when the user provides a general request that needs automatic decomposition, when the prompt needs optimization for better AI understanding, when appropriate skills or workflows need to be identified and executed, or when a template is needed for reports, issues, or other structured outputs.

  This is a **system skill** - it does not perform domain-specific work but routes to and coordinates **working skills** (chosen using **stack context** — see Stack context resolution; e.g. flutter-pro vs react-pro), **workflows** (/ticket, /debug, /release, etc.), and **templates** (reports, issues, prompts, etc.).

  Triggers: "route", "analyze", "plan", "break down", "how should I", "what skills", "optimize prompt", "orchestrate", "help me with", "template", "report format", "issue template".

metadata:
  short-description: Router — auto analysis, prompt optimization, skill/workflow/template discovery, execution
  content-language: en
  domain: system
  level: foundation
---

# Router (system skill)

Skill text is **English**; answer in the user’s preferred language when Cursor User Rules, project rules, or the conversation specify it.

This skill automatically analyzes user requests, researches and improves prompts for clarity and accuracy, identifies relevant skills, workflows, or templates, and coordinates execution. It serves as an intelligent middle layer between user input and domain-specific execution.

## Boundary

**`router-pro`** owns automatic request analysis, prompt research and optimization, skill/workflow/template discovery, and execution coordination. It does **not** own domain-specific implementation - those are delegated to:

- **Working skills** - Discovered dynamically from `skills/` directory or `skill_index.json` based on triggers and descriptions
- **Workflows** - Structured procedures in `workflows/` directory
- **Templates** - Static resources in `templates/` directory (reports, issues, prompts, scaffolds)

### Dynamic skill discovery

Skills are discovered automatically by:
1. Reading `skills/` directory or `knowledge-base/embeddings/skill_index.json`
2. Matching user input to skill triggers and descriptions
3. Ranking skills by relevance (trigger matches, description keywords, domain alignment)

No hardcoding required - the system automatically discovers all available skills.

## When to use

- User provides a general request that needs automatic analysis and routing
- Prompt needs research and optimization for clarity and accuracy
- Appropriate skills, workflows, or templates need to be identified automatically
- User asks "how should I approach X" or "help me with Y"
- Request needs decomposition into actionable steps
- Multiple skills, workflows, or templates might be needed for a complex task
- User needs a report format, issue template, or other structured output
- User asks for "template", "report format", "issue template"

## When not to use

- User request is clearly domain-specific and can directly use a working skill
- User explicitly names a specific skill (e.g., "use auth-pro")
- Simple, single-skill tasks that don't need orchestration
- When the working skill can handle the request directly

## Required inputs

- **User query**: The original user request or description
- **Context**: Project context (tech stack, constraints, goals)
- **Current state**: What's already been done or implemented

## Expected output

Follow **Suggested response format (STRICT)**.

## Workflow

Apply **Karpathy principles** throughout: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution.

1. **Confirm** **Analyze** the user input to understand intent, scope, and complexity → verify: [context documented].
2. **State assumptions** about requirements, constraints (**Think Before Coding**).
3. **Apply** minimum solution first; escalate only when justified (**Simplicity First**).
4. **Make surgical changes** — only touch code directly related to the request (**Surgical Changes**).
5. **Define success criteria**; loop until verified (**Goal-Driven Execution**).
6. **Respond** using **Suggested response format**; note main risks.

### Stack context resolution (mandatory before naming domain skills)

Router output must reflect **actual workspace / task stack**, not defaults from examples.

1. **Infer stack first** (use whatever evidence exists; order is flexible):
   - **Explicit**: user or rules say Flutter, Next.js, Nest, RN, etc.
   - **Workspace markers**: `pubspec.yaml` + `lib/**/*.dart` → **Flutter/Dart**; `package.json` + `next.config.*` → **Next.js**; `package.json` + `react` (no Next) → **React web**; `nest-cli.json` / `@nestjs` → **NestJS**; `Cargo.toml` + `src-tauri` → **Tauri**; `.kts` / `android/` + Kotlin → Android-native patterns (no `flutter-pro`).
   - **Open / attached paths**: e.g. `lib/foo.dart` → Dart/Flutter; `app/**/*.tsx` with Next imports → Next.
2. **Map UI / app-layer work to the matching skill**:
   - Flutter widgets, Riverpod, Dart async → **`flutter-pro`** (not `react-pro`).
   - React web (SPA/Vite/webpack) → **`react-pro`**.
   - Next App Router / RSC → **`nextjs-pro`**.
   - React Native / Expo → **`react-native-pro`**.
3. **Cross-cutting** skills stay stack-agnostic: **`testing-pro`**, **`auth-pro`**, **`security-pro`**, **`api-design-pro`**, **`postgresql-pro`**, **`docker-pro`**, etc., combined with the **correct** stack skill.
4. **Forbidden**: recommending **`react-pro`** or **`nextjs-pro`** for a **Flutter/Dart-only** task (and the reverse). If uncertain, say so and list **both** hypotheses with what evidence would decide.

**Quick reference**

| Signals | Prefer (app layer) |
|--------|---------------------|
| `pubspec.yaml`, `.dart`, Flutter/Riverpod | **`flutter-pro`** |
| Next.js routes, `next/font`, middleware | **`nextjs-pro`** |
| `*.tsx` in CRA/Vite, no Next | **`react-pro`** |
| `expo`, `react-native` | **`react-native-pro`** |

### Operating principles

1. **Think Before Coding** — Confirm whether the request really needs routing or whether a direct working skill is already obvious. Ask only when ambiguity would materially change ownership.
2. **Simplicity First** — Route to the smallest sufficient set of skills or workflows. Do not create orchestration overhead for a one-skill task.
3. **Surgical Changes** — Add only the routing, decomposition, or template selection needed for the current request. Do not broaden the scope into unnecessary meta-analysis.
4. **Goal-Driven Execution** — Done = the request is mapped to clear owners, execution order is explicit, and the user can see why the route chosen is sufficient.
5. **Delegate real work** — This system skill should coordinate and hand off, not masquerade as a domain expert when a working skill should own the answer.
6. **Prefer explicit ownership** — When multiple skills apply, state who owns what rather than blending guidance into a vague combined response.
7. **Optimize the prompt, not the goal away** — Clarify and compress the request without changing the user’s intent.
8. **Templates are tools, not defaults** — Use a template only when structure improves execution or output quality.

## Default recommendations by scenario

- **Single clear domain task** — Route directly to one working skill with minimal overhead.
- **Ambiguous multi-part request** — Decompose into subproblems and assign owners explicitly.
- **Process-heavy request** — Prefer a matching workflow when one already exists instead of inventing a new sequence.
- **Structured output need** — Add a template only when the output shape materially matters.

## Anti-patterns

Summary: routing simple tasks through too many skills, mixing ownership, over-optimizing prompts until intent drifts, and treating templates as mandatory.

Details: [references/workflow-execution.md](references/workflow-execution.md)

### Skill discovery (summary)

How triggers, descriptions, and repo metadata should be used to find the smallest relevant set of working skills.

Details: [references/skill-discovery.md](references/skill-discovery.md)

### Workflow execution (summary)

How to sequence skill and workflow handoffs so complex tasks stay coordinated instead of fragmented.

Details: [references/workflow-execution.md](references/workflow-execution.md)

### Template catalog (summary)

What structured outputs are available and when they help execution rather than just adding ceremony.

Details: [references/template-catalog.md](references/template-catalog.md)

## Suggested response format (STRICT)

1. **Intent** — What the user is actually asking for and any assumptions that affect routing.
2. **Recommended route** — Skill(s), workflow(s), or template(s) to use, with explicit ownership.
3. **Execution order** — The minimum sequence required to complete the request.
4. **Why this route** — Short reasoning for why this is simpler or safer than alternatives.
5. **Residual risks** — Ambiguities, missing context, or cases where routing may need adjustment.

## Resources in this skill

| Topic | File |
|-------|------|
| Skill discovery algorithm and ranking | [references/skill-discovery.md](references/skill-discovery.md) |
| Workflow execution and sequencing | [references/workflow-execution.md](references/workflow-execution.md) |
| Template catalog | [references/template-catalog.md](references/template-catalog.md) |

## Quick example

**Input:** "Help me debug a flaky React test and propose the fix path." *(repo is React/Vite or test paths are `*.test.tsx` without Next)*
- Route to **`testing-pro`** for flake strategy and **`react-pro`** for component/runtime specifics.
- Keep ownership explicit: testing owns signal quality, React owns framework behavior.
- **Verify:** The route explains exactly which skill should answer which part.

**Input:** "Carousel on calendar home loses items after second create." *(workspace has `pubspec.yaml` / `lachonglvn/lib/...dart`)*
- Route to **`flutter-pro`** for Riverpod/notifier/widget flow; **`bug-discovery-pro`** or **`systematic-debugging-pro`** for trace; **`testing-pro`** if adding regression tests.
- Do **not** route app-layer work to **`react-pro`**.
- **Verify:** Recommended route names at least one **Dart/Flutter** skill for implementation.

**Input (tricky):** "Write a release report and also tell me what workflow to use."
- Use a release workflow for process guidance and a template only for the report output shape.
- Avoid sending the request through unrelated product or engineering skills.
- **Verify:** The output names one workflow and one template with a clear order.

**Input (cross-skill):** "How should I approach adding auth to a Next.js app with API changes?"
- Route to **`auth-pro`** plus **`nextjs-pro`**, and optionally **`api-design-pro`** if contract changes are substantial.
- Clarify ownership before any implementation starts.
- **Verify:** The decomposition is minimal and covers both app and API concerns without extra routing noise.

## Checklist before calling the skill done

- [ ] Confirmed that routing/orchestration is actually needed before invoking it (Think Before Coding)
- [ ] **Stack context** identified (markers or user); **domain/app skill matches stack** (e.g. Flutter → `flutter-pro`, not `react-pro`)
- [ ] Chose the minimum sufficient set of skills/workflows/templates (Simplicity First)
- [ ] Only added routing logic directly relevant to the request (Surgical Changes)
- [ ] Success criteria for the route are explicit: owners, order, and intended outcome (Goal-Driven Execution)
- [ ] Working-skill ownership is explicit where multiple skills apply
- [ ] Prompt optimization preserves the user’s original goal
- [ ] Templates are used only when they add real structure
- [ ] Residual ambiguities are called out rather than hidden
