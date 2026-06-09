import readline from "node:readline";

interface SelectableItem {
  id: string;
  label: string;
  implemented: boolean;
  recommended?: boolean;
}

interface SelectManyOptions {
  title: string;
  hint?: string;
  minSelected?: number;
}

interface SelectOneChoice {
  id: string;
  label: string;
  description?: string;
}

interface SelectOneOptions {
  title: string;
  defaultId?: string;
}

function clearScreenLines(count: number): void {
  if (count <= 0) {
    return;
  }
  readline.moveCursor(process.stdout, 0, -count);
  readline.cursorTo(process.stdout, 0);
  readline.clearScreenDown(process.stdout);
}

function formatCheckboxLine(item: SelectableItem, selected: boolean, active: boolean): string {
  const box = item.implemented ? (selected ? "[x]" : "[ ]") : "[ ]";
  const suffix = item.recommended ? " (recommended)" : "";
  const disabled = item.implemented ? "" : " (planned)";
  const pointer = active ? "> " : "  ";
  return `${pointer}${box} ${item.label}${suffix}${disabled}`;
}

async function selectMany(items: SelectableItem[], options: SelectManyOptions): Promise<string[]> {
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
    const onKeypress = (
      _str: string,
      key: { name: string; ctrl?: boolean; meta?: boolean; shift?: boolean }
    ) => {
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

async function selectManyFallback(
  selectable: SelectableItem[],
  title: string,
  minSelected: number
): Promise<string[]> {
  console.log(title);
  selectable.forEach((item, i) => {
    const rec = item.recommended ? " (recommended)" : "";
    console.log(`  ${i + 1}) ${item.label}${rec}`);
  });
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise<string>((resolve) => {
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
  const indices = trimmed.split(",").map((s: string) => parseInt(s.trim(), 10) - 1);
  const ids = indices
    .filter((i: number) => i >= 0 && i < selectable.length)
    .map((i: number) => selectable[i].id);
  if (ids.length < minSelected) {
    throw new Error("No valid selection");
  }
  return ids;
}

async function selectOne(choices: SelectOneChoice[], options: SelectOneOptions): Promise<string> {
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
    const onKeypress = (
      _str: string,
      key: { name: string; ctrl?: boolean; meta?: boolean; shift?: boolean }
    ) => {
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

async function selectOneFallback(
  choices: SelectOneChoice[],
  options: SelectOneOptions
): Promise<string> {
  console.log(options.title);
  choices.forEach((c, i) => {
    console.log(`  ${i + 1}) ${c.label}${c.description ? ` — ${c.description}` : ""}`);
  });
  const defaultIndex = choices.findIndex((c) => c.id === options.defaultId);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise<string>((resolve) => {
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

async function confirm(message: string, defaultYes = true): Promise<boolean> {
  if (!process.stdin.isTTY) {
    return defaultYes;
  }
  const hint = defaultYes ? "[Y/n]" : "[y/N]";
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise<string>((resolve) => {
    rl.question(`${message} ${hint} `, resolve);
  });
  rl.close();
  const trimmed = answer.trim().toLowerCase();
  if (!trimmed) {
    return defaultYes;
  }
  return trimmed === "y" || trimmed === "yes";
}

export { selectMany, selectOne, confirm };
export type { SelectableItem, SelectManyOptions, SelectOneChoice, SelectOneOptions };
