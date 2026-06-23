#!/usr/bin/env bash
# Fail if a verify report has any unchecked status item or an unproven/fail result.
# Usage: scripts/check-claims.sh <report.md>
set -euo pipefail

REPORT="${1:?usage: check-claims.sh <report.md>}"

if [ ! -f "${REPORT}" ]; then
    echo "Report not found: ${REPORT}" >&2
    exit 1
fi

FAILED=0

OPEN_ITEMS=$(grep -n '^- \[ \]' "${REPORT}" || true)
if [ -n "${OPEN_ITEMS}" ]; then
    echo "Unchecked status items in ${REPORT}:" >&2
    echo "${OPEN_ITEMS}" >&2
    FAILED=1
fi

BAD_RESULTS=$(grep -niE '\| *(fail|unproven) *\|' "${REPORT}" || true)
if [ -n "${BAD_RESULTS}" ]; then
    echo "Unresolved claim-to-evidence rows in ${REPORT}:" >&2
    echo "${BAD_RESULTS}" >&2
    FAILED=1
fi

if [ "${FAILED}" -ne 0 ]; then
    exit 1
fi

echo "All claims in ${REPORT} are checked and proven"
