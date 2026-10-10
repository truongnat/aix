# AI Design Anti-patterns

## 1. Over-specified prompts

**Symptom**: A 300-word prompt with conflicting instructions produces inconsistent results.
**Fix**: Start with `[subject] + [style] + [one key modifier]`. Add detail only when the baseline fails.

## 2. No version control on prompts

**Symptom**: A great image was generated, but the team can't reproduce it because the prompt was lost.
**Fix**: Store prompts in a `prompts/` directory with seed, CFG scale, and tool version. Treat prompts as code.

## 3. Skipping brand review

**Symptom**: AI-generated images go live with wrong colors, fonts embedded in images, or off-brand tone.
**Fix**: All generated assets pass through a human brand review gate before publishing. Document the review in a QA log.

## 4. Using AI for legally sensitive likeness

**Symptom**: AI generates images resembling real people, celebrities, or competitors' products.
**Fix**: Use abstract or clearly fictional subjects. Add negative prompts: `"no real people, no celebrities, no logos"`. Adobe Firefly is commercially safe.

## 5. Batch without human QA gate

**Symptom**: 500 AI-generated product images are published; 80 have obvious artifacts or wrong backgrounds.
**Fix**: Sample at least 10% of batches manually. Automate artifact detection (blur score, face detection) before bulk publishing.

## 6. Treating AI output as final

**Symptom**: Raw DALL-E output is used in production without cleanup.
**Fix**: AI output is a draft. Apply post-processing (color grading, cropping, background removal) before treating as production-ready.

## 7. Ignoring negative prompts

**Symptom**: Rewriting the entire prompt to fix one unwanted element (e.g., extra fingers).
**Fix**: Use negative prompts for targeted exclusion: `--no hands` (Midjourney) or `negative_prompt="extra fingers"` (Stable Diffusion).

## 8. Mixing tools without understanding differences

**Symptom**: Team switches from Midjourney to DALL-E mid-project, results look completely different.
**Fix**: Standardize on one tool per project. See [tool-comparison.md](tool-comparison.md) for trade-offs.
