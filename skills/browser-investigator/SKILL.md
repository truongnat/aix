---
name: browser-investigator
description: "Investigate a web/app bug from the outside by reading network requests/responses, console logs, and DOM state through a browser MCP connection. Use when the tester has no source code access and needs a technical hypothesis for a visible defect — what request failed, what error fired, what the DOM actually shows."
metadata:
  kind: "domain"
  version: "0.2.0"
  tags: "qa,debug,browser,devtools,investigation"
---

# Browser Investigator

## Timestamp and artifact convention
As soon as this skill starts, capture the current timestamp in the user's/project's timezone, formatted `YYYY-MM-DD HH:mm:ss Z`.

If investigation files are created, store them under:

```text
artifacts/YYYY-MM-DD/browser-investigator/HHmmss-short-issue/
```

Every artifact must record `Session timestamp`, URL, reproduction steps, observed console/network/DOM data, and redacted portions if sensitive data appeared. All main chat output must also show `Session timestamp`.

## Prerequisite
This skill requires a live browser MCP connection (e.g. Claude in Chrome) in the session. If none is available, tell the user and suggest connecting one — never fabricate network/console findings you could not actually read.

## Support scripts
If evidence files need normalizing before synthesis, prefer `--report` mode first:

- `evidence_manifest.py` for screenshots, logs, HAR files, JSON responses, or attached evidence
- `har_summarizer.py` for `.har` files — summarizes method, URL, status, host, slow requests
- `session_timeline_builder.py` to order all evidence files in a run chronologically
- `artifact_packager.py` to zip the full evidence bundle for handoff to devs
- `redact_sensitive.py` if text evidence contains tokens, emails, phones, or secrets

## Process

### Step 1 — Confirm the phenomenon
Ask (if unclear): what exactly is the bug behavior, at which step does it appear, and can it be reproduced right now?

### Step 2 — Reproduce and observe
1. Navigate through the browser to the exact step that triggers the issue.
2. While acting, observe and record:
   - **Console**: errors/warnings that appear, their exact text
   - **Network**: method, URL/path, status code, summarized request payload, response excerpt, request/correlation ID if present
   - **DOM state**: which element renders wrong, unusual classes/attributes vs expected
   - **Evidence**: timestamp, current URL, screenshot/video/HAR/log when obtainable

### Step 3 — Interpret, don't just dump raw data
Read the failure signature:
- `4xx` — likely client-side: wrong request payload, missing auth header, wrong URL.
- `5xx` — likely server-side failure.
- **No request fired at all** — the click handler may be broken, blocked by validation, or the button disabled: a frontend bug, not backend.
- `0`/`(failed)`/`CORS` — network-level or CORS issue.
- Response is `200` but UI shows error — data-shape mismatch; frontend may expect a field the response lacks.
- Console `TypeError`/`undefined is not a function` after a response — frontend crashed processing it.
- Stale-looking data with a `304`/cache response — possible caching bug.
- DOM element exists but `hidden`/`display:none` — logic reached a different branch than expected.

State each interpretation as a hypothesis with a confidence level, never as certainty — you see the outside of the system, not the code.

### Step 4 — Report in the standard format

```text
Phenomenon: [short description]

Session timestamp: [YYYY-MM-DD HH:mm:ss Z]

Observed:
- Console: [specific logs/errors, or "nothing abnormal"]
- Network: [method/path/status/payload summary/response summary/request ID]
- DOM: [relevant element, actual state vs expected]

Evidence table:
| Time | URL | Step | Evidence | Note |
|---|---|---|---|---|

Root-cause hypothesis: [analysis + likelihood — mark confidence, do not claim certainty without source access]

Attach for devs: [specific request/response, console screenshot, HAR section]
```

## Notes
- This is an INVESTIGATION aid, not a replacement for source-level debugging. Findings are external-observation hypotheses.
- If network data contains sensitive info (tokens, passwords, PII), never quote it verbatim — mask or truncate the sensitive part.
- Many evidence files? Run `evidence_manifest.py --report` first for file count, MIME types, and sensitive-data flags before attaching.
- Have a HAR? Run `har_summarizer.py --report` to reduce it to meaningful entries instead of reading the raw file.
- Before handing off, optionally run `session_timeline_builder.py --report` then `artifact_packager.py --report` to verify evidence completeness and ordering.
- If confirmed as a real bug, hand the output directly to `bug-report-writer`.
