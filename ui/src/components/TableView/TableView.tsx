import type { BoardData, Story, StoryStatus } from '../../../../src/types/index';
import { StatusDropdown } from '../shared';

interface TableViewProps {
  board: BoardData;
  stories: Story[];
  moveStory: (storyId: string, newStatus: StoryStatus) => void;
}

const COLUMNS = [
  { key: 'status', label: 'Status', width: 'w-[44px]' },
  { key: 'title', label: 'Title', width: 'flex-1 min-w-[200px]' },
  { key: 'epic', label: 'Epic', width: 'w-[160px]' },
  { key: 'feature', label: 'Feature', width: 'w-[120px]' },
  { key: 'assignees', label: 'Assignees', width: 'w-[80px]' },
  { key: 'tasks', label: 'Tasks', width: 'w-[60px]' },
];

export function TableView({ board, stories, moveStory }: TableViewProps) {
  if (stories.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-[13px] text-text-muted">
        No stories match the current filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        {/* Header */}
        <thead className="sticky top-0 bg-bg-surface z-10">
          <tr className="border-b border-border">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={`${col.width} px-3 py-2 text-left text-[10px] font-medium text-text-muted uppercase tracking-wider`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {stories.map((story) => {
            const epic = board.epics[story.epicId];
            const feature = board.features.find(
              (f) => f.id === story.featureId
            );

            return (
              <tr
                key={story.id}
                className="border-b border-border-subtle hover:bg-bg-hover transition-colors"
              >
                {/* Status */}
                <td className="px-3 py-1.5">
                  <StatusDropdown
                    currentStatus={story.status}
                    onStatusChange={(status) => moveStory(story.id, status)}
                  />
                </td>

                {/* Title */}
                <td className="px-3 py-1.5">
                  <span className="text-[13px] text-text-primary line-clamp-1">
                    {story.title}
                  </span>
                </td>

                {/* Epic */}
                <td className="px-3 py-1.5">
                  {epic && (
                    <span className="text-[11px] text-text-muted truncate block">
                      E{epic.num}: {epic.name}
                    </span>
                  )}
                </td>

                {/* Feature */}
                <td className="px-3 py-1.5">
                  {feature && (
                    <span className="text-[11px] text-text-muted">
                      {feature.icon} {feature.name}
                    </span>
                  )}
                </td>

                {/* Assignees */}
                <td className="px-3 py-1.5">
                  {story.assignees.length > 0 && (
                    <div className="flex -space-x-1">
                      {story.assignees.slice(0, 3).map((name) => (
                        <div
                          key={name}
                          className="w-[18px] h-[18px] rounded-full bg-bg-active flex items-center justify-center text-[8px] font-semibold text-text-secondary ring-1 ring-bg-main"
                          title={name}
                        >
                          {name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                  )}
                </td>

                {/* Tasks */}
                <td className="px-3 py-1.5">
                  {story.tasksTotal > 0 && (
                    <span className="text-[11px] text-text-muted tabular-nums">
                      {story.tasksDone}/{story.tasksTotal}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
