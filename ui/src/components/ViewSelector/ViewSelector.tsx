import type { ViewMode } from '../../types';

interface ViewSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  storyCount: number;
  onNewStory: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const TABS: { mode: ViewMode; label: string }[] = [
  { mode: 'board', label: 'Board' },
  { mode: 'list', label: 'List' },
  { mode: 'table', label: 'Table' },
];

export function ViewSelector({
  viewMode,
  onViewModeChange,
  storyCount,
  onNewStory,
  searchQuery,
  onSearchChange,
}: ViewSelectorProps) {
  return (
    <div className="flex items-center gap-4 px-5 py-2.5 border-b border-border">
      {/* Tabs */}
      <div className="flex items-center gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.mode}
            onClick={() => onViewModeChange(tab.mode)}
            className={`px-2.5 py-1 text-[13px] font-medium rounded-md transition-colors
              ${tab.mode === viewMode
                ? 'text-text-primary bg-bg-active'
                : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-[280px]">
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search stories..."
          className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-transparent border border-transparent rounded-md
            text-text-primary placeholder:text-text-muted
            focus:border-border focus:bg-bg-surface outline-none transition-all"
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Story count */}
      <span className="text-[11px] text-text-muted tabular-nums">
        {storyCount} stories
      </span>

      {/* New Story */}
      <button
        onClick={onNewStory}
        className="px-3 py-1.5 text-[12px] font-medium text-white bg-accent hover:bg-accent-hover rounded-md transition-colors"
      >
        + New
      </button>
    </div>
  );
}
