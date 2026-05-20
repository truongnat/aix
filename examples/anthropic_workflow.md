# Anthropic Claude Example Workflow

Example workflow using Anthropic Claude for high-quality code review.

## Setup

```bash
export ANTHROPIC_API_KEY=sk-ant-...
export AGENTIC_SDLC_LLM_PROVIDER=anthropic
export AGENTIC_SDLC_LLM_MODEL=claude-3-5-sonnet-latest
```

## Workflow

### analyze_code
- skill: llm_subagent
- input: |
    Analyze this Python function for potential issues:
    
    ```python
    def process_user_data(data):
        user_id = data['id']
        email = data['email']
        query = f"SELECT * FROM users WHERE id={user_id} AND email='{email}'"
        return execute_query(query)
    ```
    
    Focus on:
    1. Security vulnerabilities
    2. Error handling
    3. Best practices
- on_failure: abort

### suggest_fixes
- skill: llm_subagent
- input: "Based on the analysis, provide specific code fixes with explanations"
- depends_on: [analyze_code]
- on_failure: abort

### generate_tests
- skill: llm_subagent
- input: "Generate comprehensive unit tests for the fixed code"
- depends_on: [suggest_fixes]
- on_failure: abort

## Expected Output

Claude will identify:
- SQL injection vulnerability
- Missing error handling
- Lack of input validation

And provide:
- Secure parameterized queries
- Try-catch blocks
- Input validation
- Comprehensive tests

## Run

```bash
cargo run -- --workflow examples/anthropic_workflow.md
```

## Cost Estimate

- ~500 tokens input per step
- ~300 tokens output per step
- Total: ~2,400 tokens
- Cost: ~$0.045 (Sonnet)
