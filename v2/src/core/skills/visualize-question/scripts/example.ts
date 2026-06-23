/**
 * Reference invocation for the `visualize-question` skill.
 * Run with: bun src/core/skills/visualize-question/scripts/example.ts
 *
 * The skill does not own rendering and ships no template. It generates the page
 * body HTML dynamically following tools/preview/references/design-guide.md,
 * honors the `data-choice` contract, calls the shared core tool, and records the
 * returned id into the calling artifact.
 */
import { askVisualQuestion } from '../../../tools/preview/index';

const chosenId = await askVisualQuestion({
    title: 'How should `doctor` report provider status?',
    // Structured choices drive the terminal fallback and validate the returned id.
    choices: [
        { id: 'flat', label: 'Option A — flat list' },
        { id: 'grouped', label: 'Option B — grouped table' },
    ],
    // Agent-generated body, authored per the design guide. Each option carries
    // a data-choice matching an id above.
    bodyHtml: `
    <main class="mx-auto max-w-5xl px-6 py-12">
      <p class="mb-2 text-sm font-medium uppercase tracking-wide text-stone-400">Harness · choose an option</p>
      <h1 class="mb-8 text-2xl font-semibold tracking-tight">How should <code>doctor</code> report provider status?</h1>
      <section class="grid gap-6 md:grid-cols-2">
        <article class="flex flex-col rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <header class="mb-3 text-sm font-semibold text-stone-500">Option A — flat list</header>
          <ul class="flex-1 space-y-1 text-sm text-stone-700"><li>✓ claude — installed</li><li>✗ codex — missing</li></ul>
          <button data-choice="flat" class="mt-5 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700">Choose this</button>
        </article>
        <article class="flex flex-col rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <header class="mb-3 text-sm font-semibold text-stone-500">Option B — grouped table</header>
          <table class="w-full flex-1 text-left text-sm text-stone-700">
            <thead><tr><th class="border-b px-3 py-2">Provider</th><th class="border-b px-3 py-2">Status</th></tr></thead>
            <tbody><tr><td class="border-b px-3 py-2">claude</td><td class="border-b px-3 py-2">✓ installed</td></tr>
            <tr><td class="px-3 py-2">codex</td><td class="px-3 py-2">✗ missing</td></tr></tbody>
          </table>
          <button data-choice="grouped" class="mt-5 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700">Choose this</button>
        </article>
      </section>
    </main>`,
});

// Record `chosenId` into the calling skill's artifact (brief / plan), not just chat.
console.log('Selected option id:', chosenId);
