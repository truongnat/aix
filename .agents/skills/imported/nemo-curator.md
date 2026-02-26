# Skill: nemo-curator
Schema: antigrav.skill@v1

```json
{
  "description": "GPU-accelerated data curation for LLM training. Supports text/image/video/audio. Features fuzzy deduplication (16× faster), quality filtering (30+ heuristics), semantic deduplication, PII redaction, N",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155374,
  "model": "qwen3:8b",
  "name": "nemo-curator",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "05-data-processing/nemo-curator/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "data curation",
    "data processing",
    "deduplication",
    "gpu acceleration",
    "llm training data",
    "multimodal",
    "nemo curator",
    "nvidia",
    "pii redaction",
    "quality filtering",
    "rapids"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
GPU-accelerated data curation for LLM training. Supports text/image/video/audio. Features fuzzy deduplication (16× faster), quality filtering (30+ heuristics), semantic deduplication, PII redaction, NSFW detection. Scales across GPUs with RAPIDS. Use for preparing high-quality training datasets, cleaning web data, or deduplicating large corpora.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Text curation (CUDA 12)
uv pip install "nemo-curator[text_cuda12]"

# All modalities
uv pip install "nemo-curator[all_cuda12]"

# CPU-only (slower)
uv pip install "nemo-curator[cpu]"
- from nemo_curator import ScoreFilter, Modify
from nemo_curator.datasets import DocumentDataset
import pandas as pd

# Load data
df = pd.DataFrame({"text": ["Good document", "Bad doc", "Excellent text"]})
dataset = DocumentDataset(df)

# Quality filtering
def quality_score(doc):
    return len(doc["text"].split()) > 5  # Filter short docs

filtered = ScoreFilter(quality_score)(dataset)

# Deduplication
from nemo_curator.modules import ExactDuplicates
deduped = ExactDuplicates()(filtered)

# Save
deduped.to_parquet("curated_data/")
- from nemo_curator.filters import (
    WordCountFilter,
    RepeatedLinesFilter,
    UrlRatioFilter,
    NonAlphaNumericFilter
)

# Apply 30+ heuristic filters
from nemo_curator import ScoreFilter

# Word count filter
dataset = dataset.filter(WordCountFilter(min_words=50, max_words=100000))

# Remove repetitive content
dataset = dataset.filter(RepeatedLinesFilter(max_repeated_line_fraction=0.3))

# URL ratio filter
dataset = dataset.filter(UrlRatioFilter(max_url_ratio=0.2))

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `05-data-processing/nemo-curator/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# NeMo Curator - GPU-Accelerated Data Curation NVIDIA's toolkit for preparing high-quality training data for LLMs. ## When to use NeMo Curator **Use NeMo Curator when:** - Preparing LLM training data from web scrapes (Common Crawl) - Need fast deduplication (16× faster than CPU) - Curating multi-modal datasets (text, images, video, audio) - Filtering low-quality or toxic content - Scaling data processing across GPU cluster **Performance**: - **16× faster** fuzzy deduplication (8TB RedPajama v2) - **40% lower TCO** vs CPU alternatives - **Near-linear scaling** across GPU nodes **Use alternatives instead**: - **datatrove**: CPU-based, open-source data processing - **dolma**: Allen AI's data toolkit - **Ray Data**: General ML data processing (no curation focus) ## Quick start ### Installation

{{input}}
