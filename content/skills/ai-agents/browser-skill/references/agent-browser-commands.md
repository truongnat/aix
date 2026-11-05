# agent-browser Command Reference

Full command list for `vercel-labs/agent-browser` CLI.

## Navigation & Page
- `agent-browser open <url>` — Navigate to URL
- `agent-browser back` — Back in history
- `agent-browser forward` — Forward in history
- `agent-browser reload` — Reload current page
- `agent-browser get url` — Print current URL
- `agent-browser get title` — Print page title
- `agent-browser get text <ref>` — Print text content of ref element
- `agent-browser snapshot` — Dump complete accessibility tree
- `agent-browser snapshot -i` — Interactive accessibility tree with `@eN` refs
- `agent-browser close` — Close browser and daemon

## Interactions
- `agent-browser click <ref>` — Click element
- `agent-browser dblclick <ref>` — Double click element
- `agent-browser fill <ref> <text>` — Clear input and type text
- `agent-browser type <ref> <text>` — Append text to input
- `agent-browser press <key>` — Press key (Enter, Tab, Escape, Backspace, etc.)
- `agent-browser hover <ref>` — Hover over element
- `agent-browser focus <ref>` — Focus element
- `agent-browser select <ref> <value>` — Select `<option>` in `<select>`
- `agent-browser check <ref>` — Check checkbox or radio
- `agent-browser uncheck <ref>` — Uncheck checkbox
- `agent-browser scroll <direction> <amount>` — Scroll `up`, `down`, `left`, `right` by pixels
- `agent-browser upload <ref> <file-path>` — Upload file to input[type=file]

## Capture & Debug
- `agent-browser screenshot [path]` — Viewport screenshot (PNG)
- `agent-browser screenshot --full [path]` — Full-page screenshot
- `agent-browser eval <javascript>` — Evaluate JavaScript in page context
- `agent-browser console` — Print page console logs
- `agent-browser errors` — Print uncaught page errors

## Sessions & Flags
- `--session <id>` — Run in an isolated browser session
- `--headed` — Run visible browser instead of headless
- `--cdp <port-or-url>` — Connect to existing Chrome over Chrome DevTools Protocol
