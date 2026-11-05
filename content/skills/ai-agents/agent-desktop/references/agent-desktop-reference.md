# agent-desktop Command Reference

Full command list for `vercel-labs/agent-desktop` CLI.

## System & Diagnostics
- `agent-desktop status` — Platform status, OS accessibility API, surface support
- `agent-desktop permissions --guide` — Guided permission setup on macOS
- `agent-desktop version` — Version and build information

## Observation & Inspection
- `agent-desktop snapshot --app <Name> -i` — Interactive accessibility tree (with `@snap:ref` IDs)
- `agent-desktop snapshot --app <Name>` — Full accessibility tree
- `agent-desktop list-apps` — List running desktop applications
- `agent-desktop list-windows` — List active windows
- `agent-desktop list-surfaces` — List available displays
- `agent-desktop get <ref> <attr>` — Query attribute on ref
- `agent-desktop find --role <role> --name <name>` — Find element by role and name
- `agent-desktop screenshot [--output path]` — Save PNG screenshot

## Action Primitives
- `agent-desktop click <ref>` — Left click
- `agent-desktop double-click <ref>` — Double click
- `agent-desktop right-click <ref>` — Right click
- `agent-desktop type <ref> <text>` — Type text into target
- `agent-desktop type <ref> --stdin` — Read text from stdin (prevents process table exposure)
- `agent-desktop set-value <ref> <value>` — Directly set element value
- `agent-desktop clear <ref>` — Clear input field
- `agent-desktop check <ref>` — Check checkbox
- `agent-desktop uncheck <ref>` — Uncheck checkbox
- `agent-desktop toggle <ref>` — Toggle control
- `agent-desktop expand <ref>` — Expand tree / accordion
- `agent-desktop collapse <ref>` — Collapse tree / accordion
- `agent-desktop scroll <direction> <amount>` — Scroll direction and amount
- `agent-desktop scroll-to <ref>` — Scroll element into view

## Application & Window Management
- `agent-desktop launch <app-name>` — Launch application
- `agent-desktop close-app <app-name>` — Terminate application
- `agent-desktop focus-window <window-id>` — Bring window to focus
- `agent-desktop resize-window <window-id> <w> <h>` — Resize window
- `agent-desktop move-window <window-id> <x> <y>` — Move window position
- `agent-desktop minimize <window-id>` — Minimize window
- `agent-desktop maximize <window-id>` — Maximize window

## Clipboard
- `agent-desktop clipboard-get` — Read system clipboard
- `agent-desktop clipboard-set --stdin` — Write stdin to clipboard
- `agent-desktop clipboard-clear` — Clear clipboard
