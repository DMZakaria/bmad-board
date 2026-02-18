import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Story } from '../../../../src/types/index';
import { StatusDot } from '../shared';

interface StoryCardProps {
  story: Story;
  epicName: string;
}

export function StoryCard({ story, epicName }: StoryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: story.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-bg-surface border border-border rounded-md p-2.5
        cursor-grab active:cursor-grabbing
        hover:bg-bg-hover
        transition-all duration-100
        ${isDragging ? 'opacity-40 shadow-lg' : ''}
      `}
    >
      {/* Title */}
      <div className="text-[13px] font-medium text-text-primary leading-snug line-clamp-2 mb-1.5">
        {story.title}
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-2">
        <StatusDot status={story.status} size="sm" />
        <span className="text-[11px] text-text-muted truncate">
          {epicName}
        </span>
        <div className="flex-1" />
        {story.tasksTotal > 0 && (
          <span className="text-[11px] text-text-secondary tabular-nums">
            {story.tasksDone}/{story.tasksTotal}
          </span>
        )}
        {story.assignees.length > 0 && (
          <div className="flex -space-x-1">
            {story.assignees.slice(0, 2).map((name) => (
              <div
                key={name}
                className="w-[18px] h-[18px] rounded-full bg-bg-active flex items-center justify-center text-[8px] font-semibold text-text-secondary ring-1 ring-bg-surface"
                title={name}
              >
                {name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
