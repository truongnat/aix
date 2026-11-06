import { mkdir, rename, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createBudgetTracker, ValidationError } from '@x/core';
import { SkillRegistry } from '@x/registry';
import { createProvider, type RuntimeProvider } from '@x/providers';
import type { EngineState, PlanDoc, PlannedTask } from '../state.js';
import { sessionArtifactPath, sessionArchiveDir, resolveSkillsRoot } from '../session-store.js';
import { checkBudget, formatBudgetWarnings } from '../budget-guard.js';
import { redactStrings } from '@x/policy';
import { parseJsonObject, parsePlannedTasks } from '../generation-contract.js';


export async function planNode(state: EngineState): Promise<EngineState> {
  if (state.plan) {
    parsePlannedTasks(state.plan.tasks);
    return state;
  }

  const provider: RuntimeProvider = createProvider();
  const skillsRoot = resolveSkillsRoot();
  const registry = await SkillRegistry.load(skillsRoot);

  const planSkill = registry.get('planning-pro');
  if (!planSkill) console.warn('[engine] planning-pro skill not found at:', skillsRoot);

  const skillBodies: string[] = [];
  if (planSkill) skillBodies.push(planSkill.body);

  const goal = state.discussion?.goal ?? state.session.task;
  const constraints = state.discussion?.constraints ?? [];
  const recommendation = state.discussion?.recommendation ?? '';

  const system = `You are an expert engineering planner creating concrete implementation plans.

${skillBodies.join('\n\n')}

Respond with valid JSON in this exact format:
{
  "goal": "concrete project goal",
  "scope": "in scope / out of scope",
  "constraints": ["constraint 1"],
  "assumptions": ["assumption 1"],
  "affectedFiles": ["relative/project/file"],
  "tasks": [
    {
      "id": "task-1",
      "title": "Task title",
      "description": "What to do",
      "dependencies": [],
      "acceptanceCriteria": ["condition 1"],
      "files": ["relative/project/file"]
    }
  ],
  "verificationStrategy": "how to verify",
  "rollbackStrategy": "how to revert",
  "risks": ["risk 1"]
}

Each task must have a unique stable id, a full description, exact relative file paths, non-empty acceptance criteria, and explicit dependencies referring to other task ids. Do not create dependency cycles. Choose the language, tools, and project structure from the user's goal and constraints. Include every required source, configuration, test, and documentation file in the tasks. Do not assume a particular language or framework.`;

  const constraintText = constraints.length > 0
    ? `\nConstraints:\n${constraints.map(c => `- ${c}`).join('\n')}`
    : '';

  const recoText = recommendation
    ? `\nRecommended approach: ${recommendation}`
    : '';

  const user = `Goal: ${goal}${constraintText}${recoText}\n\nTask: ${state.session.task}`;

  const budgetCheck = checkBudget(state);
  if (!budgetCheck.ok) {
    const critical = budgetCheck.warnings.filter(w => !w.recoverable);
    if (critical.length > 0) {
      throw new Error(`Budget check failed:\n${formatBudgetWarnings(critical)}`);
    }
    console.warn(`[budget] Warnings before plan:\n${formatBudgetWarnings(budgetCheck.warnings)}`);
  }

  const response = await provider.call({ system, user, temperature: 0.3 });

  const parsed = parseJsonObject(response.content);
  if (typeof parsed.goal !== 'string' || parsed.goal.trim() === '') {
    throw new ValidationError('Plan goal must be a non-empty string');
  }
  const tasks = parsePlannedTasks(parsed.tasks).map(task => ({
    ...redactStrings(task),
    id: task.id,
    dependencies: task.dependencies,
    files: task.files,
  }));
  const planData = { ...redactStrings(parsed), tasks };
  const plan: PlanDoc = {
    goal: redactStrings(parsed.goal),
    steps: tasks.map(task => task.title),
    tasks,
  };

  await writePlanArtifact(state.session.id, planData, tasks);

  const tracker = createBudgetTracker();
  const session = tracker.addUsage(state.session, response.usd, response.tokens);

  return { ...state, session, plan };
}

async function writePlanArtifact(
  sessionId: string,
  planData: Record<string, unknown>,
  tasks: readonly PlannedTask[],
): Promise<void> {
  const artifactPath = sessionArtifactPath(sessionId, 'PLAN.md');
  let archiveRef = '';

  if (existsSync(artifactPath)) {
    const ts = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
    const archiveDir = sessionArchiveDir(sessionId);
    await mkdir(archiveDir, { recursive: true });
    const archivePath = join(archiveDir, `PLAN.${ts}.md`);
    await rename(artifactPath, archivePath);
    archiveRef = `> Previous version archived at: \`${archivePath}\`\n\n`;
  }

  const scope = typeof planData.scope === 'string' ? `\n\n## Scope\n${planData.scope}` : '';

  const constraints = Array.isArray(planData.constraints)
    ? `\n\n## Constraints & Assumptions\n${planData.constraints.map(c => `- ${String(c)}`).join('\n')}`
    : '';

  const affectedFiles = Array.isArray(planData.affectedFiles)
    ? `\n\n## Affected Files\n${planData.affectedFiles.map(f => `- ${String(f)}`).join('\n')}`
    : '';

  const tasksBlock = tasks.length > 0
    ? `\n\n## Tasks\n${tasks.map((t, i) => {
        const deps = Array.isArray(t.dependencies) && t.dependencies.length > 0
          ? `\n   - Dependencies: ${t.dependencies.join(', ')}`
          : '';
        const ac = Array.isArray(t.acceptanceCriteria) && t.acceptanceCriteria.length > 0
          ? `\n   - Acceptance Criteria:\n${t.acceptanceCriteria.map(a => `     - ${String(a)}`).join('\n')}`
          : '';
        const files = Array.isArray(t.files) && t.files.length > 0
          ? `\n   - Files: ${t.files.join(', ')}`
          : '';
        return `${i + 1}. ${t.title} (${t.id})\n   - Description: ${t.description}${deps}${ac}${files}`;
      }).join('\n')}`
    : '';

  const verification = typeof planData.verificationStrategy === 'string'
    ? `\n\n## Verification Strategy\n${planData.verificationStrategy}`
    : '';

  const rollback = typeof planData.rollbackStrategy === 'string'
    ? `\n\n## Rollback Strategy\n${planData.rollbackStrategy}`
    : '';

  const risks = Array.isArray(planData.risks)
    ? `\n\n## Risks & Open Questions\n${planData.risks.map(r => `- ${String(r)}`).join('\n')}`
    : '';

  const artifact = `${archiveRef}# Plan

## Goal
${planData.goal}
${scope}
${constraints}
${affectedFiles}
${tasksBlock}
${verification}
${rollback}
${risks}
`;

  await mkdir(sessionArtifactPath(sessionId, ''), { recursive: true });
  await writeFile(artifactPath, artifact, 'utf-8');
}
