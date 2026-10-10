export const meta = {
  name: 'aix-spine',
  description: 'aix engineering spine: discuss → plan → isolate → test-first → execute → review → verify → remember. Session artifacts land in .aix/sessions/<session-id>/.',
  phases: [
    { title: 'Discuss' },
    { title: 'Plan' },
    { title: 'Isolate' },
    { title: 'Test-first' },
    { title: 'Execute' },
    { title: 'Review' },
    { title: 'Verify' },
    { title: 'Remember' },
  ],
};

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    sessionId: { type: 'string', description: 'kebab-case slug for .aix/sessions/<session-id>/' },
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          files: { type: 'array', items: { type: 'string' } },
          acceptance: { type: 'string' },
        },
        required: ['title'],
      },
    },
  },
  required: ['sessionId', 'tasks'],
};

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    score: { type: 'number' },
    blockers: { type: 'array', items: { type: 'string' } },
    findings: { type: 'array', items: { type: 'string' } },
  },
  required: ['score', 'blockers'],
};

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    passed: { type: 'boolean' },
    evidence: { type: 'string' },
    issues: { type: 'array', items: { type: 'string' } },
  },
  required: ['passed', 'evidence'],
};

export default async function ({ agent, phase, log, args }) {
  const task = args.task ?? args.prompt ?? 'the requested change';

  // Phase 1 — Align & Shape
  phase('Discuss');
  log('Spine: clarifying scope');
  const discussion = await agent(
    `Use the discussing-pro skill. Task: "${task}". Clarify goals, surface the spec in chunks, write .aix/sessions/<slug>/DISCUSSION.md, and report the chosen slug.`,
    { label: 'Discussing', phase: 'Discuss' },
  );

  // Phase 2 — Plan
  phase('Plan');
  const plan = await agent(
    `Use the planning-pro skill. Task: "${task}". Context from discussion: ${discussion}. Produce a task breakdown with dependencies, acceptance criteria, and rollback notes. Write PLAN.md under the session dir. Return structured JSON.`,
    { label: 'Planning', phase: 'Plan', schema: PLAN_SCHEMA },
  );
  log(`Plan: ${plan.tasks.length} task(s), session=${plan.sessionId}`);

  // Phase 3 — Isolate
  phase('Isolate');
  await agent(
    `Use the git-worktree-pro skill. Create an isolated branch/worktree for session "${plan.sessionId}" so work starts from a clean baseline. Report the branch name.`,
    { label: 'Isolating', phase: 'Isolate' },
  );

  // Phase 4 — Test-first
  phase('Test-first');
  const tdd = await agent(
    `Use the ttd-pro skill. Plan: ${JSON.stringify(plan.tasks)}. Write failing tests first (RED) for the highest-risk task, then report what is red.`,
    { label: 'Writing tests', phase: 'Test-first' },
  );

  // Phase 5 — Execute
  phase('Execute');
  await agent(
    `Use the executing-pro skill. Plan: ${JSON.stringify(plan.tasks)}. RED state: ${tdd}. Execute tasks in dependency order with checkpoints (GREEN → refactor).`,
    { label: 'Executing', phase: 'Execute' },
  );

  // Phase 6 — Review
  phase('Review');
  const review = await agent(
    `Use the code-review-pro skill. Review all changes for session "${plan.sessionId}": security + quality. Write REVIEW.md under the session dir. Return structured JSON.`,
    { label: 'Reviewing', phase: 'Review', schema: REVIEW_SCHEMA },
  );
  log(`Review score ${review.score}/10, blockers: ${review.blockers.length}`);

  if (review.blockers.length > 0) {
    log('Blockers found — stopping before verify.');
    return { sessionId: plan.sessionId, stoppedAt: 'review', blockers: review.blockers };
  }

  // Phase 7 — Verify
  phase('Verify');
  const verdict = await agent(
    `Use the verify-pro skill. Prove the change for session "${plan.sessionId}" actually works — run the real scenario, not just tests. Write VERIFY.md. Return structured JSON.`,
    { label: 'Verifying', phase: 'Verify', schema: VERDICT_SCHEMA },
  );

  if (!verdict.passed) {
    return { sessionId: plan.sessionId, stoppedAt: 'verify', issues: verdict.issues };
  }

  // Phase 8 — Remember
  phase('Remember');
  await agent(
    `Use the remember-pro skill. Record what was learned in session "${plan.sessionId}" into REMEMBER.md and the memory store (decisions, pitfalls, evidence).`,
    { label: 'Remembering', phase: 'Remember' },
  );

  return { sessionId: plan.sessionId, stoppedAt: 'remember', verdict };
}
