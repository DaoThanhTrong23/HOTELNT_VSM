import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { SCREENSHOTS_DIR } from './support/paths.js';

// Starts the app inside the test process and stops it in teardown, so no dev server is left behind.
// Fixed port + strictPort: a busy port is reported, never silently replaced by another one.
const PORT = 5199;
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TARGETS = ['mock', 'backend'];

export default async function setup(project) {
  const target = process.env.E2E_TARGET || 'mock';
  if (!TARGETS.includes(target)) {
    throw new Error(`E2E_TARGET="${target}" không hợp lệ. Dùng "mock" (mặc định) hoặc "backend".`);
  }
  // Vite reads VITE_* from process.env before the .env files. backend keeps VITE_API_BASE_URL from the environment.
  process.env.VITE_USE_MOCK = target === 'mock' ? 'true' : 'false';
  fs.rmSync(SCREENSHOTS_DIR, { recursive: true, force: true });

  let server;
  try {
    server = await createServer({
      root: ROOT,
      configFile: path.join(ROOT, 'vite.config.js'),
      // Separate cache so a dev server already running on 5173 keeps its own optimized deps.
      cacheDir: path.join(ROOT, 'node_modules/.vite-e2e'),
      logLevel: 'warn',
      server: {
        port: PORT,
        strictPort: true,
        warmup: { clientFiles: ['./src/main.jsx', './src/pages/host/**/*.jsx'] },
      },
    });
    await server.listen();
  } catch (error) {
    await server?.close();
    if (error?.code === 'EADDRINUSE' || /port .*in use/i.test(error?.message ?? '')) {
      throw new Error(`Cổng ${PORT} đang bận. Xem tiến trình giữ cổng bằng "lsof -i :${PORT}" rồi dừng đúng tiến trình đó.`);
    }
    throw error;
  }

  project.provide('baseUrl', `http://localhost:${PORT}`);
  project.provide('target', target);

  return async () => {
    await server.close();
  };
}
