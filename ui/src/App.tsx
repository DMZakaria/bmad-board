import { useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ViewSelector } from './components/ViewSelector';
import { Board } from './components/Board';
import { ListView } from './components/ListView';
import { TableView } from './components/TableView';
import { CreateStoryModal } from './components/CreateStory';
import { useBoard } from './hooks/useBoard';
import type { ViewMode } from './types';

export default function App() {
  const { board, loading, error, connected, refresh, moveStory } = useBoard();
  const [featureFilter, setFeatureFilter] = useState<string | null>(null);
  const [epicFilter, setEpicFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateStory, setShowCreateStory] = useState(false);

  const filteredStories = useMemo(() => {
    if (!board) return [];
    return Object.values(board.stories).filter((story) => {
      if (featureFilter && story.featureId !== featureFilter) return false;
      if (epicFilter && story.epicId !== epicFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !story.title.toLowerCase().includes(q) &&
          !story.id.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [board, featureFilter, epicFilter, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-main">
        <div className="text-text-muted text-[13px]">Loading board...</div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-main">
        <div className="text-center">
          <p className="text-red-400 text-[13px] mb-2">Failed to load board</p>
          <p className="text-text-muted text-[12px]">{error}</p>
          <button
            onClick={refresh}
            className="mt-4 px-3 py-1.5 bg-bg-surface text-text-secondary text-[12px] rounded-md hover:bg-bg-hover border border-border"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-main">
      <Sidebar
        board={board}
        connected={connected}
        featureFilter={featureFilter}
        epicFilter={epicFilter}
        viewMode={viewMode}
        onFeatureChange={setFeatureFilter}
        onEpicChange={setEpicFilter}
        onViewModeChange={setViewMode}
        onRefresh={refresh}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <ViewSelector
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          storyCount={filteredStories.length}
          onNewStory={() => setShowCreateStory(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="flex-1 overflow-auto">
          {viewMode === 'board' && (
            <Board
              board={board}
              moveStory={moveStory}
              filteredStories={filteredStories}
            />
          )}
          {viewMode === 'list' && (
            <ListView
              board={board}
              stories={filteredStories}
              moveStory={moveStory}
            />
          )}
          {viewMode === 'table' && (
            <TableView
              board={board}
              stories={filteredStories}
              moveStory={moveStory}
            />
          )}
        </div>
      </main>
      <CreateStoryModal
        board={board}
        open={showCreateStory}
        onClose={() => setShowCreateStory(false)}
        onCreated={refresh}
      />
    </div>
  );
}
