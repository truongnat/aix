#!/usr/bin/env bash
# Scaffold a new brainstorm brief from assets/brief-template.md.
# Usage: scripts/new-brief.sh <slug> [output-dir]
set -euo pipefail

SLUG="${1:?usage: new-brief.sh <slug> [output-dir]}"
OUT_DIR="${2:-docs/briefs}"
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="${OUT_DIR}/${SLUG}.md"

mkdir -p "${OUT_DIR}"

if [ -f "${DEST}" ]; then
    echo "Brief already exists: ${DEST}" >&2
    exit 1
fi

sed \
    -e "s/{{SLUG}}/${SLUG}/g" \
    -e "s/{{DATE}}/$(date +%Y-%m-%d)/g" \
    "${SKILL_DIR}/assets/brief-template.md" > "${DEST}"

echo "Created ${DEST}"
