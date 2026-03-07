# Test Replay Workflow

Simple workflow to test replay store functionality.

## Steps

### analyze
- skill: llm_subagent
- input: "Analyze this simple task: add 2+2"
- on_failure: abort

### summarize
- skill: llm_subagent
- input: "Summarize the previous analysis in one sentence"
- depends_on: [analyze]
- on_failure: abort
