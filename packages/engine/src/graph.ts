import { mkdir, appendFile } from 'node:fs/promises';
import { join } from 'node:path';
import { StateGraph, Annotation, END, START } from '@langchain/langgraph';
import { FileCheckpointer } from './file-checkpointer.js';
import type { SessionState } from '@x/core';
import type { EngineState, PlanDoc, DiscussionDoc, TaskItem, TicketPlan } from './state.js';
import {
  discussNode, planNode, rulesNode, tasksNode, pickNode,
  ticketPlanNode, coderNode, reviewerNode,
} from './nodes/index.js';
import {
  checkReviewerIsNotCoder, checkHardStop,
  checkPlanShellDenylist, shouldInterrupt,
} from './guards.js';
import { SessionStore } from './session-store.js';
import { checkBudget, formatBudgetWarnings } from './budget-guard.js';

const MAX_ATTEMPTS = 3;
const PASS_THRESHOLD = 9;

// --- State annotation ---

const GraphAnnotation = Annotation.Root({
  session: Annotation<SessionState>(),
  discussion: Annotation<DiscussionDoc | undefined>(),
  plan: Annotation<PlanDoc | undefined>(),
  rules: Annotation<readonly string[] | undefined>(),
  tasks: Annotation<readonly TaskItem[]>({
    reducer: (_: readonly TaskItem[], v: readonly TaskItem[]) => v,
    default: (): readonly TaskItem[] => [],
  }),
  current: Annotation<TaskItem | undefined>(),
  reviewScore: Annotation<number | undefined>(),
  attempts: Annotation<number>({
    reducer: (_: number, v: number) => v,
    default: (): number => 0,
  }),
  ticketPlans: Annotation<readonly TicketPlan[] | undefined>(),
  coderOutput: Annotation<string | undefined>(),
  writtenFiles: Annotation<readonly string[]>({
    reducer: (a: readonly string[], b: readonly string[]) => [...new Set([...a, ...b])],
    default: (): readonly string[] => [],
  }),
  _interrupted: Annotation<boolean>({
    reducer: (_: boolean, v: boolean) => v,
    default: (): boolean => false,
  }),
});

type GraphState = typeof GraphAnnotation.State;

function toEngineState(gs: GraphState): EngineState {
  const { _interrupted: _i, ...rest } = gs;
  return rest as EngineState;
}

function nodeLabel(nodeId: string): string {
  return nodeId.replace(/Step$/, '');
}

// --- Log tracking ---

async function appendLog(sessionId: string, entry: Record<string, unknown>): Promise<void> {
  try {
    const logDir = join(process.cwd(), '.aix', 'sessions', sessionId);
    await mkdir(logDir, { recursive: true });
    const line = JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n';
    await appendFile(join(logDir, 'checkpoint.log'), line, 'utf-8');
  } catch {
    // swallow log errors
  }
}

// --- Graph builder ---

function buildGraph(
  preHook: (state: GraphState, id: string) => Promise<void>,
  postHook: (state: GraphState, id: string, durationMs: number) => Promise<void>,
) {
  async function lgDiscussNode(state: GraphState): Promise<Partial<GraphState>> {
    await preHook(state, 'discussStep');
    const start = Date.now();
    const next = await discussNode(toEngineState(state));
    const duration = Date.now() - start;
    const justDiscussed = next.discussion !== undefined && state.discussion === undefined;
    const interrupted = justDiscussed ? await shouldInterrupt('discuss', next) : false;
    const result = { ...next, _interrupted: interrupted };
    await postHook({ ...state, ...result } as GraphState, 'discussStep', duration);
    return result;
  }

  async function lgPlanNode(state: GraphState): Promise<Partial<GraphState>> {
    await preHook(state, 'planStep');
    const start = Date.now();
    const next = await planNode(toEngineState(state));
    const duration = Date.now() - start;
    const justPlanned = next.plan !== undefined && state.plan === undefined;
    const interrupted = justPlanned ? await shouldInterrupt('plan', next) : false;
    const result = { ...next, _interrupted: interrupted };
    await postHook({ ...state, ...result } as GraphState, 'planStep', duration);
    return result;
  }

  async function lgRulesNode(state: GraphState): Promise<Partial<GraphState>> {
    await preHook(state, 'rulesStep');
    const start = Date.now();
    const result = await rulesNode(toEngineState(state));
    const duration = Date.now() - start;
    await postHook({ ...state, ...result } as GraphState, 'rulesStep', duration);
    return result;
  }

  async function lgTasksNode(state: GraphState): Promise<Partial<GraphState>> {
    await preHook(state, 'tasksStep');
    const start = Date.now();
    const result = await tasksNode(toEngineState(state));
    const duration = Date.now() - start;
    await postHook({ ...state, ...result } as GraphState, 'tasksStep', duration);
    return result;
  }

  async function lgLoopStartNode(state: GraphState): Promise<Partial<GraphState>> {
    await preHook(state, 'loopStart');
    const start = Date.now();
    const result = { _interrupted: false };
    const duration = Date.now() - start;
    await postHook({ ...state, ...result } as GraphState, 'loopStart', duration);
    return result;
  }

  async function lgPickNode(state: GraphState): Promise<Partial<GraphState>> {
    await preHook(state, 'pick');
    const start = Date.now();
    const result = await pickNode(toEngineState(state));
    const duration = Date.now() - start;
    await postHook({ ...state, ...result } as GraphState, 'pick', duration);
    return result;
  }

  async function lgTicketPlanNode(state: GraphState): Promise<Partial<GraphState>> {
    await preHook(state, 'ticketPlan');
    const start = Date.now();
    const next = await ticketPlanNode(toEngineState(state));
    const duration = Date.now() - start;
    if (!checkPlanShellDenylist(next.ticketPlans)) {
      const result = { ...next, _interrupted: true };
      await postHook({ ...state, ...result } as GraphState, 'ticketPlan', duration);
      return result;
    }
    const interrupted = await shouldInterrupt('ticket-plan', next);
    const result = { ...next, _interrupted: interrupted };
    await postHook({ ...state, ...result } as GraphState, 'ticketPlan', duration);
    return result;
  }

  async function lgCoderNode(state: GraphState): Promise<Partial<GraphState>> {
    await preHook(state, 'coder');
    const start = Date.now();
    const result = await coderNode(toEngineState(state));
    const duration = Date.now() - start;
    await postHook({ ...state, ...result } as GraphState, 'coder', duration);
    return result;
  }

  async function lgReviewerNode(state: GraphState): Promise<Partial<GraphState>> {
    await preHook(state, 'reviewer');
    const start = Date.now();
    let next = await reviewerNode(toEngineState(state));
    const duration = Date.now() - start;
    if (!checkReviewerIsNotCoder(next)) {
      next = { ...next, reviewScore: 0 };
    }
    const result = { ...next, attempts: next.attempts + 1 };
    await postHook({ ...state, ...result } as GraphState, 'reviewer', duration);
    return result;
  }

  const checkpointer = new FileCheckpointer();

  return new StateGraph(GraphAnnotation)
    .addNode('discussStep', lgDiscussNode)
    .addNode('planStep', lgPlanNode)
    .addNode('rulesStep', lgRulesNode)
    .addNode('tasksStep', lgTasksNode)
    .addNode('loopStart', lgLoopStartNode)
    .addNode('pick', lgPickNode)
    .addNode('ticketPlan', lgTicketPlanNode)
    .addNode('coder', lgCoderNode)
    .addNode('reviewer', lgReviewerNode)
    .addEdge(START, 'discussStep')
    .addConditionalEdges('discussStep', (state: GraphState) =>
      state._interrupted ? END : 'planStep')
    .addConditionalEdges('planStep', (state: GraphState) =>
      state._interrupted ? END : 'rulesStep')
    .addEdge('rulesStep', 'tasksStep')
    .addEdge('tasksStep', 'loopStart')
    .addConditionalEdges('loopStart', (state: GraphState) =>
      checkHardStop(toEngineState(state)) ? END : 'pick')
    .addConditionalEdges('pick', (state: GraphState) =>
      state.current ? 'ticketPlan' : END)
    .addConditionalEdges('ticketPlan', (state: GraphState) =>
      state._interrupted ? END : 'coder')
    .addEdge('coder', 'reviewer')
    .addConditionalEdges('reviewer', (state: GraphState) => {
      const score = state.reviewScore ?? 0;
      if (score >= PASS_THRESHOLD || state.attempts >= MAX_ATTEMPTS) return END;
      if (!state.tasks.some(t => t.status === 'pending')) return END;
      return 'loopStart';
    })
    .compile({ checkpointer });
}

// --- Public API ---

export class EngineGraph {
  readonly #store: SessionStore;
  readonly #graph: ReturnType<typeof buildGraph>;

  constructor(store?: SessionStore) {
    this.#store = store ?? new SessionStore();
    this.#graph = buildGraph(
      async (state: GraphState, id: string) => {
        const engineState = toEngineState(state);
        const budgetCheck = checkBudget(engineState);
        if (!budgetCheck.ok) {
          const critical = budgetCheck.warnings.filter(w => !w.recoverable);
          if (critical.length > 0) {
            const msg = `Budget check failed before ${id}:\n${formatBudgetWarnings(critical)}`;
            await appendLog(engineState.session.id, { event: 'budget_fail', node: id, message: msg });
            throw new Error(msg);
          }
        }
      },
      async (state: GraphState, id: string, durationMs: number) => {
        const engineState = toEngineState(state);
        await appendLog(engineState.session.id, {
          event: 'node_complete',
          node: nodeLabel(id),
          phase: engineState.session.phase,
          durationMs,
          tokens: engineState.session.budget.tokensInPhase,
          usdSpent: engineState.session.budget.usdSpent,
        });
        await this.#store.save(engineState);
      },
    );
  }

  async run(initial: EngineState): Promise<EngineState> {
    await appendLog(initial.session.id, { event: 'run_start', task: initial.session.task });

    const start = Date.now();
    const result = await this.#graph.invoke(
      { ...initial, _interrupted: false },
      { configurable: { thread_id: initial.session.id } },
    );
    const duration = Date.now() - start;

    const engineResult = toEngineState(result as GraphState);
    await this.#store.save(engineResult);
    await appendLog(initial.session.id, {
      event: 'run_end',
      durationMs: duration,
      score: engineResult.reviewScore,
      attempts: engineResult.attempts,
      filesWritten: engineResult.writtenFiles?.length ?? 0,
    });

    return engineResult;
  }

  async resume(state: EngineState): Promise<EngineState> {
    await appendLog(state.session.id, { event: 'resume_start' });

    const start = Date.now();
    const result = await this.#graph.invoke(
      null as unknown as GraphState,
      { configurable: { thread_id: state.session.id } },
    );
    const duration = Date.now() - start;

    const engineResult = toEngineState(result as GraphState);
    await this.#store.save(engineResult);
    await appendLog(state.session.id, {
      event: 'resume_end',
      durationMs: duration,
      score: engineResult.reviewScore,
      attempts: engineResult.attempts,
    });

    return engineResult;
  }
}
