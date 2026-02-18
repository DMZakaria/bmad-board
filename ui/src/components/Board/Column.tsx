import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Story, StoryStatus } from '../../../../src/types/index';
import { COLUMN_LABELS } from '../../../../src/types/index';
import { StatusDot } from '../shared';
import { StoryCard } from '../StoryCard';

interface ColumnProps {
  status: StoryStatus;
  stories: Story[];
  epicNames: Record<string, string>;
}

export function Column({ status, stories, epicNames }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col min-w-[260px] w-[260px]">
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-2.5 mb-1">
        <StatusDot status={status} size="md" />
        <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">
          {COLUMN_LABELS[status]}
        </span>
        <span className="ml-auto text-[11px] text-text-muted tabular-nums">
          {stories.length}
        </span>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className={`flex-1 px-1 pb-4 space-y-1.5 min-h-[80px] rounded-md transition-colors duration-150
          ${isOver ? 'bg-bg-hover' : ''}`}
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
      </div>
    </div>
  );
}
