/**
 * Manual demo: `bun src/core/tools/preview/demo.ts`
 * Opens a real browser preview and prints the captured response.
 *
 * Note how the HTML is generated here, in the caller, following
 * `references/design-guide.md` — the engine ships no fixed template.
 */
import { askVisualQuestion, confirmVisualResult } from './index';

const choice = await askVisualQuestion({
    title: 'How should `doctor` report provider status?',
    choices: [
        { id: 'flat', label: 'Option A — flat list' },
        { id: 'grouped', label: 'Option B — grouped table' },
    ],
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
console.log('Picked:', choice);

const confirm = await confirmVisualResult({
    title: 'Does the new --help output look right?',
    bodyHtml: `
    <main class="mx-auto max-w-5xl px-6 py-12">
      <p class="mb-2 text-sm font-medium uppercase tracking-wide text-stone-400">Harness · confirm the result</p>
      <h1 class="mb-8 text-2xl font-semibold tracking-tight">Does the new <code>--help</code> output look right?</h1>
      <section class="grid gap-6 md:grid-cols-2">
        <article class="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <header class="mb-3 text-sm font-semibold text-stone-500">Expected</header>
          <pre class="rounded bg-stone-100 p-3 text-sm">aih install [--force]</pre>
        </article>
        <article class="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
          <header class="mb-3 text-sm font-semibold text-emerald-600">Actual</header>
          <pre class="rounded bg-stone-100 p-3 text-sm">aih install [--force]\n  --force   reinstall over an existing setup</pre>
        </article>
      </section>
      <div class="mt-8 flex gap-3">
        <button id="confirm" class="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-700">Confirm — this matches</button>
        <button id="reject" class="rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100">Reject — something's off</button>
      </div>
    </main>`,
});
console.log('Confirmed:', confirm);
