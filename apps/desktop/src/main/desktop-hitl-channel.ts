import type { WebContents } from 'electron';
import type { Option, DecisionRequest, DecisionResponse, HitlChannel } from '@x/hitl';

interface PendingResolution {
  readonly resolve: (res: DecisionResponse) => void;
  readonly timer: NodeJS.Timeout;
}

export class DesktopHitlChannel implements HitlChannel {
  readonly #webContents: WebContents;
  readonly #sessionId: string;
  readonly #pending = new Map<string, PendingResolution>();

  constructor(webContents: WebContents, sessionId: string) {
    this.#webContents = webContents;
    this.#sessionId = sessionId;
  }

  async ask(req: DecisionRequest): Promise<DecisionResponse> {
    const requestId = crypto.randomUUID();

    return new Promise<DecisionResponse>((resolve) => {
      // 5-minute timeout for human in the loop
      const timer = setTimeout(() => {
        this.#pending.delete(requestId);
        resolve({ chosen: 'cancel', note: 'Approval timed out after 5 minutes' });
      }, 5 * 60 * 1000);

      this.#pending.set(requestId, { resolve, timer });

      this.#webContents.send('spine:event', {
        type: 'hitl',
        sessionId: this.#sessionId,
        request: {
          id: requestId,
          question: req.question,
          options: req.options.map((o: Option) => ({
            id: o.id,
            label: o.label,
            summary: o.summary,
          })),
          tier: req.tier,
        },
      });
    });
  }

  respond(requestId: string, decision: 'approve' | 'revise' | 'cancel', note?: string): boolean {
    const pending = this.#pending.get(requestId);
    if (!pending) return false;

    clearTimeout(pending.timer);
    this.#pending.delete(requestId);

    const chosen = decision === 'approve' ? 'proceed' : decision === 'revise' ? 'revise' : 'cancel';
    pending.resolve({ chosen, note });
    return true;
  }

  /** Releases every pending gate as `cancel` so an aborted run parked at a gate can unwind. */
  cancelAll(note: string): void {
    for (const pending of this.#pending.values()) {
      clearTimeout(pending.timer);
      pending.resolve({ chosen: 'cancel', note });
    }
    this.#pending.clear();
  }
}
