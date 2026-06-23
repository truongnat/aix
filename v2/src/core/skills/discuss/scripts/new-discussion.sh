#!/usr/bin/env bash
#
# Scaffold a new discussion note from assets/discussion-template.md.
# Usage: scripts/new-discussion.sh <slug> [output-dir]

set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Usage: $0 <slug> [output-dir]" >&2
  exit 1
fi

SLUG="$1"
OUTPUT_DIR="${2:-.}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
DATE_PREFIX="$(date +%F)"
DEST="${OUTPUT_DIR%/}/${DATE_PREFIX}-${SLUG}-discussion.md"

if [[ -e "${DEST}" ]]; then
  echo "Refusing to overwrite existing file: ${DEST}" >&2
  exit 1
fi

mkdir -p "${OUTPUT_DIR}"
sed \
  -e "s/^# Discussion Note/# Discussion Note: ${SLUG}/" \
  "${SKILL_DIR}/assets/discussion-template.md" > "${DEST}"

echo "${DEST}"
