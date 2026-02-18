import { useState } from 'react';
import { Header } from './components/Layout';
import { Board } from './components/Board';
import { Filters } from './components/Filters';
import { useBoard } from './hooks/useBoard';

export default function App() {
  const { board, loading, error, connected, refresh, moveStory } = useBoard();
  const [featureFilter, setFeatureFilter] = useState<string | null>(null);
  const [epicFilter, setEpicFilter] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-500 text-sm">Loading board...</div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-2">
            Failed to load board
          </p>
          <p className="text-slate-500 text-xs">{error}</p>
          <button
            onClick={refresh}
            className="mt-4 px-3 py-1.5 bg-slate-800 text-slate-300 text-sm rounded hover:bg-slate-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header board={board} connected={connected} onRefresh={refresh} />
      <Filters
        board={board}
        featureFilter={featureFilter}
        epicFilter={epicFilter}
        onFeatureChange={setFeatureFilter}
        onEpicChange={setEpicFilter}
      />
      <Board
        board={board}
        moveStory={moveStory}
        featureFilter={featureFilter}
        epicFilter={epicFilter}
      />
    </div>
  );
}
