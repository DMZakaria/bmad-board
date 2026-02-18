import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { boardRoutes } from './routes/board.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface ServerOptions {
  bmadPath: string;
  port: number;
  host?: string;
}

export async function createServer(opts: ServerOptions) {
  const { bmadPath, port, host = '127.0.0.1' } = opts;

  const app = Fastify({ logger: false });

  // CORS for dev mode (Vite runs on different port)
  await app.register(fastifyCors, { origin: true });

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

  await app.listen({ port, host });

  return { app, url: `http://${host}:${port}` };
}
