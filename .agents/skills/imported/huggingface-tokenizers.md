# Skill: huggingface-tokenizers
Schema: antigrav.skill@v1

```json
{
  "description": "Fast tokenizers optimized for research and production. Rust-based implementation tokenizes 1GB in <20 seconds. Supports BPE, WordPiece, and Unigram algorithms. Train custom vocabularies, track alignme",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155359,
  "model": "qwen3:8b",
  "name": "huggingface-tokenizers",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "02-tokenization/huggingface-tokenizers/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "alignment tracking",
    "bpe",
    "custom tokenizer",
    "fast tokenization",
    "huggingface",
    "production",
    "rust",
    "tokenization",
    "unigram",
    "wordpiece"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Fast tokenizers optimized for research and production. Rust-based implementation tokenizes 1GB in <20 seconds. Supports BPE, WordPiece, and Unigram algorithms. Train custom vocabularies, track alignments, handle padding/truncation. Integrates seamlessly with transformers. Use when you need high-performance tokenization or custom tokenizer training.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Install tokenizers
pip install tokenizers

# With transformers integration
pip install tokenizers transformers
- from tokenizers import Tokenizer

# Load from HuggingFace Hub
tokenizer = Tokenizer.from_pretrained("bert-base-uncased")

# Encode text
output = tokenizer.encode("Hello, how are you?")
print(output.tokens)  # ['hello', ',', 'how', 'are', 'you', '?']
print(output.ids)     # [7592, 1010, 2129, 2024, 2017, 1029]

# Decode back
text = tokenizer.decode(output.ids)
print(text)  # "hello, how are you?"
- from tokenizers import Tokenizer
from tokenizers.models import BPE
from tokenizers.trainers import BpeTrainer
from tokenizers.pre_tokenizers import Whitespace

# Initialize tokenizer with BPE model
tokenizer = Tokenizer(BPE(unk_token="[UNK]"))
tokenizer.pre_tokenizer = Whitespace()

# Configure trainer
trainer = BpeTrainer(
    vocab_size=30000,
    special_tokens=["[UNK]", "[CLS]", "[SEP]", "[PAD]", "[MASK]"],
    min_frequency=2
)

# Train on files
files = ["train.txt", "validation.txt"]
tokenizer.train(files, trainer)

# Save
tokenizer.save("my-tokenizer.json")

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `02-tokenization/huggingface-tokenizers/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# HuggingFace Tokenizers - Fast Tokenization for NLP Fast, production-ready tokenizers with Rust performance and Python ease-of-use. ## When to use HuggingFace Tokenizers **Use HuggingFace Tokenizers when:** - Need extremely fast tokenization (<20s per GB of text) - Training custom tokenizers from scratch - Want alignment tracking (token → original text position) - Building production NLP pipelines - Need to tokenize large corpora efficiently **Performance**: - **Speed**: <20 seconds to tokenize 1GB on CPU - **Implementation**: Rust core with Python/Node.js bindings - **Efficiency**: 10-100× faster than pure Python implementations **Use alternatives instead**: - **SentencePiece**: Language-independent, used by T5/ALBERT - **tiktoken**: OpenAI's BPE tokenizer for GPT models - **transformers

{{input}}
