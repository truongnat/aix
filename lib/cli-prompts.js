"use strict";

const readline = require("node:readline");

function clearScreenLines(count) {
  if (count <= 0) {
    return;
  }
  readline.moveCursor(process.stdout, 0, -count);
  readline.cursorTo(process.stdout, 0);
  readline.clearScreenDown(process.stdout);
}

function formatCheckboxLine(item, selected, active) {
  const box = item.implemented ? (selected ? "[x]" : "[ ]") : "[ ]";
  const suffix = item.recommended ? " (recommended)" : "";
  const disabled = item.implemented ? "" : " (planned)";
  const pointer = active ? "> " : "  ";
  return `${pointer}${box} ${item.label}${suffix}${disabled}`;
}

/**
 * @param {Array<{ id: string, label: string, implemented: boolean, recommended?: boolean }>} items
 * @param {{ title: string, hint?: string, minSelected?: number }} options
 * @returns {Promise<string[]>}
 */
async function selectMany(items, options) {
  const hint = options.hint || "(space to toggle, enter to confirm)";
  const selectable = items.filter((i) => i.implemented);
  const minSelected = options.minSelected ?? 1;

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return selectManyFallback(selectable, options.title, minSelected);
  }

  const selected = new Set(items.filter((i) => i.implemented && i.recommended).map((i) => i.id));
  let index = Math.max(
    0,
    items.findIndex((i) => i.implemented && (i.recommended || selected.has(i.id)))
  );
  if (index < 0) {
    index = items.findIndex((i) => i.implemented);
  }

  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();

  const render = () => {
    const lines = [options.title, hint, ""];
    items.forEach((item, i) => {
      lines.push(formatCheckboxLine(item, selected.has(item.id), i === index));
    });
    return lines;
  };

  let lines = render();
  process.stdout.write(`${lines.join("\n")}\n`);

  return new Promise((resolve, reject) => {
    const onKeypress = (_str, key) => {
      if (key.name === "up") {
        do {
          index = (index - 1 + items.length) % items.length;
        } while (!items[index].implemented && items.some((i) => i.implemented));
      } else if (key.name === "down") {
        do {
          index = (index + 1) % items.length;
        } while (!items[index].implemented && items.some((i) => i.implemented));
      } else if (key.name === "space") {
        const item = items[index];
        if (!item.implemented) {
          return;
        }
        if (selected.has(item.id)) {
          selected.delete(item.id);
        } else {
          selected.add(item.id);
        }
      } else if (key.name === "return") {
        const chosen = [...selected];
        if (chosen.length < minSelected) {
          return;
        }
        cleanup();
        clearScreenLines(lines.length);
        resolve(chosen);
        return;
      } else if (key.ctrl && key.name === "c") {
        cleanup();
        reject(new Error("Aborted"));
        return;
      }

      clearScreenLines(lines.length);
      lines = render();
      process.stdout.write(`${lines.join("\n")}\n`);
    };

    const cleanup = () => {
      process.stdin.removeListener("keypress", onKeypress);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.pause();
    };

    process.stdin.on("keypress", onKeypress);
  });
}

async function selectManyFallback(selectable, title, minSelected) {
  console.log(title);
  selectable.forEach((item, i) => {
    const rec = item.recommended ? " (recommended)" : "";
    console.log(`  ${i + 1}) ${item.label}${rec}`);
  });
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => {
    rl.question(
      `Select (comma-separated numbers, default: ${selectable.find((i) => i.recommended)?.label || selectable[0].label}): `,
      resolve
    );
  });
  rl.close();

  const trimmed = answer.trim();
  if (!trimmed) {
    const def = selectable.find((i) => i.recommended) || selectable[0];
    return [def.id];
  }
  const indices = trimmed.split(",").map((s) => parseInt(s.trim(), 10) - 1);
  const ids = indices.filter((i) => i >= 0 && i < selectable.length).map((i) => selectable[i].id);
  if (ids.length < minSelected) {
    throw new Error("No valid selection");
  }
  return ids;
}

/**
 * @param {Array<{ id: string, label: string, description?: string }>} choices
 * @param {{ title: string, defaultId?: string }} options
 * @returns {Promise<string>}
 */
async function selectOne(choices, options) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return selectOneFallback(choices, options);
  }

  let index = choices.findIndex((c) => c.id === options.defaultId);
  if (index < 0) {
    index = 0;
  }

  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();

  const render = () => {
    const lines = [options.title, "(up/down, enter to confirm)", ""];
    choices.forEach((choice, i) => {
      const pointer = i === index ? "> " : "  ";
      const desc = choice.description ? ` — ${choice.description}` : "";
      lines.push(`${pointer}${choice.label}${desc}`);
    });
    return lines;
  };

  let lines = render();
  process.stdout.write(`${lines.join("\n")}\n`);

  return new Promise((resolve, reject) => {
    const onKeypress = (_str, key) => {
      if (key.name === "up") {
        index = (index - 1 + choices.length) % choices.length;
      } else if (key.name === "down") {
        index = (index + 1) % choices.length;
      } else if (key.name === "return") {
        cleanup();
        clearScreenLines(lines.length);
        resolve(choices[index].id);
        return;
      } else if (key.ctrl && key.name === "c") {
        cleanup();
        reject(new Error("Aborted"));
        return;
      }
      clearScreenLines(lines.length);
      lines = render();
      process.stdout.write(`${lines.join("\n")}\n`);
    };

    const cleanup = () => {
      process.stdin.removeListener("keypress", onKeypress);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.pause();
    };

    process.stdin.on("keypress", onKeypress);
  });
}

async function selectOneFallback(choices, options) {
  console.log(options.title);
  choices.forEach((c, i) => {
    console.log(`  ${i + 1}) ${c.label}${c.description ? ` — ${c.description}` : ""}`);
  });
  const defaultIndex = choices.findIndex((c) => c.id === options.defaultId);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => {
    rl.question(
      `Select [1-${choices.length}]${defaultIndex >= 0 ? ` (default ${defaultIndex + 1})` : ""}: `,
      resolve
    );
  });
  rl.close();
  const trimmed = answer.trim();
  if (!trimmed && defaultIndex >= 0) {
    return choices[defaultIndex].id;
  }
  const n = parseInt(trimmed, 10);
  if (n >= 1 && n <= choices.length) {
    return choices[n - 1].id;
  }
  return choices[defaultIndex >= 0 ? defaultIndex : 0].id;
}

/**
 * @param {string} message
 * @param {boolean} defaultYes
 * @returns {Promise<boolean>}
 */
async function confirm(message, defaultYes = true) {
  if (!process.stdin.isTTY) {
    return defaultYes;
  }
  const hint = defaultYes ? "[Y/n]" : "[y/N]";
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => {
    rl.question(`${message} ${hint} `, resolve);
  });
  rl.close();
  const trimmed = answer.trim().toLowerCase();
  if (!trimmed) {
    return defaultYes;
  }
  return trimmed === "y" || trimmed === "yes";
}

module.exports = {
  selectMany,
  selectOne,
  confirm,
};
