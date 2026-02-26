# Skill: modal-serverless-gpu
Schema: antigrav.skill@v1

```json
{
  "description": "Serverless GPU cloud platform for running ML workloads. Use when you need on-demand GPU access without infrastructure management, deploying ML models as APIs, or running batch jobs with automatic scal",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155410,
  "model": "qwen3:8b",
  "name": "modal-serverless-gpu",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "09-infrastructure/modal/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "cloud",
    "deployment",
    "gpu",
    "infrastructure",
    "modal",
    "serverless"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Serverless GPU cloud platform for running ML workloads. Use when you need on-demand GPU access without infrastructure management, deploying ML models as APIs, or running batch jobs with automatic scaling.

## When to Use
- Use when the task matches this skill domain.

## Examples
- pip install modal
modal setup  # Opens browser for authentication
- import modal

app = modal.App("hello-gpu")

@app.function(gpu="T4")
def gpu_info():
    import subprocess
    return subprocess.run(["nvidia-smi"], capture_output=True, text=True).stdout

@app.local_entrypoint()
def main():
    print(gpu_info.remote())
- import modal

app = modal.App("text-generation")
image = modal.Image.debian_slim().pip_install("transformers", "torch", "accelerate")

@app.cls(gpu="A10G", image=image)
class TextGenerator:
    @modal.enter()
    def load_model(self):
        from transformers import pipeline
        self.pipe = pipeline("text-generation", model="gpt2", device=0)

    @modal.method()
    def generate(self, prompt: str) -> str:
        return self.pipe(prompt, max_length=100)[0]["generated_text"]

@app.local_entrypoint()
def main():
    print(TextGenerator().generate.remote("Hello, world"))

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `09-infrastructure/modal/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Modal Serverless GPU Comprehensive guide to running ML workloads on Modal's serverless GPU cloud platform. ## When to use Modal **Use Modal when:** - Running GPU-intensive ML workloads without managing infrastructure - Deploying ML models as auto-scaling APIs - Running batch processing jobs (training, inference, data processing) - Need pay-per-second GPU pricing without idle costs - Prototyping ML applications quickly - Running scheduled jobs (cron-like workloads) **Key features:** - **Serverless GPUs**: T4, L4, A10G, L40S, A100, H100, H200, B200 on-demand - **Python-native**: Define infrastructure in Python code, no YAML - **Auto-scaling**: Scale to zero, scale to 100+ GPUs instantly - **Sub-second cold starts**: Rust-based infrastructure for fast container launches - **Container cachin

{{input}}
