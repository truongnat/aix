# Skill: gguf-quantization
Schema: antigrav.skill@v1

```json
{
  "description": "GGUF format and llama.cpp quantization for efficient CPU/GPU inference. Use when deploying models on consumer hardware, Apple Silicon, or when needing flexible quantization from 2-8 bit without GPU re",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155415,
  "model": "qwen3:8b",
  "name": "gguf-quantization",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "10-optimization/gguf/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "apple silicon",
    "cpu inference",
    "gguf",
    "llama.cpp",
    "model compression",
    "optimization",
    "quantization"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
GGUF format and llama.cpp quantization for efficient CPU/GPU inference. Use when deploying models on consumer hardware, Apple Silicon, or when needing flexible quantization from 2-8 bit without GPU requirements.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Clone llama.cpp
git clone https://github.com/ggml-org/llama.cpp
cd llama.cpp

# Build (CPU)
make

# Build with CUDA (NVIDIA)
make GGML_CUDA=1

# Build with Metal (Apple Silicon)
make GGML_METAL=1

# Install Python bindings (optional)
pip install llama-cpp-python
- # Install requirements
pip install -r requirements.txt

# Convert HuggingFace model to GGUF (FP16)
python convert_hf_to_gguf.py ./path/to/model --outfile model-f16.gguf

# Or specify output type
python convert_hf_to_gguf.py ./path/to/model \
    --outfile model-f16.gguf \
    --outtype f16
- # Basic quantization to Q4_K_M
./llama-quantize model-f16.gguf model-q4_k_m.gguf Q4_K_M

# Quantize with importance matrix (better quality)
./llama-imatrix -m model-f16.gguf -f calibration.txt -o model.imatrix
./llama-quantize --imatrix model.imatrix model-f16.gguf model-q4_k_m.gguf Q4_K_M

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `10-optimization/gguf/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# GGUF - Quantization Format for llama.cpp The GGUF (GPT-Generated Unified Format) is the standard file format for llama.cpp, enabling efficient inference on CPUs, Apple Silicon, and GPUs with flexible quantization options. ## When to use GGUF **Use GGUF when:** - Deploying on consumer hardware (laptops, desktops) - Running on Apple Silicon (M1/M2/M3) with Metal acceleration - Need CPU inference without GPU requirements - Want flexible quantization (Q2_K to Q8_0) - Using local AI tools (LM Studio, Ollama, text-generation-webui) **Key advantages:** - **Universal hardware**: CPU, Apple Silicon, NVIDIA, AMD support - **No Python runtime**: Pure C/C++ inference - **Flexible quantization**: 2-8 bit with various methods (K-quants) - **Ecosystem support**: LM Studio, Ollama, koboldcpp, and more -

{{input}}
