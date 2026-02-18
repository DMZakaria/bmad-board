import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Story, StoryStatus } from '../../../../src/types/index';
import { COLUMN_LABELS } from '../../../../src/types/index';
import { StoryCard } from '../StoryCard';

interface ColumnProps {
  status: StoryStatus;
  stories: Story[];
  epicNames: Record<string, string>;
}

const COLUMN_HEADER_COLORS: Record<StoryStatus, string> = {
  backlog: 'text-slate-400',
  'ready-for-dev': 'text-violet-400',
  'in-progress': 'text-blue-400',
  review: 'text-amber-400',
  done: 'text-green-400',
};

const COLUMN_DOT_COLORS: Record<StoryStatus, string> = {
  backlog: 'bg-slate-500',
  'ready-for-dev': 'bg-violet-500',
  'in-progress': 'bg-blue-500',
  review: 'bg-amber-500',
  done: 'bg-green-500',
};

export function Column({ status, stories, epicNames }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      className={`
        flex flex-col min-w-[280px] max-w-[320px] w-[280px]
        bg-slate-900/50 rounded-xl
        ${isOver ? 'ring-2 ring-blue-500/50 bg-slate-900/80' : ''}
        transition-all duration-200
      `}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-slate-800/50">
        <div
          className={`w-2 h-2 rounded-full ${COLUMN_DOT_COLORS[status]}`}
        />
        <h3
          className={`text-xs font-semibold uppercase tracking-wider ${COLUMN_HEADER_COLORS[status]}`}
        >
          {COLUMN_LABELS[status]}
        </h3>
        <span className="ml-auto text-xs text-slate-600 tabular-nums">
          {stories.length}
        </span>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[100px]"
        style={{ maxHeight: 'calc(100vh - 140px)' }}
      >
        <SortableContext
          items={stories.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              epicName={epicNames[story.epicId] || ''}
            />
          ))}
        </SortableContext>

        {stories.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-slate-700 border border-dashed border-slate-800 rounded-lg">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}
