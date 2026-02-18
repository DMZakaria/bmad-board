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
import type {
  BoardData,
  Epic,
  Story,
  StoryStatus,
} from '../../../../src/types/index';
import { BOARD_COLUMNS, COLUMN_LABELS } from '../../../../src/types/index';
import { SwimlaneCell } from './SwimlaneCell';
import { StoryCard } from '../StoryCard';

interface SwimlaneBoardProps {
  board: BoardData;
  moveStory: (storyId: string, newStatus: StoryStatus) => void;
  featureFilter: string | null;
  epicFilter: string | null;
}

/** Droppable ID format: "epicId::status" */
const SEPARATOR = '::';

function makeDroppableId(epicId: string, status: StoryStatus): string {
  return `${epicId}${SEPARATOR}${status}`;
}

function parseDroppableId(id: string): {
  epicId: string;
  status: StoryStatus;
} | null {
  const idx = id.lastIndexOf(SEPARATOR);
  if (idx === -1) return null;
  return {
    epicId: id.slice(0, idx),
    status: id.slice(idx + SEPARATOR.length) as StoryStatus,
  };
}

const COLUMN_DOT_COLORS: Record<StoryStatus, string> = {
  backlog: 'bg-slate-500',
  'ready-for-dev': 'bg-violet-500',
  'in-progress': 'bg-blue-500',
  review: 'bg-amber-500',
  done: 'bg-green-500',
};

const COLUMN_HEADER_COLORS: Record<StoryStatus, string> = {
  backlog: 'text-slate-400',
  'ready-for-dev': 'text-violet-400',
  'in-progress': 'text-blue-400',
  review: 'text-amber-400',
  done: 'text-green-400',
};

export function SwimlaneBoard({
  board,
  moveStory,
  featureFilter,
  epicFilter,
}: SwimlaneBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsedEpics, setCollapsedEpics] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Get ordered list of epics (grouped by feature)
  const visibleEpics = useMemo(() => {
    const epics: Epic[] = [];
    for (const feature of board.features) {
      if (featureFilter && feature.id !== featureFilter) continue;
      for (const epicId of feature.epicIds) {
        const epic = board.epics[epicId];
        if (!epic) continue;
        if (epicFilter && epic.id !== epicFilter) continue;
        epics.push(epic);
      }
    }
    return epics;
  }, [board, featureFilter, epicFilter]);

  // Stories grouped by epic+status
  const storiesByEpicStatus = useMemo(() => {
    const map: Record<string, Story[]> = {};
    for (const story of Object.values(board.stories)) {
      if (featureFilter && story.featureId !== featureFilter) continue;
      if (epicFilter && story.epicId !== epicFilter) continue;
      const key = makeDroppableId(story.epicId, story.status);
      if (!map[key]) map[key] = [];
      map[key].push(story);
    }
    return map;
  }, [board.stories, featureFilter, epicFilter]);

  const epicNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const epic of Object.values(board.epics)) {
      map[epic.id] = epic.name;
    }
    return map;
  }, [board.epics]);

  const toggleEpic = useCallback((epicId: string) => {
    setCollapsedEpics((prev) => {
      const next = new Set(prev);
      if (next.has(epicId)) next.delete(epicId);
      else next.add(epicId);
      return next;
    });
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const storyId = active.id as string;
      const parsed = parseDroppableId(over.id as string);
      if (!parsed) return;

      const story = board.stories[storyId];
      if (story && story.status !== parsed.status) {
        moveStory(storyId, parsed.status);
      }
    },
    [board.stories, moveStory]
  );

  const activeStory = activeId ? board.stories[activeId] : null;

  // Epic stats helper
  function epicStats(epic: Epic) {
    const stories = epic.storyIds
      .map((id) => board.stories[id])
      .filter(Boolean);
    const done = stories.filter((s) => s.status === 'done').length;
    return { done, total: stories.length };
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-auto board-scroll">
        {/* Sticky column headers */}
        <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800/50">
          <div className="flex">
            {/* Epic label column */}
            <div className="w-[200px] min-w-[200px] shrink-0 px-3 py-2" />
            {/* Status columns */}
            {BOARD_COLUMNS.map((status) => (
              <div
                key={status}
                className="w-[220px] min-w-[220px] px-3 py-2 flex items-center gap-1.5"
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${COLUMN_DOT_COLORS[status]}`}
                />
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${COLUMN_HEADER_COLORS[status]}`}
                >
                  {COLUMN_LABELS[status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Swimlane rows */}
        {visibleEpics.map((epic) => {
          const collapsed = collapsedEpics.has(epic.id);
          const stats = epicStats(epic);
          const pct =
            stats.total > 0
              ? Math.round((stats.done / stats.total) * 100)
              : 0;
          const feature = board.features.find(
            (f) => f.id === epic.featureId
          );

          return (
            <div
              key={epic.id}
              className="border-b border-slate-800/30"
            >
              {/* Epic row header + cells */}
              <div className="flex">
                {/* Epic label (sticky left) */}
                <div
                  className="w-[200px] min-w-[200px] shrink-0 px-3 py-3 sticky left-0 bg-slate-950/80 backdrop-blur-sm z-[5] border-r border-slate-800/30 cursor-pointer select-none"
                  onClick={() => toggleEpic(epic.id)}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] text-slate-600">
                      {collapsed ? '\u25B6' : '\u25BC'}
                    </span>
                    {feature && (
                      <span className="text-[10px]">{feature.icon}</span>
                    )}
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                      Epic {epic.num}
                    </span>
                    <span
                      className={`text-[9px] px-1 py-px rounded ${
                        epic.status === 'done'
                          ? 'bg-green-500/20 text-green-400'
                          : epic.status === 'in-progress'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-slate-700 text-slate-500'
                      }`}
                    >
                      {epic.status}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-300 leading-snug line-clamp-2 mb-1.5">
                    {epic.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-600 tabular-nums">
                      {stats.done}/{stats.total}
                    </span>
                  </div>
                </div>

                {/* Status cells */}
                {!collapsed &&
                  BOARD_COLUMNS.map((status) => {
                    const cellId = makeDroppableId(epic.id, status);
                    const stories = storiesByEpicStatus[cellId] || [];
                    return (
                      <SwimlaneCell
                        key={cellId}
                        droppableId={cellId}
                        status={status}
                        stories={stories}
                        epicName={epic.name}
                      />
                    );
                  })}

                {/* Collapsed placeholder */}
                {collapsed && (
                  <div className="flex-1 flex items-center px-4">
                    <span className="text-xs text-slate-600">
                      {stats.done}/{stats.total} stories done
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {visibleEpics.length === 0 && (
          <div className="flex items-center justify-center h-40 text-sm text-slate-600">
            No epics match the current filters.
          </div>
        )}
      </div>

      <DragOverlay>
        {activeStory ? (
          <div className="w-[210px]">
            <StoryCard
              story={activeStory}
              epicName={epicNames[activeStory.epicId] || ''}
              compact
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
