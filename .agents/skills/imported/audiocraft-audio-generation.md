# Skill: audiocraft-audio-generation
Schema: antigrav.skill@v1

```json
{
  "description": "PyTorch library for audio generation including text-to-music (MusicGen) and text-to-sound (AudioGen). Use when you need to generate music from text descriptions, create sound effects, or perform melod",
  "domain": "ai-research",
  "executor": "ollama",
  "imported_at_ms": 1772121155465,
  "model": "qwen3:8b",
  "name": "audiocraft-audio-generation",
  "risk": "unknown",
  "source": "https://github.com/Orchestra-Research/AI-Research-SKILLs",
  "source_commit": "8a14d269df6f44ee4ecae2de542a09800e42d829",
  "source_license": "MIT",
  "source_path": "18-multimodal/audiocraft/SKILL.md",
  "source_requested": "/tmp/agentic-sdlc-external/AI-Research-SKILLs",
  "tags": [
    "ai-research",
    "audio generation",
    "multimodal",
    "musicgen",
    "text-to-audio",
    "text-to-music"
  ],
  "temperature": 0.1,
  "trust_tier": "Constrained"
}
```

## Overview
PyTorch library for audio generation including text-to-music (MusicGen) and text-to-sound (AudioGen). Use when you need to generate music from text descriptions, create sound effects, or perform melody-conditioned music generation.

## When to Use
- Use when the task matches this skill domain.

## Examples
- # From PyPI
pip install audiocraft

# From GitHub (latest)
pip install git+https://github.com/facebookresearch/audiocraft.git

# Or use HuggingFace Transformers
pip install transformers torch torchaudio
- import torchaudio
from audiocraft.models import MusicGen

# Load model
model = MusicGen.get_pretrained('facebook/musicgen-small')

# Set generation parameters
model.set_generation_params(
    duration=8,  # seconds
    top_k=250,
    temperature=1.0
)

# Generate from text
descriptions = ["happy upbeat electronic dance music with synths"]
wav = model.generate(descriptions)

# Save audio
torchaudio.save("output.wav", wav[0].cpu(), sample_rate=32000)
- from transformers import AutoProcessor, MusicgenForConditionalGeneration
import scipy

# Load model and processor
processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small")
model.to("cuda")

# Generate music
inputs = processor(
    text=["80s pop track with bassy drums and synth"],
    padding=True,
    return_tensors="pt"
).to("cuda")

audio_values = model.generate(
    **inputs,
    do_sample=True,
    guidance_scale=3,
    max_new_tokens=256
)

# Save
sampling_rate = model.config.audio_encoder.sampling_rate
scipy.io.wavfile.write("output.wav", rate=sampling_rate, data=audio_values[0, 0].cpu().numpy())

## Limitations
- Imported guidance may require adaptation to local project conventions.

## Imported Notes
Imported from requested source `/tmp/agentic-sdlc-external/AI-Research-SKILLs`; resolved source `https://github.com/Orchestra-Research/AI-Research-SKILLs`; path `18-multimodal/audiocraft/SKILL.md`.
Pinned source commit: `8a14d269df6f44ee4ecae2de542a09800e42d829`.
Detected source license: `MIT`.

Original excerpt:

# AudioCraft: Audio Generation Comprehensive guide to using Meta's AudioCraft for text-to-music and text-to-audio generation with MusicGen, AudioGen, and EnCodec. ## When to use AudioCraft **Use AudioCraft when:** - Need to generate music from text descriptions - Creating sound effects and environmental audio - Building music generation applications - Need melody-conditioned music generation - Want stereo audio output - Require controllable music generation with style transfer **Key features:** - **MusicGen**: Text-to-music generation with melody conditioning - **AudioGen**: Text-to-sound effects generation - **EnCodec**: High-fidelity neural audio codec - **Multiple model sizes**: Small (300M) to Large (3.3B) - **Stereo support**: Full stereo audio generation - **Style conditioning**: Mus

{{input}}
