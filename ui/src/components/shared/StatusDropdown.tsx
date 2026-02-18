import { useCallback, useEffect, useRef, useState } from 'react';
import type { StoryStatus } from '../../../../src/types/index';
import { BOARD_COLUMNS } from '../../../../src/types/index';
import { STATUS_LABELS } from './StatusDot';

const STATUS_DOT_COLORS: Record<StoryStatus, string> = {
  backlog: '#6b6b6b',
  'ready-for-dev': '#9b59b6',
  'in-progress': '#2383e2',
  review: '#d4a844',
  done: '#44b556',
};

interface StatusDropdownProps {
  currentStatus: StoryStatus;
  onStatusChange: (newStatus: StoryStatus) => void;
}

export function StatusDropdown({ currentStatus, onStatusChange }: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((v) => !v);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        className="w-5 h-5 rounded flex items-center justify-center hover:bg-bg-hover transition-colors"
        title={STATUS_LABELS[currentStatus]}
      >
        <span
          className="w-[7px] h-[7px] rounded-full"
          style={{ backgroundColor: STATUS_DOT_COLORS[currentStatus] }}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-bg-elevated border border-border rounded-md shadow-lg py-1 min-w-[140px]">
          {BOARD_COLUMNS.map((status) => (
            <button
              key={status}
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(status);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-[12px] transition-colors
                ${status === currentStatus
                  ? 'text-text-primary bg-bg-active'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                }`}
            >
              <span
                className="w-[6px] h-[6px] rounded-full shrink-0"
                style={{ backgroundColor: STATUS_DOT_COLORS[status] }}
              />
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
