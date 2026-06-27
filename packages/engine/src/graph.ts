import { StateGraph, Annotation, MemorySaver, END, START } from '@langchain/langgraph';
import type { SessionState } from '@x/core';
import type { EngineState, PlanDoc, TaskItem, TicketPlan } from './state.js';
import {
  planNode, rulesNode, tasksNode, pickNode,
  ticketPlanNode, coderNode, reviewerNode,
} from './nodes/index.js';
import {
  checkReviewerIsNotCoder, checkHardStop,
  checkPlanShellDenylist, shouldInterrupt,
} from './guards.js';

const MAX_ATTEMPTS = 3;
const PASS_THRESHOLD = 9;

// --- State annotation ---

const GraphAnnotation = Annotation.Root({
  session: Annotation<SessionState>(),
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
  // Internal routing flag — not part of the public EngineState interface
  _interrupted: Annotation<boolean>({
    reducer: (_: boolean, v: boolean) => v,
    default: (): boolean => false,
  }),
});

type GraphState = typeof GraphAnnotation.State;

// Strip the internal LG field to recover the public EngineState shape
function toEngineState(gs: GraphState): EngineState {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _interrupted: _i, ...rest } = gs;
  return rest as EngineState;
}

// --- Node adapters ---
// Existing nodes are typed to EngineState. Each adapter strips the internal
// field, calls the original node, and merges back any routing updates.

async function lgPlanNode(state: GraphState): Promise<Partial<GraphState>> {
  const next = await planNode(toEngineState(state));
  const interrupted = await shouldInterrupt('plan', next);
  return { ...next, _interrupted: interrupted };
}

async function lgRulesNode(state: GraphState): Promise<Partial<GraphState>> {
  return rulesNode(toEngineState(state));
}

async function lgTasksNode(state: GraphState): Promise<Partial<GraphState>> {
  return tasksNode(toEngineState(state));
}

// loopStart resets the interrupt flag at the top of each iteration
function lgLoopStartNode(_state: GraphState): Partial<GraphState> {
  return { _interrupted: false };
}

async function lgPickNode(state: GraphState): Promise<Partial<GraphState>> {
  return pickNode(toEngineState(state));
}

async function lgTicketPlanNode(state: GraphState): Promise<Partial<GraphState>> {
  const next = await ticketPlanNode(toEngineState(state));
  if (!checkPlanShellDenylist(next.ticketPlans)) {
    return { ...next, _interrupted: true };
  }
  const interrupted = await shouldInterrupt('ticket-plan', next);
  return { ...next, _interrupted: interrupted };
}

async function lgCoderNode(state: GraphState): Promise<Partial<GraphState>> {
  return coderNode(toEngineState(state));
}

async function lgReviewerNode(state: GraphState): Promise<Partial<GraphState>> {
  let next = await reviewerNode(toEngineState(state));
  if (!checkReviewerIsNotCoder(next)) {
    next = { ...next, reviewScore: 0 };
  }
  return { ...next, attempts: next.attempts + 1 };
}

// --- Conditional edge routers (must be synchronous) ---
// Node names use "Step" suffix where the name would collide with a state channel key.
// LangGraph forbids a node and a channel sharing the same name ('plan', 'rules', 'tasks').

function routeAfterPlanStep(state: GraphState): 'rulesStep' | typeof END {
  return state._interrupted ? END : 'rulesStep';
}

function routeLoopStart(state: GraphState): 'pick' | typeof END {
  return checkHardStop(toEngineState(state)) ? END : 'pick';
}

function routeAfterPick(state: GraphState): 'ticketPlan' | typeof END {
  return state.current ? 'ticketPlan' : END;
}

function routeAfterTicketPlan(state: GraphState): 'coder' | typeof END {
  return state._interrupted ? END : 'coder';
}

function routeAfterReview(state: GraphState): 'loopStart' | typeof END {
  const score = state.reviewScore ?? 0;
  if (score >= PASS_THRESHOLD || state.attempts >= MAX_ATTEMPTS) return END;
  if (!state.tasks.some(t => t.status === 'pending')) return END;
  return 'loopStart';
}

// --- Build and compile ---

const checkpointer = new MemorySaver();

const compiledGraph = new StateGraph(GraphAnnotation)
  .addNode('planStep', lgPlanNode)
  .addNode('rulesStep', lgRulesNode)
  .addNode('tasksStep', lgTasksNode)
  .addNode('loopStart', lgLoopStartNode)
  .addNode('pick', lgPickNode)
  .addNode('ticketPlan', lgTicketPlanNode)
  .addNode('coder', lgCoderNode)
  .addNode('reviewer', lgReviewerNode)
  .addEdge(START, 'planStep')
  .addConditionalEdges('planStep', routeAfterPlanStep)
  .addEdge('rulesStep', 'tasksStep')
  .addEdge('tasksStep', 'loopStart')
  .addConditionalEdges('loopStart', routeLoopStart)
  .addConditionalEdges('pick', routeAfterPick)
  .addConditionalEdges('ticketPlan', routeAfterTicketPlan)
  .addEdge('coder', 'reviewer')
  .addConditionalEdges('reviewer', routeAfterReview)
  .compile({ checkpointer });

// --- Public API (interface unchanged) ---

export class EngineGraph {
  // _checkpoints accepted for API compatibility; LangGraph MemorySaver handles in-process checkpointing
  constructor(_checkpoints?: unknown) {}

  async run(initial: EngineState): Promise<EngineState> {
    const result = await compiledGraph.invoke(
      { ...initial, _interrupted: false },
      { configurable: { thread_id: initial.session.id } },
    );
    return toEngineState(result as GraphState);
  }

  async resume(state: EngineState): Promise<EngineState> {
    // Resume from the last in-memory checkpoint for this session
    const result = await compiledGraph.invoke(
      null as unknown as GraphState,
      { configurable: { thread_id: state.session.id } },
    );
    return toEngineState(result as GraphState);
  }
}
