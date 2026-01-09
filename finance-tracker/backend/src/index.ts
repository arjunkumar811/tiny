import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// CORS configuration
app.use('/*', cors({
  origin: ['http://localhost:3000'],
  credentials: true,
}));

// Health check
app.get('/', (c) => {
  return c.json({ 
    message: 'Finance Tracker API',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API routes will be added here
app.get('/api/health', (c) => {
  return c.json({ status: 'ok' });
});

const port = parseInt(process.env.PORT || '3001');

console.log(`🚀 Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});
