declare function renderMermaid(diagram: string): string;

declare function renderImage(svg: string): string;

interface PreviewServer {
    start(previews: readonly {
        id: string;
        label?: string;
        summary?: string;
        html: string;
    }[], question?: string, onChoose?: (id: string) => void): Promise<{
        url: string;
        close: () => Promise<void>;
    }>;
}
declare function createPreviewServer(): PreviewServer;

export { type PreviewServer, createPreviewServer, renderImage, renderMermaid };
