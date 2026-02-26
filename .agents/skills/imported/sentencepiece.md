# Skill: sentencepiece
Schema: antigrav.skill@v1

```json
{
  "description": "Language-independent tokenizer treating text as raw Unicode. Supports BPE and Unigram algorithms. Fast (50k sentences/sec), lightweight (6MB memory), deterministic vocabulary. Used by T5, ALBERT, XLNe",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155360,
  "model": "qwen3:8b",
  "name": "sentencepiece",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "02-tokenization/sentencepiece/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "bpe",
    "cjk languages",
    "deterministic",
    "google",
    "language-independent",
    "multilingual",
    "sentencepiece",
    "tokenization",
    "unicode",
    "unigram"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
Language-independent tokenizer treating text as raw Unicode. Supports BPE and Unigram algorithms. Fast (50k sentences/sec), lightweight (6MB memory), deterministic vocabulary. Used by T5, ALBERT, XLNet, mBART. Train on raw text without pre-tokenization. Use when you need multilingual support, CJK languages, or reproducible tokenization.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Python
pip install sentencepiece

# C++ (requires CMake)
git clone https://github.com/google/sentencepiece.git
cd sentencepiece
mkdir build && cd build
cmake .. && make -j $(nproc)
sudo make install
- # Command-line (BPE with 8000 vocab)
spm_train --input=data.txt --model_prefix=m --vocab_size=8000 --model_type=bpe

# Python API
import sentencepiece as spm

spm.SentencePieceTrainer.train(
    input='data.txt',
    model_prefix='m',
    vocab_size=8000,
    model_type='bpe'
)
- import sentencepiece as spm

# Load model
sp = spm.SentencePieceProcessor(model_file='m.model')

# Encode to pieces
pieces = sp.encode('This is a test', out_type=str)
print(pieces)  # ['▁This', '▁is', '▁a', '▁test']

# Encode to IDs
ids = sp.encode('This is a test', out_type=int)
print(ids)  # [284, 47, 11, 1243]

# Decode
text = sp.decode(ids)
print(text)  # "This is a test"

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `02-tokenization/sentencepiece/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# SentencePiece - Language-Independent Tokenization Unsupervised tokenizer that works on raw text without language-specific preprocessing. ## When to use SentencePiece **Use SentencePiece when:** - Building multilingual models (no language-specific rules) - Working with CJK languages (Chinese, Japanese, Korean) - Need reproducible tokenization (deterministic vocabulary) - Want to train on raw text (no pre-tokenization needed) - Require lightweight deployment (6MB memory, 50k sentences/sec) **Performance**: - **Speed**: 50,000 sentences/sec - **Memory**: ~6MB for loaded model - **Languages**: All (language-independent) **Use alternatives instead**: - **HuggingFace Tokenizers**: Faster training, more flexibility - **tiktoken**: OpenAI models (GPT-3.5/4) - **BERT WordPiece**: English-centric

{{input}}
