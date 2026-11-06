import React, { useEffect, useId, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: React.ReactNode;
  readonly maxWidth?: string;
}

const FOCUSABLE = 'a[href], button, input, textarea, select, summary, [tabindex]';

const isOutsidePanel = (event: React.MouseEvent<HTMLDialogElement>): boolean => {
  if (event.target !== event.currentTarget) return false;
  const bounds = event.currentTarget.getBoundingClientRect();
  return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
};

/**
 * Shared modal built on native `showModal()`: the browser makes every other pane
 * inert while it is open. Mark the child that should receive initial focus with
 * `data-autofocus` — React's `autoFocus` fires before the dialog opens, which would
 * steal focus from the trigger we restore on close.
 */
export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, maxWidth = 'max-w-md' }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressedOutsideRef = useRef(false);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (!dialog.open) dialog.showModal();
    (dialog.querySelector<HTMLElement>('[data-autofocus]') ?? dialog).focus({ preventScroll: true });

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      tabIndex={-1}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // Chromium may close without `cancel` after repeated Escape; keep the caller's state in sync.
      // The `open` check ignores the queued event from our own cleanup `close()`.
      onClose={() => {
        if (dialogRef.current?.open === false) onClose();
      }}
      onMouseDown={(event) => {
        pressedOutsideRef.current = isOutsidePanel(event);
      }}
      onClick={(event) => {
        if (pressedOutsideRef.current && isOutsidePanel(event)) onClose();
        pressedOutsideRef.current = false;
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (element) => element.tabIndex >= 0 && !element.matches(':disabled') && element.getClientRects().length > 0,
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) {
          event.preventDefault();
          event.currentTarget.focus();
        } else if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
      className={`${maxWidth} m-auto w-[calc(100%-2rem)] max-h-[85dvh] flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface-elevated p-0 text-slate-200 shadow-2xl backdrop:bg-black/70 open:flex focus:outline-none`}
    >
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-6 py-4">
        <h2 id={titleId} className="min-w-0 break-words text-base font-bold leading-snug text-white">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="-m-1 shrink-0 rounded-lg p-1.5 text-slate-300 transition-colors duration-150 hover:bg-white/10 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 space-y-4">
        {children}
      </div>
    </dialog>
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
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${destructive ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
          <AlertTriangle className={`w-4 h-4 ${destructive ? 'text-rose-400' : 'text-amber-400'}`} />
        </div>
        <div className="space-y-1.5 min-w-0">
          <p className="text-sm text-slate-200 leading-relaxed break-words">{message}</p>
          {detail && <p className="text-xs text-slate-300 leading-relaxed break-words font-mono">{detail}</p>}
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-medium transition-colors duration-150"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          data-autofocus
          className={`px-4 py-2 rounded-lg text-white text-xs font-semibold transition-colors duration-150 ${
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
