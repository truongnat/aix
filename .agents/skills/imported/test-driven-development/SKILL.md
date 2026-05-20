# Skill: test-driven-development
Schema: agentic-sdlc.skill@v1

```json
{
  "description": "Use when implementing any feature or bugfix, before writing implementation code",
  "domain": "antigravity",
  "executor": "ollama",
  "imported_at_ms": 1772121154402,
  "model": "qwen3:8b",
  "name": "test-driven-development",
  "risk": "safe",
  "source": "sickn33/antigravity-awesome-skills",
  "source_commit": "5174a1eae642",
  "source_license": "MIT",
  "source_path": "test-driven-development/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-curated/antigravity-workflow-skills",
  "tags": [
    "antigravity",
    "development",
    "driven",
    "external",
    "imported",
    "test"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Use when implementing any feature or bugfix, before writing implementation code

## When to Use
- New features
- Bug fixes
- Refactoring
- Behavior changes
- Throwaway prototypes
- Generated code
- Configuration files

## Examples
- NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
- digraph tdd_cycle {
    rankdir=LR;
    red [label="RED\nWrite failing test", shape=box, style=filled, fillcolor="#ffcccc"];
    verify_red [label="Verify fails\ncorrectly", shape=diamond];
    green [label="GREEN\nMinimal code", shape=box, style=filled, fillcolor="#ccffcc"];
    verify_green [label="Verify passes\nAll green", shape=diamond];
    refactor [label="REFACTOR\nClean up", shape=box, style=filled, fillcolor="#ccccff"];
    next [label="Next", shape=ellipse];

    red -> verify_red;
    verify_red -> green [label="yes"];
    verify_red -> red [label="wrong\nfailure"];
    green -> verify_green;
    verify_green -> refactor [label="yes"];
    verify_green -> green [label="no"];
    refactor -> verify_green [label="stay\ngreen"];
    verify_green -> next;
    next -> red;
}
- test('retries failed operations 3 times', async () => {
  let attempts = 0;
  const operation = () => {
    attempts++;
    if (attempts < 3) throw new Error('fail');
    return 'success';
  };

  const result = await retryOperation(operation);

  expect(result).toBe('success');
  expect(attempts).toBe(3);
});

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; resolved source `/private/tmp/agentic-sdlc-curated/antigravity-workflow-skills`; path `test-driven-development/SKILL.md`.
Detected source license: `MIT`.

Original excerpt:

# Test-Driven Development (TDD) ## Overview Write the test first. Watch it fail. Write minimal code to pass. **Core principle:** If you didn't watch the test fail, you don't know if it tests the right thing. **Violating the letter of the rules is violating the spirit of the rules.** ## When to Use **Always:** - New features - Bug fixes - Refactoring - Behavior changes **Exceptions (ask your human partner):** - Throwaway prototypes - Generated code - Configuration files Thinking "skip TDD just this once"? Stop. That's rationalization. ## The Iron Law ``` NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST ``` Write code before the test? Delete it. Start over. **No exceptions:** - Don't keep it as "reference" - Don't "adapt" it while writing tests - Don't look at it - Delete means delete Impleme

{{input}}
