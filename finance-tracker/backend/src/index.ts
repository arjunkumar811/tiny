import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';

const app = new Hono();

app.use('/*', cors({
  origin: ['http://localhost:3000'],
  credentials: true,
}));

app.get('/', (c) => {
  return c.json({ 
    message: 'Finance Tracker API',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (c) => {
  return c.json({ status: 'ok' });
});

app.route('/api/auth', authRoutes);
app.route('/api/transactions', transactionRoutes);

const port = parseInt(process.env.PORT || '3001');

console.log(`🚀 Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});
