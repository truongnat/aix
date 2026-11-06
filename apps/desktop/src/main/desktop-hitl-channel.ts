import type { WebContents } from 'electron';
import type { Option, DecisionRequest, DecisionResponse, HitlChannel } from '@x/hitl';

interface PendingResolution {
  readonly resolve: (res: DecisionResponse) => void;
  readonly timer: NodeJS.Timeout;
  readonly onAbort: () => void;
}

export class DesktopHitlChannel implements HitlChannel {
  readonly #webContents: WebContents;
  readonly #sessionId: string;
  readonly #pending = new Map<string, PendingResolution>();
  readonly #signal: AbortSignal | undefined;

  constructor(webContents: WebContents, sessionId: string, signal?: AbortSignal) {
    this.#webContents = webContents;
    this.#sessionId = sessionId;
    this.#signal = signal;
  }

  async ask(req: DecisionRequest): Promise<DecisionResponse> {
    if (this.#signal?.aborted) return { chosen: 'cancel', note: 'Stopped by user' };
    const requestId = crypto.randomUUID();
    const { promise, resolve } = Promise.withResolvers<DecisionResponse>();
    const settle = (result: DecisionResponse) => {
      const pending = this.#pending.get(requestId);
      if (!pending) return;
      clearTimeout(pending.timer);
      this.#signal?.removeEventListener('abort', pending.onAbort);
      this.#pending.delete(requestId);
      resolve(result);
    };
    const onAbort = () => settle({ chosen: 'cancel', note: 'Stopped by user' });
    const timer = setTimeout(() => settle({ chosen: 'cancel', note: 'Approval timed out after 5 minutes' }), 5 * 60 * 1000);
    this.#pending.set(requestId, { resolve: settle, timer, onAbort });
    this.#signal?.addEventListener('abort', onAbort, { once: true });
    this.#webContents.send('spine:event', {
      type: 'hitl',
      sessionId: this.#sessionId,
      request: {
        id: requestId,
        question: req.question,
        options: req.options.map((o: Option) => ({ id: o.id, label: o.label, summary: o.summary })),
        tier: req.tier,
      },
    });
    return promise;
  }

  respond(requestId: string, decision: 'approve' | 'revise' | 'cancel', note?: string): boolean {
    const pending = this.#pending.get(requestId);
    if (!pending) return false;

    const chosen = decision === 'approve' ? 'proceed' : decision === 'revise' ? 'revise' : 'cancel';
    pending.resolve({ chosen, note });
    return true;
  }

  /** Releases every pending gate as `cancel` so an aborted run parked at a gate can unwind. */
  cancelAll(note: string): void {
    for (const pending of this.#pending.values()) {
      pending.resolve({ chosen: 'cancel', note });
    }
  }
}
