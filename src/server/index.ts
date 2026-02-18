import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import fastifyWebsocket from '@fastify/websocket';
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { WebSocket } from 'ws';
import { boardRoutes } from './routes/board.js';
import { createFileWatcher, type FileWatcher } from './watcher.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface ServerOptions {
  bmadPath: string;
  port: number;
  host?: string;
  watch?: boolean;
}

export async function createServer(opts: ServerOptions) {
  const { bmadPath, port, host = '127.0.0.1', watch = true } = opts;

  const app = Fastify({ logger: false });

  // CORS for dev mode (Vite runs on different port)
  await app.register(fastifyCors, { origin: true });

  // WebSocket
  await app.register(fastifyWebsocket);

  // Track connected WS clients
  const wsClients = new Set<WebSocket>();

  app.get('/ws', { websocket: true }, (socket) => {
    wsClients.add(socket);
    socket.on('close', () => wsClients.delete(socket));
  });

  function broadcast(event: { type: string; file?: string }) {
    const msg = JSON.stringify(event);
    for (const client of wsClients) {
      if (client.readyState === 1) {
        client.send(msg);
      }
    }
  }

  // API routes
  await app.register(boardRoutes, { bmadPath });

  // Serve built UI (production) or proxy to Vite (dev)
  const uiDistPath = join(__dirname, '..', '..', 'ui-dist');
  if (existsSync(uiDistPath)) {
    await app.register(fastifyStatic, {
      root: uiDistPath,
      prefix: '/',
    });

    // SPA fallback: serve index.html for all non-API routes
    app.setNotFoundHandler((_request, reply) => {
      return reply.sendFile('index.html');
    });
  }

  // File watcher
  let watcher: FileWatcher | null = null;
  if (watch) {
    watcher = createFileWatcher(bmadPath, (filePath) => {
      broadcast({ type: 'file-changed', file: filePath });
    });
  }

  await app.listen({ port, host });

  return {
    app,
    url: `http://${host}:${port}`,
    close: async () => {
      if (watcher) await watcher.close();
      await app.close();
    },
  };
}
