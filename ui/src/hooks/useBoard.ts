import { useState, useEffect, useCallback, useRef } from 'react';
import type { BoardData, StoryStatus } from '../../../src/types/index';
import { fetchBoard, moveStory as apiMoveStory } from '../lib/api';

export function useBoard() {
  const [board, setBoard] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

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

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // WebSocket for live reload
  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let isUnmounting = false;

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      ws = new WebSocket(wsUrl);

      ws.addEventListener('open', () => {
        setConnected(true);
      });

      ws.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'file-changed') {
            refresh();
          }
        } catch {
          // Ignore invalid messages
        }
      });

      ws.addEventListener('close', () => {
        setConnected(false);
        wsRef.current = null;
        // Auto-reconnect after 3s
        if (!isUnmounting) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      });

      ws.addEventListener('error', () => {
        // Will trigger close event, reconnect handled there
      });

      wsRef.current = ws;
    }

    connect();

    return () => {
      isUnmounting = true;
      clearTimeout(reconnectTimer);
      if (ws && ws.readyState <= 1) {
        ws.close();
      }
    };
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

  return { board, loading, error, connected, refresh, moveStory };
}
