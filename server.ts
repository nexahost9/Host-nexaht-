import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { authenticate } from './server/auth.ts';
import { apiRouter } from './server/routes.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON and URL-encoded body parser with generous limit
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Global authentication extractor
  app.use(authenticate);

  // Mount API routes
  app.use('/api', apiRouter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexa Host server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
