import { useMemo } from 'react';
import type { BoardData } from '../../../../src/types/index';
import type { ViewMode } from '../../types';

interface SidebarProps {
  board: BoardData;
  connected: boolean;
  featureFilter: string | null;
  epicFilter: string | null;
  viewMode: ViewMode;
  onFeatureChange: (featureId: string | null) => void;
  onEpicChange: (epicId: string | null) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onRefresh: () => void;
}

const VIEW_ITEMS: { mode: ViewMode | null; label: string; icon: string }[] = [
  { mode: null, label: 'All Stories', icon: '\u25A1' },
  { mode: 'board', label: 'Board', icon: '\u25A6' },
  { mode: 'list', label: 'List', icon: '\u2261' },
  { mode: 'table', label: 'Table', icon: '\u25A4' },
];

export function Sidebar({
  board,
  connected,
  featureFilter,
  epicFilter,
  viewMode,
  onFeatureChange,
  onEpicChange,
  onViewModeChange,
  onRefresh,
}: SidebarProps) {
  const stats = useMemo(() => {
    const stories = Object.values(board.stories);
    const done = stories.filter((s) => s.status === 'done').length;
    return { done, total: stories.length };
  }, [board.stories]);

  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <aside className="w-[220px] min-w-[220px] h-full flex flex-col bg-bg-surface border-r border-border select-none">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="text-[14px] font-semibold text-text-primary tracking-tight">
          bmad-board
        </div>
        <div className="text-[11px] text-text-muted mt-0.5 truncate">
          {board.project}
        </div>
      </div>

      {/* Views */}
      <div className="px-2 mb-1">
        <div className="px-2 py-1.5 text-[10px] font-medium text-text-muted uppercase tracking-wider">
          Views
        </div>
        {VIEW_ITEMS.map((item) => {
          const isActive = item.mode === null
            ? !featureFilter
            : item.mode === viewMode;

          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.mode === null) {
                  onFeatureChange(null);
                  onEpicChange(null);
                } else {
                  onViewModeChange(item.mode);
                }
              }}
              className={`w-full flex items-center gap-2.5 px-2 py-[5px] rounded-md text-[13px] transition-colors
                ${isActive
                  ? 'bg-bg-active text-text-primary'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                }`}
            >
              <span className="text-[12px] w-4 text-center opacity-60">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-border my-2" />

      {/* Features */}
      <div className="px-2 flex-1 overflow-y-auto">
        <div className="px-2 py-1.5 text-[10px] font-medium text-text-muted uppercase tracking-wider">
          Features
        </div>
        {board.features.map((feature) => {
          const isActive = featureFilter === feature.id;
          const epics = feature.epicIds
            .map((id) => board.epics[id])
            .filter(Boolean);

          return (
            <div key={feature.id}>
              <button
                onClick={() => {
                  if (isActive) {
                    onFeatureChange(null);
                    onEpicChange(null);
                  } else {
                    onFeatureChange(feature.id);
                    onEpicChange(null);
                  }
                }}
                className={`w-full flex items-center gap-2 px-2 py-[5px] rounded-md text-[13px] transition-colors
                  ${isActive
                    ? 'bg-bg-active text-text-primary'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                  }`}
              >
                <span className="text-[12px] w-4 text-center">{feature.icon}</span>
                <span className="truncate">{feature.name}</span>
                <span className="ml-auto text-[10px] text-text-muted tabular-nums">
                  {epics.length}
                </span>
              </button>

              {/* Epic sub-items */}
              {isActive && epics.length > 0 && (
                <div className="ml-4 mt-0.5 mb-1">
                  {epics.map((epic) => {
                    const epicActive = epicFilter === epic.id;
                    const epicDone = epic.storyIds
                      .map((id) => board.stories[id])
                      .filter((s) => s?.status === 'done').length;

                    return (
                      <button
                        key={epic.id}
                        onClick={() => {
                          onEpicChange(epicActive ? null : epic.id);
                        }}
                        className={`w-full flex items-center gap-1.5 px-2 py-[3px] rounded text-[12px] transition-colors
                          ${epicActive
                            ? 'bg-bg-active text-text-primary'
                            : 'text-text-muted hover:bg-bg-hover hover:text-text-secondary'
                          }`}
                      >
                        <span className="truncate flex-1 text-left">
                          E{epic.num}: {epic.name}
                        </span>
                        <span className="text-[10px] tabular-nums shrink-0">
                          {epicDone}/{epic.storyIds.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border mt-auto">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1.5 bg-bg-active rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[10px] text-text-muted tabular-nums whitespace-nowrap">
            {stats.done}/{stats.total}
          </span>
        </div>

        {/* Status row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-[6px] h-[6px] rounded-full ${
                connected ? 'bg-status-done' : 'bg-status-backlog'
              }`}
            />
            <span className="text-[11px] text-text-muted">
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
          <button
            onClick={onRefresh}
            className="text-[11px] text-text-muted hover:text-text-secondary transition-colors"
            title="Refresh"
          >
            Refresh
          </button>
        </div>
      </div>
    </aside>
  );
}
