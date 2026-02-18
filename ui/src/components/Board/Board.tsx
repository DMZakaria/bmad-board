import { useCallback, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import type { BoardData, Story, StoryStatus } from '../../../../src/types/index';
import { BOARD_COLUMNS } from '../../../../src/types/index';
import { Column } from './Column';
import { StoryCard } from '../StoryCard';

interface BoardProps {
  board: BoardData;
  moveStory: (storyId: string, newStatus: StoryStatus) => void;
  filteredStories: Story[];
}

export function Board({ board, moveStory, filteredStories }: BoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const epicNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const epic of Object.values(board.epics)) {
      map[epic.id] = epic.name;
    }
    return map;
  }, [board.epics]);

  const columns = useMemo(() => {
    const groups: Record<StoryStatus, Story[]> = {
      backlog: [],
      'ready-for-dev': [],
      'in-progress': [],
      review: [],
      done: [],
    };
    for (const story of filteredStories) {
      if (groups[story.status]) {
        groups[story.status].push(story);
      }
    }
    return groups;
  }, [filteredStories]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const storyId = active.id as string;
      const newStatus = over.id as StoryStatus;

      if (BOARD_COLUMNS.includes(newStatus)) {
        const story = board.stories[storyId];
        if (story && story.status !== newStatus) {
          moveStory(storyId, newStatus);
        }
      }
    },
    [board.stories, moveStory]
  );

  const activeStory = activeId ? board.stories[activeId] : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 p-4 overflow-x-auto flex-1">
        {BOARD_COLUMNS.map((status) => (
          <Column
            key={status}
            status={status}
            stories={columns[status]}
            epicNames={epicNames}
          />
        ))}
      </div>

      <DragOverlay>
        {activeStory ? (
          <div className="w-[250px]">
            <StoryCard
              story={activeStory}
              epicName={epicNames[activeStory.epicId] || ''}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
