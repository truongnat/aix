interface Option {
    readonly id: string;
    readonly label: string;
    readonly summary: string;
    readonly artifact?: string;
}
interface DecisionRequest {
    readonly question: string;
    readonly options: readonly Option[];
    readonly tier: 0 | 1 | 2;
}
interface DecisionResponse {
    readonly chosen: string;
    readonly note?: string;
}
interface HitlChannel {
    ask(req: DecisionRequest): Promise<DecisionResponse>;
}
declare function resolvePreviewTier(question: string, options: readonly Option[]): 0 | 1 | 2;

declare class ConsoleHitlChannel implements HitlChannel {
    constructor(_previewBaseUrl?: string);
    ask(req: DecisionRequest): Promise<DecisionResponse>;
}

declare class ClackHitlChannel implements HitlChannel {
    ask(req: DecisionRequest): Promise<DecisionResponse>;
}

export { ClackHitlChannel, ConsoleHitlChannel, type DecisionRequest, type DecisionResponse, type HitlChannel, type Option, resolvePreviewTier };
