import type { BoardData } from '../../../../src/types/index';

interface HeaderProps {
  board: BoardData;
  connected: boolean;
  onRefresh: () => void;
}

export function Header({ board, connected, onRefresh }: HeaderProps) {
  const totalStories = Object.keys(board.stories).length;
  const doneStories = Object.values(board.stories).filter(
    (s) => s.status === 'done'
  ).length;
  const pct =
    totalStories > 0 ? Math.round((doneStories / totalStories) * 100) : 0;

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-slate-100">
          bmad-board
        </h1>
        <span className="text-sm text-slate-500">
          {board.project}
        </span>
        {/* Live connection indicator */}
        <span
          className={`flex items-center gap-1 text-[10px] ${
            connected ? 'text-green-500' : 'text-slate-600'
          }`}
          title={connected ? 'Live reload active' : 'Disconnected'}
        >
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${
              connected ? 'bg-green-500 animate-pulse' : 'bg-slate-600'
            }`}
          />
          {connected ? 'Live' : 'Offline'}
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                backgroundColor:
                  pct === 100
                    ? '#22c55e'
                    : pct >= 60
                      ? '#3b82f6'
                      : '#f59e0b',
              }}
            />
          </div>
          <span className="text-xs text-slate-400 tabular-nums">
            {doneStories}/{totalStories} ({pct}%)
          </span>
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="text-slate-400 hover:text-slate-200 transition-colors text-sm px-2 py-1 rounded hover:bg-slate-800"
          title="Refresh board"
        >
          Refresh
        </button>
      </div>
    </header>
  );
}
