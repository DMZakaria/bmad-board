import type { BoardData, MoveStoryPayload, CreateStoryPayload } from '../../../src/types/index';

const BASE = '/api';

export async function fetchBoard(): Promise<BoardData> {
  const res = await fetch(`${BASE}/board`);
  if (!res.ok) throw new Error(`Failed to fetch board: ${res.statusText}`);
  return res.json();
}

export async function moveStory(
  storyId: string,
  newStatus: MoveStoryPayload['newStatus']
): Promise<void> {
  const res = await fetch(`${BASE}/stories/${encodeURIComponent(storyId)}/move`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storyId, newStatus }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to move story');
  }
}

export async function createStory(
  payload: CreateStoryPayload
): Promise<{ storyKey: string }> {
  const res = await fetch(`${BASE}/stories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create story');
  }
  return res.json();
}
