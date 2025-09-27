import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import postsRouter from './routes/posts.routes';
import authRouter from './routes/auth.routes';
import cookieParser from 'cookie-parser';

const app = express();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.url} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// Quick health checks with timeout
const healthCheck = (_req: express.Request, res: express.Response) => {
  console.log('Health check requested');
  res.setTimeout(2000, () => {
    console.log('Health check timeout');
    res.status(503).json({ error: 'Health check timeout' });
  });
  res.json({ ok: true });
};

app.get('/', healthCheck);
app.get('/healthz', healthCheck);
app.get('/api/healthz', healthCheck);

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
  next(err);
});

export default app;