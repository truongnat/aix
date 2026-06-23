/**
 * Reference invocation for the `visualize-result` skill.
 * Run with: bun src/core/skills/visualize-result/scripts/example.ts
 *
 * The skill ships no template. It generates the comparison HTML dynamically per
 * tools/preview/references/design-guide.md, honors the #confirm / #reject
 * contract, calls the shared core tool, and records the decision.
 */
import { confirmVisualResult } from '../../../../.ai-harness/tools/preview/index';

const decision = await confirmVisualResult({
    title: 'Does the new --help output match the plan?',
    // Agent-generated body, authored per the design guide. Must contain
    // #confirm and #reject controls; the engine wires them to the callback.
    bodyHtml: `
    <main class="mx-auto max-w-5xl px-6 py-12">
      <p class="mb-2 text-sm font-medium uppercase tracking-wide text-stone-400">Harness · confirm the result</p>
      <h1 class="mb-8 text-2xl font-semibold tracking-tight">Does the new <code>--help</code> output match the plan?</h1>
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

// Record `decision` into the calling artifact (plan confirmation / verify report).
if (decision.confirmed) {
    console.log('Confirmed.');
} else {
    console.log('Rejected:', decision.reason);
}
