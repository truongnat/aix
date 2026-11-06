import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: React.ReactNode;
  readonly maxWidth?: string;
}

/**
 * Base modal dialog used across the app — replaces native window dialogs.
 * Traps initial focus, closes on Escape / backdrop click.
 */
export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, maxWidth = 'max-w-md' }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    panelRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`relative ${maxWidth} w-full bg-surface-elevated border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 focus:outline-none`}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

interface ConfirmDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly message: string;
  readonly detail?: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly destructive?: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

/** Confirmation dialog replacing native `confirm()` calls. */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  detail,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}) => (
  <Modal open={open} onClose={onCancel} title={title} maxWidth="max-w-md">
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${destructive ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
          <AlertTriangle className={`w-4 h-4 ${destructive ? 'text-rose-400' : 'text-amber-400'}`} />
        </div>
        <div className="space-y-1.5 min-w-0">
          <p className="text-sm text-slate-200 leading-relaxed">{message}</p>
          {detail && <p className="text-xs text-slate-400 leading-relaxed break-words font-mono">{detail}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-medium transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          autoFocus
          className={`px-4 py-2 rounded-lg text-white text-xs font-semibold transition-colors ${
            destructive
              ? 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20'
              : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </Modal>
);
