import { SessionState, BudgetWarning } from '@x/core';
import { BaseCheckpointSaver, CheckpointTuple, CheckpointListOptions, Checkpoint, CheckpointMetadata } from '@langchain/langgraph-checkpoint';
import { RunnableConfig } from '@langchain/core/runnables';

interface PlanDoc {
    readonly goal: string;
    readonly steps: readonly string[];
}
interface ScoredOption {
    readonly name: string;
    readonly value: number;
    readonly effortFit: number;
    readonly risk: number;
    readonly fit: number;
}
interface DiscussionDoc {
    readonly goal: string;
    readonly constraints: readonly string[];
    readonly options: readonly ScoredOption[];
    readonly recommendation: string;
    readonly rationale: string;
}
interface TaskItem {
    readonly id: string;
    readonly description: string;
    readonly status: 'pending' | 'in-progress' | 'done' | 'failed';
    readonly assignedRole?: string;
    readonly output?: string;
}
interface TicketPlan {
    readonly ticketId: string;
    readonly description: string;
    readonly files: readonly string[];
    readonly acceptanceCriteria: readonly string[];
}
interface EngineState {
    readonly session: SessionState;
    readonly discussion?: DiscussionDoc;
    readonly plan?: PlanDoc;
    readonly rules?: readonly string[];
    readonly tasks: readonly TaskItem[];
    readonly current?: TaskItem;
    readonly reviewScore?: number;
    readonly attempts: number;
    readonly ticketPlans?: readonly TicketPlan[];
    readonly coderOutput?: string;
    readonly writtenFiles?: readonly string[];
}
declare function createInitialEngineState(session: SessionState): EngineState;

declare const SESSIONS_ROOT: string;
declare function sessionDir(sessionId: string): string;
declare function sessionArtifactPath(sessionId: string, name: string): string;
declare function sessionArchiveDir(sessionId: string): string;
declare function sessionGeneratedDir(sessionId: string): string;
declare function sessionStatePath(sessionId: string): string;
declare class SessionStore {
    #private;
    constructor(root?: string);
    save(state: EngineState): Promise<string>;
    load(id: string): Promise<EngineState | undefined>;
    list(): Promise<string[]>;
}

declare class EngineGraph {
    #private;
    constructor(store?: SessionStore);
    run(initial: EngineState): Promise<EngineState>;
    resume(state: EngineState): Promise<EngineState>;
}

declare class FileCheckpointer extends BaseCheckpointSaver {
    #private;
    constructor(root?: string);
    getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined>;
    list(config: RunnableConfig, options?: CheckpointListOptions): AsyncGenerator<CheckpointTuple>;
    put(config: RunnableConfig, checkpoint: Checkpoint, metadata: CheckpointMetadata): Promise<RunnableConfig>;
    putWrites(config: RunnableConfig, writes: [string, unknown][], taskId: string): Promise<void>;
    deleteThread(threadId: string): Promise<void>;
}

declare function discussNode(state: EngineState): Promise<EngineState>;

declare function planNode(state: EngineState): Promise<EngineState>;

declare function rulesNode(state: EngineState): Promise<EngineState>;

declare function tasksNode(state: EngineState): Promise<EngineState>;

declare function pickNode(state: EngineState): Promise<EngineState>;

declare function ticketPlanNode(state: EngineState): Promise<EngineState>;

declare function coderNode(state: EngineState): Promise<EngineState>;

declare function reviewerNode(state: EngineState): Promise<EngineState>;

declare function checkReviewerIsNotCoder(state: EngineState): boolean;
declare function checkHardStop(state: EngineState): boolean;
declare function checkShellDenylist(command: string): boolean;
declare function checkPlanShellDenylist(plans: readonly TicketPlan[] | undefined): boolean;
declare function shouldInterrupt(phase: string, state: EngineState): Promise<boolean>;

type BudgetCheckResult = {
    readonly ok: true;
} | {
    readonly ok: false;
    readonly warnings: readonly BudgetWarning[];
};
declare function checkBudget(state: EngineState): BudgetCheckResult;
declare function formatBudgetWarnings(warnings: readonly BudgetWarning[]): string;

export { type DiscussionDoc, EngineGraph, type EngineState, FileCheckpointer, type PlanDoc, SESSIONS_ROOT, type ScoredOption, SessionStore, type TaskItem, type TicketPlan, checkBudget, checkHardStop, checkPlanShellDenylist, checkReviewerIsNotCoder, checkShellDenylist, coderNode, createInitialEngineState, discussNode, formatBudgetWarnings, pickNode, planNode, reviewerNode, rulesNode, sessionArchiveDir, sessionArtifactPath, sessionDir, sessionGeneratedDir, sessionStatePath, shouldInterrupt, tasksNode, ticketPlanNode };
