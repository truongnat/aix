import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

interface SelectProps {
  readonly value: string;
  readonly options: readonly SelectOption[];
  readonly onChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
  readonly className?: string;
  readonly emptyLabel?: string;
}

/**
 * Custom dropdown replacing the native <select>. Renders a styled listbox
 * popover consistent with the app surface system, with keyboard support.
 */
export const Select: React.FC<SelectProps> = ({
  value,
  options,
  onChange,
  disabled = false,
  ariaLabel,
  className = '',
  emptyLabel = 'No options available',
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)));
    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open, options, value]);

  useEffect(() => {
    if (!open) return;
    const item = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const commit = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (open) commit(activeIndex);
        else setOpen(true);
        break;
      case 'Escape':
        event.preventDefault();
        setOpen(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!open) setOpen(true);
        else setActiveIndex((i) => Math.min(options.length - 1, i + 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!open) setOpen(true);
        else setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case 'Home':
        if (open) { event.preventDefault(); setActiveIndex(0); }
        break;
      case 'End':
        if (open) { event.preventDefault(); setActiveIndex(options.length - 1); }
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        disabled={disabled || options.length === 0}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between gap-2 bg-white/5 border rounded-lg px-3 py-2 text-xs text-white font-mono text-left transition-colors focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${open ? 'border-blue-500' : 'border-white/10 hover:border-white/20'}`}
      >
        <span className="truncate">{selected?.label ?? <span className="text-slate-500">—</span>}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          tabIndex={-1}
          className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-white/10 bg-surface-elevated shadow-2xl shadow-black/60 py-1"
        >
          {options.length === 0 && (
            <li className="px-3 py-2 text-xs text-slate-500 italic" aria-disabled="true">{emptyLabel}</li>
          )}
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => commit(index)}
                className={`flex items-center justify-between gap-2 px-3 py-1.5 text-xs font-mono cursor-pointer transition-colors ${
                  isSelected ? 'text-blue-300' : 'text-slate-200'
                } ${isActive ? 'bg-white/[0.06]' : ''}`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
