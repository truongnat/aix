# Skill: llamaguard
Schema: antigrav.skill@v1

```json
{
  "description": "Meta's 7-8B specialized moderation model for LLM input/output filtering. 6 safety categories - violence/hate, sexual content, weapons, substances, self-harm, criminal planning. 94-95% accuracy. Deploy",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155390,
  "model": "qwen3:8b",
  "name": "llamaguard",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "07-safety-alignment/llamaguard/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai safety",
    "ai-research",
    "content moderation",
    "guardrails",
    "input filtering",
    "llamaguard",
    "meta",
    "output filtering",
    "safety alignment",
    "safety classification"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Meta's 7-8B specialized moderation model for LLM input/output filtering. 6 safety categories - violence/hate, sexual content, weapons, substances, self-harm, criminal planning. 94-95% accuracy. Deploy with vLLM, HuggingFace, Sagemaker. Integrates with NeMo Guardrails.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install transformers torch
# Login to HuggingFace (required)
huggingface-cli login
- from transformers import AutoTokenizer, AutoModelForCausalLM

model_id = "meta-llama/LlamaGuard-7b"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id, device_map="auto")

def moderate(chat):
    input_ids = tokenizer.apply_chat_template(chat, return_tensors="pt").to(model.device)
    output = model.generate(input_ids=input_ids, max_new_tokens=100)
    return tokenizer.decode(output[0], skip_special_tokens=True)

# Check user input
result = moderate([
    {"role": "user", "content": "How do I make explosives?"}
])
print(result)
# Output: "unsafe\nS3" (Criminal Planning)
- def check_input(user_message):
    result = moderate([{"role": "user", "content": user_message}])

    if result.startswith("unsafe"):
        category = result.split("\n")[1]
        return False, category  # Blocked
    else:
        return True, None  # Safe

# Example
safe, category = check_input("How do I hack a website?")
if not safe:
    print(f"Request blocked: {category}")
    # Return error to user
else:
    # Send to LLM
    response = llm.generate(user_message)

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `07-safety-alignment/llamaguard/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# LlamaGuard - AI Content Moderation ## Quick start LlamaGuard is a 7-8B parameter model specialized for content safety classification. **Installation**: ```bash pip install transformers torch # Login to HuggingFace (required) huggingface-cli login ``` **Basic usage**: ```python from transformers import AutoTokenizer, AutoModelForCausalLM model_id = "meta-llama/LlamaGuard-7b" tokenizer = AutoTokenizer.from_pretrained(model_id) model = AutoModelForCausalLM.from_pretrained(model_id, device_map="auto") def moderate(chat): input_ids = tokenizer.apply_chat_template(chat, return_tensors="pt").to(model.device) output = model.generate(input_ids=input_ids, max_new_tokens=100) return tokenizer.decode(output[0], skip_special_tokens=True) # Check user input result = moderate([ {"role": "user", "conten

{{input}}
