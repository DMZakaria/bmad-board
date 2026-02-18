import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Story } from '../../../../src/types/index';

interface StoryCardProps {
  story: Story;
  epicName: string;
}

const STATUS_COLORS: Record<string, string> = {
  backlog: 'border-l-slate-600',
  'ready-for-dev': 'border-l-violet-500',
  'in-progress': 'border-l-blue-500',
  review: 'border-l-amber-500',
  done: 'border-l-green-500',
};

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

  const taskPct =
    story.tasksTotal > 0
      ? Math.round((story.tasksDone / story.tasksTotal) * 100)
      : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-slate-800 rounded-lg p-3 border-l-4 ${STATUS_COLORS[story.status] || 'border-l-slate-600'}
        cursor-grab active:cursor-grabbing
        hover:bg-slate-750 hover:ring-1 hover:ring-slate-600
        transition-all duration-150
        ${isDragging ? 'opacity-50 shadow-2xl ring-2 ring-blue-500' : 'shadow-sm'}
      `}
    >
      {/* Epic label */}
      <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-1 truncate">
        {epicName}
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-slate-200 leading-snug mb-2 line-clamp-2">
        {story.title}
      </h4>

      {/* Footer: tasks + assignees */}
      <div className="flex items-center justify-between gap-2">
        {/* Tasks progress */}
        {taskPct !== null && (
          <div className="flex items-center gap-1.5">
            <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500"
                style={{ width: `${taskPct}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 tabular-nums">
              {story.tasksDone}/{story.tasksTotal}
            </span>
          </div>
        )}

        {/* Assignees */}
        {story.assignees.length > 0 && (
          <div className="flex -space-x-1">
            {story.assignees.slice(0, 3).map((name) => (
              <div
                key={name}
                className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center text-[9px] font-bold text-slate-300 ring-1 ring-slate-800"
                title={name}
              >
                {name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        )}

        {/* File indicator */}
        {story.hasFile && (
          <span className="text-[10px] text-slate-600" title="Story file exists">
            &#128196;
          </span>
        )}
      </div>

      {/* Comment if present */}
      {story.comment && (
        <p className="text-[10px] text-slate-600 mt-1.5 truncate">
          {story.comment}
        </p>
      )}
    </div>
  );
}
