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

1. Export workflow trace data to Remotion props:

```bash
bash .agents/skills/dev/remotion_io_visualizer/scripts/export_trace_for_remotion.sh <instance_id>
```

2. Render still + video assets used by the landing page:

```bash
bash .agents/skills/dev/remotion_io_visualizer/scripts/render_remotion_demo.sh <instance_id>
```

Generated files:
- `docs/landing-astro/public/media/workflow-io-still.png`
- `docs/landing-astro/public/media/workflow-io-demo.mp4`
