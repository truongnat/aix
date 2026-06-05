# README And Landing Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the README and landing page to present the project as a polished open-source tool, and integrate the walkthrough video in the right places.

**Architecture:** Keep the existing React landing-page structure, add one focused video section, and refine hero/onboarding messaging rather than rewriting the entire site. On the docs side, restructure the README around positioning, quickstart, and demo proof while linking the local MP4 honestly.

**Tech Stack:** Markdown, React, TypeScript, Vite, Node test runner

---

### Task 1: Add regression coverage for the refresh

**Files:**
- Create: `test/readme-landing-refresh.test.js`
- Test: `test/readme-landing-refresh.test.js`

- [ ] **Step 1: Write the failing test**

```js
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");

test("README includes walkthrough section and local video link", () => {
  const readme = fs.readFileSync(path.join(repoRoot, "README.md"), "utf8");
  assert.match(readme, /## Watch the walkthrough/);
  assert.match(readme, /\[AI_Engineering_Harness\.mp4\]\(\.\/AI_Engineering_Harness\.mp4\)/);
});

test("landing page wires in the walkthrough video section", () => {
  const app = fs.readFileSync(path.join(repoRoot, "site", "src", "App.tsx"), "utf8");
  const section = fs.readFileSync(
    path.join(repoRoot, "site", "src", "components", "VideoWalkthroughSection.tsx"),
    "utf8"
  );
  assert.match(app, /VideoWalkthroughSection/);
  assert.match(section, /AI_Engineering_Harness\.mp4/);
  assert.match(section, /Product walkthrough/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/readme-landing-refresh.test.js`
Expected: FAIL because the README section and landing-page component do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```text
Update README.md with a walkthrough section and create site/src/components/VideoWalkthroughSection.tsx, then wire it into site/src/App.tsx.
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/readme-landing-refresh.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add README.md site/src/App.tsx site/src/components/VideoWalkthroughSection.tsx test/readme-landing-refresh.test.js
git commit -m "feat: refresh README and landing walkthrough"
```

### Task 2: Refresh README structure and messaging

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update the README opening, demo section, and section ordering**

```text
Rework the top of README.md so value proposition, quickstart, walkthrough, and proof appear earlier while preserving the existing documentation depth.
```

- [ ] **Step 2: Verify walkthrough content is honest**

Run: `node --test test/readme-landing-refresh.test.js`
Expected: PASS and the README includes the local MP4 link.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: refresh README positioning and walkthrough"
```

### Task 3: Refresh landing-page flow and add embedded video

**Files:**
- Modify: `site/src/App.tsx`
- Modify: `site/src/components/Hero.tsx`
- Modify: `site/src/components/Navbar.tsx`
- Modify: `site/src/components/InstallSection.tsx`
- Modify: `site/src/components/CTA.tsx`
- Modify: `site/src/index.css`
- Create: `site/src/components/VideoWalkthroughSection.tsx`
- Create or copy asset: `site/public/AI_Engineering_Harness.mp4`

- [ ] **Step 1: Add the embedded walkthrough section**

```text
Create a dedicated mid-page video section with an HTML5 player, explanatory copy, and links to the README and GitHub repo.
```

- [ ] **Step 2: Tighten hero, nav, install, and CTA messaging**

```text
Shift the page toward an open-source-first presentation with stronger onboarding and cleaner navigation.
```

- [ ] **Step 3: Refine styling only where needed for cohesion**

```text
Add or adjust CSS classes that support the new walkthrough panel and the cleaner open-source visual hierarchy.
```

- [ ] **Step 4: Run site build verification**

Run: `npm run build`
Working directory: `site/`
Expected: build succeeds with no TypeScript or Vite errors.

- [ ] **Step 5: Commit**

```bash
git add site/src/App.tsx site/src/components/Hero.tsx site/src/components/Navbar.tsx site/src/components/InstallSection.tsx site/src/components/CTA.tsx site/src/components/VideoWalkthroughSection.tsx site/src/index.css site/public/AI_Engineering_Harness.mp4
git commit -m "feat: polish landing page and embed walkthrough"
```

### Task 4: Run full verification

**Files:**
- Test: `test/readme-landing-refresh.test.js`
- Test: `site/`

- [ ] **Step 1: Run the targeted regression test**

Run: `node --test test/readme-landing-refresh.test.js`
Expected: PASS

- [ ] **Step 2: Run repository test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Run landing-page production build**

Run: `npm run build`
Working directory: `site/`
Expected: PASS

- [ ] **Step 4: Review git diff**

Run: `git diff -- README.md site/src/App.tsx site/src/components/Hero.tsx site/src/components/Navbar.tsx site/src/components/InstallSection.tsx site/src/components/CTA.tsx site/src/components/VideoWalkthroughSection.tsx site/src/index.css test/readme-landing-refresh.test.js`
Expected: Changes remain scoped to the approved refresh.
