import type { StoryStatus } from '../../../../src/types/index';

const STATUS_COLORS: Record<StoryStatus, string> = {
  backlog: 'bg-status-backlog',
  'ready-for-dev': 'bg-status-ready',
  'in-progress': 'bg-status-progress',
  review: 'bg-status-review',
  done: 'bg-status-done',
};

const STATUS_LABELS: Record<StoryStatus, string> = {
  backlog: 'Backlog',
  'ready-for-dev': 'Ready',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
};

interface StatusDotProps {
  status: StoryStatus;
  size?: 'sm' | 'md';
  withLabel?: boolean;
  className?: string;
}

export function StatusDot({ status, size = 'sm', withLabel, className = '' }: StatusDotProps) {
  const dotSize = size === 'sm' ? 'w-[6px] h-[6px]' : 'w-2 h-2';

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`${dotSize} rounded-full shrink-0 ${STATUS_COLORS[status]}`} />
      {withLabel && (
        <span className="text-[11px] text-text-secondary">{STATUS_LABELS[status]}</span>
      )}
    </span>
  );
}

export { STATUS_COLORS, STATUS_LABELS };
