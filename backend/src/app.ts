import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import postsRouter from './routes/posts.routes';
import authRouter from './routes/auth.routes';
import cookieParser from 'cookie-parser';

const app = express();
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// Quick health checks with timeout
const healthCheck = (_req: express.Request, res: express.Response) => {
  res.setTimeout(2000, () => {
    res.status(503).json({ error: 'Health check timeout' });
  });
  res.json({ ok: true });
};

app.get('/', healthCheck);
app.get('/healthz', healthCheck);
app.get('/api/healthz', healthCheck);

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);

export default app;