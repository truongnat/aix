// src/types.ts
function resolvePreviewTier(question, options) {
  const hasArtifact = options.some((o) => o.artifact !== void 0);
  if (hasArtifact) return 2;
  const lower = question.toLowerCase();
  const tier1Keywords = ["architecture", "flow", "layout", "diagram", "mermaid", "structure"];
  const tier2Keywords = ["ui", "visual", "preview", "interface", "html", "render"];
  if (tier2Keywords.some((k) => lower.includes(k))) return 2;
  if (tier1Keywords.some((k) => lower.includes(k))) return 1;
  return 0;
}

// src/channel.ts
import { createRequire as makeRequire } from "module";
import { stdin as input, stdout as output } from "process";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { createPreviewServer } from "@x/preview";
var require2 = makeRequire(import.meta.url);
var readline = require2("node:readline/promises");
var ConsoleHitlChannel = class {
  constructor(_previewBaseUrl) {
  }
  async ask(req) {
    const previews = [];
    for (const opt of req.options) {
      let html = "";
      if (opt.artifact) {
        if (existsSync(opt.artifact)) {
          try {
            html = await readFile(opt.artifact, "utf-8");
          } catch {
            html = `<p>Error loading artifact: ${opt.artifact}</p>`;
          }
        } else {
          html = opt.artifact;
        }
      } else {
        html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${opt.label}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 3rem auto; padding: 0 1.5rem; color: #202124; line-height: 1.6; }
    h1 { color: #1a73e8; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
    .card { background: #f8f9fa; border: 1px solid #e0e0e0; padding: 2rem; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>${opt.label}</h1>
  <div class="card">
    <p>${opt.summary}</p>
  </div>
</body>
</html>`;
      }
      previews.push({
        id: opt.id,
        label: opt.label,
        summary: opt.summary,
        html
      });
    }
    let closeServer;
    let webChosenId;
    let resolveChoice;
    const choicePromise = new Promise((resolve) => {
      resolveChoice = resolve;
    });
    if (req.tier >= 1) {
      try {
        const server = createPreviewServer();
        const started = await server.start(previews, req.question, (id) => {
          webChosenId = id;
          resolveChoice({ chosen: id, note: "Selected via web preview panel" });
        });
        closeServer = started.close;
        console.log(`
\u{1F310} Interactive decision panel running at: \x1B[36m\x1B[4m${started.url}\x1B[0m`);
        console.log("You can preview options and select directly in your browser.");
      } catch (err) {
        console.warn("Failed to start preview server:", err);
      }
    }
    console.log(`
\u2753 ${req.question}
`);
    const promptTerminal = async () => {
      const rl = readline.createInterface({ input, output });
      try {
        for (let i = 0; i < req.options.length; i++) {
          const opt = req.options[i];
          console.log(`  ${i + 1}. ${opt.label}`);
          console.log(`     ${opt.summary}`);
          console.log();
        }
        const answer = await rl.question(`Choose (1-${req.options.length}) or select in browser: `);
        if (webChosenId) return;
        const idx = parseInt(answer, 10) - 1;
        if (idx < 0 || idx >= req.options.length) {
          console.log("Invalid choice, defaulting to first option");
          resolveChoice({ chosen: req.options[0].id });
          return;
        }
        const note = await rl.question("Note (optional, press Enter to skip): ");
        if (webChosenId) return;
        const trimmedNote = note.trim();
        resolveChoice({
          chosen: req.options[idx].id,
          ...trimmedNote.length > 0 ? { note: trimmedNote } : {}
        });
      } catch {
        if (!webChosenId) {
          resolveChoice({ chosen: req.options[0].id });
        }
      } finally {
        rl.close();
      }
    };
    promptTerminal();
    const choice = await choicePromise;
    if (closeServer) {
      await closeServer();
    }
    return choice;
  }
};

// src/clack-channel.ts
import * as p from "@clack/prompts";
var ClackHitlChannel = class {
  async ask(req) {
    const options = req.options.map((opt) => ({
      value: opt.id,
      label: opt.label,
      hint: opt.summary
    }));
    const result = await p.select({
      message: req.question,
      options
    });
    if (p.isCancel(result)) {
      return { chosen: "cancel" };
    }
    return { chosen: result };
  }
};
export {
  ClackHitlChannel,
  ConsoleHitlChannel,
  resolvePreviewTier
};
//# sourceMappingURL=index.js.map