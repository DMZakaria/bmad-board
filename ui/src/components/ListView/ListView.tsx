import { useMemo, useState } from 'react';
import type { BoardData, Story, StoryStatus } from '../../../../src/types/index';
import { StatusDropdown } from '../shared';

interface ListViewProps {
  board: BoardData;
  stories: Story[];
  moveStory: (storyId: string, newStatus: StoryStatus) => void;
}

export function ListView({ board, stories, moveStory }: ListViewProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Group stories by epic
  const groups = useMemo(() => {
    const map: Record<string, Story[]> = {};
    for (const story of stories) {
      if (!map[story.epicId]) map[story.epicId] = [];
      map[story.epicId].push(story);
    }
    // Return in feature order
    const ordered: { epicId: string; stories: Story[] }[] = [];
    for (const feature of board.features) {
      for (const epicId of feature.epicIds) {
        if (map[epicId]) {
          ordered.push({ epicId, stories: map[epicId] });
        }
      }
    }
    return ordered;
  }, [stories, board.features, board.epics]);

  const toggle = (epicId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(epicId)) next.delete(epicId);
      else next.add(epicId);
      return next;
    });
  };

  if (stories.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-[13px] text-text-muted">
        No stories match the current filters.
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      {groups.map(({ epicId, stories: epicStories }) => {
        const epic = board.epics[epicId];
        if (!epic) return null;
        const feature = board.features.find((f) => f.id === epic.featureId);
        const isCollapsed = collapsed.has(epicId);
        const done = epicStories.filter((s) => s.status === 'done').length;

        return (
          <div key={epicId} className="mb-1">
            {/* Group header */}
            <button
              onClick={() => toggle(epicId)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-bg-hover transition-colors group"
            >
              <span className="text-[10px] text-text-muted transition-transform" style={{
                transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              }}>
                {'\u25BC'}
              </span>
              {feature && (
                <span className="text-[12px]">{feature.icon}</span>
              )}
              <span className="text-[13px] font-medium text-text-primary">
                E{epic.num}: {epic.name}
              </span>
              <span className="text-[11px] text-text-muted tabular-nums ml-auto">
                {done}/{epicStories.length}
              </span>
            </button>

            {/* Stories */}
            {!isCollapsed && (
              <div className="ml-2">
                {epicStories.map((story) => (
                  <StoryRow
                    key={story.id}
                    story={story}
                    onStatusChange={(status) => moveStory(story.id, status)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StoryRow({
  story,
  onStatusChange,
}: {
  story: Story;
  onStatusChange: (status: StoryStatus) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-[7px] rounded-md hover:bg-bg-hover transition-colors group">
      <StatusDropdown
        currentStatus={story.status}
        onStatusChange={onStatusChange}
      />
      <span className="text-[13px] text-text-primary truncate flex-1">
        {story.title}
      </span>
      {story.tasksTotal > 0 && (
        <span className="text-[11px] text-text-muted tabular-nums shrink-0">
          {story.tasksDone}/{story.tasksTotal}
        </span>
      )}
      {story.assignees.length > 0 && (
        <div className="flex -space-x-1 shrink-0">
          {story.assignees.slice(0, 2).map((name) => (
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
    </div>
  );
}
