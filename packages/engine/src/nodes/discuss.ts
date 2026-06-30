import { mkdir, rename, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createBudgetTracker } from '@x/core';
import { SkillRegistry } from '@x/registry';
import { createProvider, type RuntimeProvider } from '@x/providers';
import type { EngineState, DiscussionDoc } from '../state.js';
import { sessionArtifactPath, sessionArchiveDir } from '../session-store.js';
import { checkBudget, formatBudgetWarnings } from '../budget-guard.js';

const SKILLS_ROOT = process.env.AIX_CONTENT_ROOT ?? join(process.cwd(), 'content');

export async function discussNode(state: EngineState): Promise<EngineState> {
  if (state.discussion) return state;

  const provider: RuntimeProvider = createProvider();
  const registry = await SkillRegistry.load(SKILLS_ROOT);

  const discussSkill = registry.get('discussing-pro');

  const skillBodies: string[] = [];
  if (discussSkill) skillBodies.push(discussSkill.body);

  const system = `You are an expert engineering analyst helping clarify goals and explore solutions.

${skillBodies.join('\n\n---\n\n')}

Respond with valid JSON in this exact format:
{
  "goal": "clarified goal in concrete engineering terms",
  "constraints": ["constraint 1", "constraint 2"],
  "options": [
    {
      "name": "Option A",
      "value": 8,
      "effortFit": 7,
      "risk": 6,
      "fit": 9
    }
  ],
  "recommendation": "Name of the recommended option",
  "rationale": "Detailed justification referencing constraints, utility, security, and compliance. Explain why alternatives were bypassed."
}

Keep analysis thorough but concise.`;

  const user = `Task: ${state.session.task}`;

  const budgetCheck = checkBudget(state);
  if (!budgetCheck.ok) {
    const critical = budgetCheck.warnings.filter(w => !w.recoverable);
    if (critical.length > 0) {
      throw new Error(`Budget check failed:\n${formatBudgetWarnings(critical)}`);
    }
    console.warn(`[budget] Warnings before discuss:\n${formatBudgetWarnings(budgetCheck.warnings)}`);
  }

  const response = await provider.call({ system, user, temperature: 0.3 });

  let discussion: DiscussionDoc;
  try {
    const parsed = JSON.parse(response.content);
    discussion = {
      goal: parsed.goal ?? state.session.task,
      constraints: Array.isArray(parsed.constraints) ? parsed.constraints : [],
      options: Array.isArray(parsed.options)
        ? parsed.options.map((o: Record<string, unknown>) => ({
            name: String(o.name ?? ''),
            value: Number(o.value ?? 0),
            effortFit: Number(o.effortFit ?? 0),
            risk: Number(o.risk ?? 0),
            fit: Number(o.fit ?? 0),
          }))
        : [],
      recommendation: parsed.recommendation ?? '',
      rationale: parsed.rationale ?? response.content.slice(0, 500),
    };
  } catch {
    discussion = {
      goal: state.session.task,
      constraints: [],
      options: [],
      recommendation: '',
      rationale: response.content.slice(0, 500),
    };
  }

  await writeDiscussionArtifact(state.session.id, discussion);

  const tracker = createBudgetTracker();
  const session = tracker.addUsage(state.session, response.usd, response.tokens);

  return { ...state, session, discussion };
}

async function writeDiscussionArtifact(sessionId: string, discussion: DiscussionDoc): Promise<void> {
  const artifactPath = sessionArtifactPath(sessionId, 'DISCUSSION.md');
  let archiveRef = '';

  if (existsSync(artifactPath)) {
    const ts = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
    const archiveDir = sessionArchiveDir(sessionId);
    await mkdir(archiveDir, { recursive: true });
    const archivePath = join(archiveDir, `DISCUSSION.${ts}.md`);
    await rename(artifactPath, archivePath);
    archiveRef = `> Previous version archived at: \`${archivePath}\`\n\n`;
  }

  const optionsTable = discussion.options.map(o =>
    `| ${o.name} | ${o.value} | ${o.effortFit} | ${o.risk} | ${o.fit} | ${o.value + o.effortFit + o.fit - o.risk} |`
  ).join('\n');

  const artifact = `${archiveRef}# Discussion

## Goal
${discussion.goal}

## Constraints
${discussion.constraints.map(c => `- ${c}`).join('\n')}

## Options Compared
| Option | Value | Effort Fit | Risk | Fit | Total |
|--------|-------|------------|------|-----|-------|
${optionsTable}

## Recommendation
**${discussion.recommendation}**

### Rationale
${discussion.rationale}
`;

  await mkdir(sessionArtifactPath(sessionId, ''), { recursive: true });
  await writeFile(artifactPath, artifact, 'utf-8');
}
