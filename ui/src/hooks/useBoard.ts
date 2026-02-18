import { useState, useEffect, useCallback } from 'react';
import type { BoardData, StoryStatus } from '../../../src/types/index';
import { fetchBoard, moveStory as apiMoveStory } from '../lib/api';

export function useBoard() {
  const [board, setBoard] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchBoard();
      setBoard(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const moveStory = useCallback(
    async (storyId: string, newStatus: StoryStatus) => {
      if (!board) return;

      // Optimistic update
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          stories: {
            ...prev.stories,
            [storyId]: { ...prev.stories[storyId], status: newStatus },
          },
        };
      });

      try {
        await apiMoveStory(storyId, newStatus);
      } catch {
        // Revert on failure
        await refresh();
      }
    },
    [board, refresh]
  );

  return { board, loading, error, refresh, moveStory };
}
