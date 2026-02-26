# Skill: whisper
Schema: antigrav.skill@v1

```json
{
  "description": "OpenAI's general-purpose speech recognition model. Supports 99 languages, transcription, translation to English, and language identification. Six model sizes from tiny (39M params) to large (1550M par",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155477,
  "model": "qwen3:8b",
  "name": "whisper",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "18-multimodal/whisper/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "asr",
    "audio processing",
    "multilingual",
    "multimodal",
    "openai",
    "speech recognition",
    "speech-to-text",
    "transcription",
    "translation",
    "whisper"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
OpenAI's general-purpose speech recognition model. Supports 99 languages, transcription, translation to English, and language identification. Six model sizes from tiny (39M params) to large (1550M params). Use for speech-to-text, podcast transcription, or multilingual audio processing. Best for robust, multilingual ASR.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # Requires Python 3.8-3.11
pip install -U openai-whisper

# Requires ffmpeg
# macOS: brew install ffmpeg
# Ubuntu: sudo apt install ffmpeg
# Windows: choco install ffmpeg
- import whisper

# Load model
model = whisper.load_model("base")

# Transcribe
result = model.transcribe("audio.mp3")

# Print text
print(result["text"])

# Access segments
for segment in result["segments"]:
    print(f"[{segment['start']:.2f}s - {segment['end']:.2f}s] {segment['text']}")
- # Available models
models = ["tiny", "base", "small", "medium", "large", "turbo"]

# Load specific model
model = whisper.load_model("turbo")  # Fastest, good quality

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `18-multimodal/whisper/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# Whisper - Robust Speech Recognition OpenAI's multilingual speech recognition model. ## When to use Whisper **Use when:** - Speech-to-text transcription (99 languages) - Podcast/video transcription - Meeting notes automation - Translation to English - Noisy audio transcription - Multilingual audio processing **Metrics**: - **72,900+ GitHub stars** - 99 languages supported - Trained on 680,000 hours of audio - MIT License **Use alternatives instead**: - **AssemblyAI**: Managed API, speaker diarization - **Deepgram**: Real-time streaming ASR - **Google Speech-to-Text**: Cloud-based ## Quick start ### Installation ```bash # Requires Python 3.8-3.11 pip install -U openai-whisper # Requires ffmpeg # macOS: brew install ffmpeg # Ubuntu: sudo apt install ffmpeg # Windows: choco install ffmpeg ``

{{input}}
