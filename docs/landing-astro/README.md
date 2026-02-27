# Landing Page (Astro)

Value-focused landing page for `agentic-sdlc` built with Astro.

## Run locally

```bash
cd docs/landing-astro
npm install
npm run dev
```

## Build

```bash
cd docs/landing-astro
npm run build
```

Output directory: `docs/landing-astro/dist`

## Runtime Proof Video (Remotion)

1. Create/refresh showcase plan from workflow (includes security check gate):

```bash
cargo run -- --workflow-id dev/create-showcase-video --template dev/create-showcase-video_prompt --task "show structure, cli, use-cases, and landing output value"
```

2. Export workflow trace data to Remotion props:

```bash
bash .agents/skills/dev/remotion_io_visualizer/scripts/export_trace_for_remotion.sh <instance_id>
```

3. Render still + video assets used by the landing page:

```bash
bash .agents/skills/dev/remotion_io_visualizer/scripts/render_remotion_demo.sh <instance_id>
```

4. Optional: run security scan workflow before publishing assets:

```bash
cargo run -- --workflow-id cybersecurity/security-scan --template cybersecurity/security_scan_prompt --task "security gate for landing and media artifacts"
```

Optional AI narration:
- set `OPENAI_API_KEY` to generate AI script + TTS (`workflow-io-voice-v2.mp3`)
- without key, script falls back to local TTS on macOS when `say` + `ffmpeg` are available

Generated files:
- `docs/landing-astro/public/media/workflow-io-still-v2.png`
- `docs/landing-astro/public/media/workflow-io-demo-v2.mp4`
- `docs/landing-astro/public/media/workflow-io-voice-v2.mp3` (optional)

## Package Landing Artifacts

```bash
npm run build --prefix docs/landing-astro
tar -czf docs/landing-astro-package.tgz -C docs/landing-astro dist public/media public/remotion-data
```
