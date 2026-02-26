# Skill: mamba-architecture
Schema: antigrav.skill@v1

```json
{
  "description": "State-space model with O(n) complexity vs Transformers' O(n²). 5× faster inference, million-token sequences, no KV cache. Selective SSM with hardware-aware design. Mamba-1 (d_state=16) and Mamba-2 (d_",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155353,
  "model": "qwen3:8b",
  "name": "mamba-architecture",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "01-model-architecture/mamba/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "alternative to transformers",
    "efficient inference",
    "hardware-aware",
    "linear complexity",
    "long context",
    "mamba",
    "model architecture",
    "ssm",
    "state space models"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
State-space model with O(n) complexity vs Transformers' O(n²). 5× faster inference, million-token sequences, no KV cache. Selective SSM with hardware-aware design. Mamba-1 (d_state=16) and Mamba-2 (d_state=128, multi-head). Models 130M-2.8B on HuggingFace.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Install causal-conv1d (optional, for efficiency)
pip install causal-conv1d>=1.4.0

# Install Mamba
pip install mamba-ssm
# Or both together
pip install mamba-ssm[causal-conv1d]
- import torch
from mamba_ssm import Mamba

batch, length, dim = 2, 64, 16
x = torch.randn(batch, length, dim).to("cuda")

model = Mamba(
    d_model=dim,      # Model dimension
    d_state=16,       # SSM state dimension
    d_conv=4,         # Conv1d kernel size
    expand=2          # Expansion factor
).to("cuda")

y = model(x)  # O(n) complexity!
assert y.shape == x.shape
- from mamba_ssm.models.mixer_seq_simple import MambaLMHeadModel
from mamba_ssm.models.config_mamba import MambaConfig
import torch

# Configure Mamba-2 LM
config = MambaConfig(
    d_model=1024,           # Hidden dimension
    n_layer=24,             # Number of layers
    vocab_size=50277,       # Vocabulary size
    ssm_cfg=dict(
        layer="Mamba2",     # Use Mamba-2
        d_state=128,        # Larger state for Mamba-2
        headdim=64,         # Head dimension
        ngroups=1           # Number of groups
    )
)

model = MambaLMHeadModel(config, device="cuda", dtype=torch.float16)

# Generate text
input_ids = torch.randint(0, 1000, (1, 20), device="cuda", dtype=torch.long)
output = model.generate(
    input_ids=input_ids,
    max_length=100,
    temperature=0.7,
    top_p=0.9
)

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `01-model-architecture/mamba/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Mamba - Selective State Space Models ## Quick start Mamba is a state-space model architecture achieving O(n) linear complexity for sequence modeling. **Installation**: ```bash # Install causal-conv1d (optional, for efficiency) pip install causal-conv1d>=1.4.0 # Install Mamba pip install mamba-ssm # Or both together pip install mamba-ssm[causal-conv1d] ``` **Prerequisites**: Linux, NVIDIA GPU, PyTorch 1.12+, CUDA 11.6+ **Basic usage** (Mamba block): ```python import torch from mamba_ssm import Mamba batch, length, dim = 2, 64, 16 x = torch.randn(batch, length, dim).to("cuda") model = Mamba( d_model=dim, # Model dimension d_state=16, # SSM state dimension d_conv=4, # Conv1d kernel size expand=2 # Expansion factor ).to("cuda") y = model(x) # O(n) complexity! assert y.shape == x.shape ``` ##

{{input}}
