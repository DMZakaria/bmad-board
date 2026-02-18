import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Story, StoryStatus } from '../../../../src/types/index';
import { StoryCard } from '../StoryCard';

interface SwimlaneCellProps {
  /** Unique droppable ID: "epicId::status" */
  droppableId: string;
  status: StoryStatus;
  stories: Story[];
  epicName: string;
}

export function SwimlaneCell({
  droppableId,
  stories,
  epicName,
}: SwimlaneCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });

  return (
    <div
      ref={setNodeRef}
      className={`
        min-w-[220px] w-[220px] p-1.5 space-y-1.5 min-h-[60px] rounded-lg
        ${isOver ? 'bg-blue-500/10 ring-1 ring-blue-500/30' : ''}
        transition-all duration-150
      `}
    >
      <SortableContext
        items={stories.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        {stories.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            epicName={epicName}
            compact
          />
        ))}
      </SortableContext>
    </div>
  );
}
