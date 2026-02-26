# Skill: verification-before-completion
Schema: antigrav.skill@v1

```json
{
  "description": "Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evide...",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154408,
  "model": "qwen3:8b",
  "name": "verification-before-completion",
  "risk": "unknown",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "verification-before-completion/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/antigravity-workflow-skills",
  "tags": [
    "antigravity",
    "external",
    "imported"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Use when about to claim work is complete, fixed, or passing, before committing or creating PRs - requires running verification commands and confirming output before making any success claims; evide...

## When to Use
- Use when the task matches this skill domain.

## Examples
- NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
- BEFORE claiming any status or expressing satisfaction:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code, count failures
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = lying, not verifying
- ✅ [Run test command] [See: 34/34 pass] "All tests pass"
❌ "Should pass now" / "Looks correct"

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `verification-before-completion/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Verification Before Completion ## Overview Claiming work is complete without verification is dishonesty, not efficiency. **Core principle:** Evidence before claims, always. **Violating the letter of this rule is violating the spirit of this rule.** ## The Iron Law ``` NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE ``` If you haven't run the verification command in this message, you cannot claim it passes. ## The Gate Function ``` BEFORE claiming any status or expressing satisfaction: 1. IDENTIFY: What command proves this claim? 2. RUN: Execute the FULL command (fresh, complete) 3. READ: Full output, check exit code, count failures 4. VERIFY: Does output confirm the claim? - If NO: State actual status with evidence - If YES: State claim WITH evidence 5. ONLY THEN: Make the claim

{{input}}
