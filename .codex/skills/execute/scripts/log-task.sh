#!/usr/bin/env bash
# Append one task-attempt row to an execution log, creating it from the template if missing.
# Usage: scripts/log-task.sh <log-file> <plan-ref> <task> <verification> <status: done|failed|blocked> <evidence>
set -euo pipefail

LOG_FILE="${1:?usage: log-task.sh <log-file> <plan-ref> <task> <verification> <status> <evidence>}"
PLAN_REF="${2:?usage: log-task.sh <log-file> <plan-ref> <task> <verification> <status> <evidence>}"
TASK="${3:?usage: log-task.sh <log-file> <plan-ref> <task> <verification> <status> <evidence>}"
VERIFICATION="${4:?usage: log-task.sh <log-file> <plan-ref> <task> <verification> <status> <evidence>}"
STATUS="${5:?usage: log-task.sh <log-file> <plan-ref> <task> <verification> <status> <evidence>}"
EVIDENCE="${6:?usage: log-task.sh <log-file> <plan-ref> <task> <verification> <status> <evidence>}"
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

case "${STATUS}" in
    done|failed|blocked) ;;
    *) echo "status must be one of: done, failed, blocked (got '${STATUS}')" >&2; exit 1 ;;
esac

if [ ! -f "${LOG_FILE}" ]; then
    mkdir -p "$(dirname "${LOG_FILE}")"
    SLUG="$(basename "${LOG_FILE}" .md)"
    sed \
        -e "s/{{SLUG}}/${SLUG}/g" \
        -e "s#{{PLAN_REF}}#${PLAN_REF}#g" \
        "${SKILL_DIR}/assets/task-log-template.md" > "${LOG_FILE}"
fi

printf '| %s | %s | %s | %s | %s |\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "${TASK}" "${VERIFICATION}" "${STATUS}" "${EVIDENCE}" >> "${LOG_FILE}"

echo "Logged '${TASK}' (${STATUS}) to ${LOG_FILE}"
