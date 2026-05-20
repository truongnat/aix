# Skill: systematic-debugging
Schema: agentic-sdlc.skill@v1

```json
{
  "description": "Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154401,
  "model": "qwen3:8b",
  "name": "systematic-debugging",
  "risk": "safe",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "systematic-debugging/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/antigravity-workflow-skills",
  "tags": [
    "antigravity",
    "debugging",
    "external",
    "imported",
    "systematic"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes

## When to Use
- Test failures
- Bugs in production
- Unexpected behavior
- Performance problems
- Build failures
- Integration issues
- Under time pressure (emergencies make guessing tempting)
- "Just one quick fix" seems obvious
- You've already tried multiple fixes
- Previous fix didn't work
- You don't fully understand the issue
- Issue seems simple (simple bugs have root causes too)
- You're in a hurry (rushing guarantees rework)
- Manager wants it fixed NOW (systematic is faster than thrashing)

## Examples
- NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
- For EACH component boundary:
     - Log what data enters component
     - Log what data exits component
     - Verify environment/config propagation
     - Check state at each layer

   Run once to gather evidence showing WHERE it breaks
   THEN analyze evidence to identify failing component
   THEN investigate that specific component
- # Layer 1: Workflow
   echo "=== Secrets available in workflow: ==="
   echo "IDENTITY: ${IDENTITY:+SET}${IDENTITY:-UNSET}"

   # Layer 2: Build script
   echo "=== Env vars in build script: ==="
   env | grep IDENTITY || echo "IDENTITY not in environment"

   # Layer 3: Signing script
   echo "=== Keychain state: ==="
   security list-keychains
   security find-identity -v

   # Layer 4: Actual signing
   codesign --sign "$IDENTITY" --verbose=4 "$APP"

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `systematic-debugging/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Systematic Debugging ## Overview Random fixes waste time and create new bugs. Quick patches mask underlying issues. **Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure. **Violating the letter of this process is violating the spirit of debugging.** ## The Iron Law ``` NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST ``` If you haven't completed Phase 1, you cannot propose fixes. ## When to Use Use for ANY technical issue: - Test failures - Bugs in production - Unexpected behavior - Performance problems - Build failures - Integration issues **Use this ESPECIALLY when:** - Under time pressure (emergencies make guessing tempting) - "Just one quick fix" seems obvious - You've already tried multiple fixes - Previous fix didn't work - You don't fully und

{{input}}
