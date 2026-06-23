#!/usr/bin/env bash
# Scaffold a new plan from assets/plan-template.md.
# Usage: scripts/new-plan.sh <slug> <brief-ref> [output-dir]
set -euo pipefail

SLUG="${1:?usage: new-plan.sh <slug> <brief-ref> [output-dir]}"
BRIEF_REF="${2:?usage: new-plan.sh <slug> <brief-ref> [output-dir]}"
OUT_DIR="${3:-docs/plans}"
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="${OUT_DIR}/${SLUG}.md"

mkdir -p "${OUT_DIR}"

if [ -f "${DEST}" ]; then
    echo "Plan already exists: ${DEST}" >&2
    exit 1
fi

sed \
    -e "s/{{SLUG}}/${SLUG}/g" \
    -e "s/{{DATE}}/$(date +%Y-%m-%d)/g" \
    -e "s#{{BRIEF_REF}}#${BRIEF_REF}#g" \
    "${SKILL_DIR}/assets/plan-template.md" > "${DEST}"

echo "Created ${DEST}"
