import type { FastifyInstance } from 'fastify';
import { parseBoardData } from '../parsers/index.js';
import { updateStoryStatus, createStoryFile } from '../writers/index.js';
import type { MoveStoryPayload, CreateStoryPayload } from '../../types/index.js';

export async function boardRoutes(
  app: FastifyInstance,
  opts: { bmadPath: string }
) {
  const { bmadPath } = opts;

  // GET /api/board — full board data
  app.get('/api/board', async () => {
    return parseBoardData(bmadPath);
  });

  // PATCH /api/stories/:id/move — drag & drop status change
  app.patch<{ Params: { id: string }; Body: MoveStoryPayload }>(
    '/api/stories/:id/move',
    async (request, reply) => {
      const { id } = request.params;
      const { newStatus } = request.body as MoveStoryPayload;

      try {
        updateStoryStatus(bmadPath, id, newStatus);
        return { ok: true, storyId: id, newStatus };
      } catch (err) {
        return reply
          .status(400)
          .send({ ok: false, error: (err as Error).message });
      }
    }
  );

  // POST /api/stories — create new story
  app.post<{ Body: CreateStoryPayload }>(
    '/api/stories',
    async (request, reply) => {
      const body = request.body as CreateStoryPayload;

      try {
        // Build the story key from feature + epic + title slug
        const slug = body.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        // Determine prefix and epic key
        const prefixMap: Record<string, string> = {
          bpc: 'bpc-',
          ref: 'ref-',
          bugfix: 'bug-',
          planning: '',
        };
        const prefix = prefixMap[body.featureId] ?? '';

        // Count existing stories in this epic to determine story number
        const boardData = parseBoardData(bmadPath);
        const epicId = `${body.featureId}:${body.epicNum}`;
        const epic = boardData.epics[epicId];
        const nextNum = epic ? epic.storyIds.length + 1 : 1;

        const storyKey = `${prefix}${body.epicNum}-${nextNum}-${slug}`;
        const epicKey =
          body.featureId === 'bugfix'
            ? 'epic-bugfix'
            : `${prefix}epic-${body.epicNum}`;

        createStoryFile(bmadPath, {
          storyKey,
          epicKey,
          storyNum: `${body.epicNum}.${nextNum}`,
          title: body.title,
          role: body.role,
          want: body.want,
          soThat: body.soThat,
          acceptanceCriteria: body.acceptanceCriteria,
        });

        return { ok: true, storyKey };
      } catch (err) {
        return reply
          .status(400)
          .send({ ok: false, error: (err as Error).message });
      }
    }
  );
}
