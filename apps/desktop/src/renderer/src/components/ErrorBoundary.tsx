import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  label?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error(`[ErrorBoundary:${this.props.label ?? 'Renderer'}]`, error, errorInfo);
  }

  handleRetry = (): void => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="m-6 p-6 rounded-2xl bg-rose-500/[0.05] border border-rose-500/20 text-rose-200 space-y-3"
        >
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            Component Error in {this.props.label ?? 'View'}
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            This section encountered an unexpected error and has been isolated to prevent the app from crashing.
          </p>
          {this.state.error && (
            <pre className="p-3 rounded-lg bg-black/40 font-mono text-[11px] text-rose-300 whitespace-pre-wrap overflow-x-auto max-h-40">
              {this.state.error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={this.handleRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Recover and Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
