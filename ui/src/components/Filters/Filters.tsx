import type { BoardData } from '../../../../src/types/index';

interface FiltersProps {
  board: BoardData;
  featureFilter: string | null;
  epicFilter: string | null;
  onFeatureChange: (featureId: string | null) => void;
  onEpicChange: (epicId: string | null) => void;
}

export function Filters({
  board,
  featureFilter,
  epicFilter,
  onFeatureChange,
  onEpicChange,
}: FiltersProps) {
  // Get epics for the selected feature
  const availableEpics = featureFilter
    ? board.features
        .find((f) => f.id === featureFilter)
        ?.epicIds.map((id) => board.epics[id])
        .filter(Boolean) ?? []
    : Object.values(board.epics);

  return (
    <div className="flex items-center gap-3 px-6 py-2 bg-slate-900/50 border-b border-slate-800/50">
      {/* Feature filter */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
          Feature
        </span>
        <div className="flex gap-1">
          <FilterChip
            active={featureFilter === null}
            onClick={() => {
              onFeatureChange(null);
              onEpicChange(null);
            }}
          >
            All
          </FilterChip>
          {board.features.map((feature) => (
            <FilterChip
              key={feature.id}
              active={featureFilter === feature.id}
              onClick={() => {
                onFeatureChange(feature.id);
                onEpicChange(null);
              }}
            >
              {feature.icon} {feature.name}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Epic filter (only when feature is selected) */}
      {featureFilter && availableEpics.length > 0 && (
        <div className="flex items-center gap-1.5 ml-4">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">
            Epic
          </span>
          <div className="flex gap-1 flex-wrap">
            <FilterChip
              active={epicFilter === null}
              onClick={() => onEpicChange(null)}
            >
              All
            </FilterChip>
            {availableEpics.map((epic) => (
              <FilterChip
                key={epic.id}
                active={epicFilter === epic.id}
                onClick={() => onEpicChange(epic.id)}
              >
                E{epic.num}: {epic.name}
              </FilterChip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-2 py-0.5 rounded text-xs font-medium transition-all whitespace-nowrap
        ${
          active
            ? 'bg-blue-600 text-white'
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
        }
      `}
    >
      {children}
    </button>
  );
}
