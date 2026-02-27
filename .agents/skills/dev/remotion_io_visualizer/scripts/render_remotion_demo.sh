#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <instance_id> [landing_root]"
  exit 1
fi

INSTANCE_ID="$1"
LANDING_ROOT="${2:-docs/landing-astro}"
PROPS_PATH="${LANDING_ROOT}/public/remotion-data/${INSTANCE_ID}.props.json"
REMOTION_ROOT="${LANDING_ROOT}/remotion"
LANDING_MEDIA_ROOT="${LANDING_ROOT}/public/media"
REMOTION_PUBLIC_MEDIA_ROOT="${REMOTION_ROOT}/public/media"

if [[ ! -f "${PROPS_PATH}" ]]; then
  echo "Props file not found: ${PROPS_PATH}"
  echo "Run export first:"
  echo "  bash .agents/skills/dev/remotion_io_visualizer/scripts/export_trace_for_remotion.sh ${INSTANCE_ID}"
  exit 1
fi

if [[ ! -d "${REMOTION_ROOT}" ]]; then
  echo "Remotion project not found: ${REMOTION_ROOT}"
  exit 1
fi

# Remotion staticFile() serves files from remotion/public, so mirror landing media here.
mkdir -p "${REMOTION_PUBLIC_MEDIA_ROOT}"
if [[ -d "${LANDING_MEDIA_ROOT}" ]]; then
  rsync -a "${LANDING_MEDIA_ROOT}/" "${REMOTION_PUBLIC_MEDIA_ROOT}/"
fi

(cd "${REMOTION_ROOT}" && npm install)
(cd "${REMOTION_ROOT}" && npm run still -- --props "../public/remotion-data/${INSTANCE_ID}.props.json")
(cd "${REMOTION_ROOT}" && npm run render -- --props "../public/remotion-data/${INSTANCE_ID}.props.json")

echo "Rendered media:"
echo "  ${LANDING_ROOT}/public/media/workflow-io-still.png"
echo "  ${LANDING_ROOT}/public/media/workflow-io-demo.mp4"
