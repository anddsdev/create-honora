import { serve } from '@hono/node-server';

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { apiRouter } from './routes/api.js';
import { healthRouter } from './routes/health.js';

// Create Hono app
const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', cors());

// Routes
app.route('/health', healthRouter);
app.route('/api', apiRouter);

// Default route
app.get('/', (c) => {
  return c.json({
    message: 'Welcome to {{projectName}} API',
    version: '0.0.1',
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: `Route ${c.req.url} not found`,
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({
    error: 'Internal Server Error',
    message: err.message,
  }, 500);
});

// Start server
const port = process.env.PORT || 3000;

serve({
  fetch: app.fetch,
  port: Number(port),
});

console.log(`Server is running on http://localhost:${port}`); 