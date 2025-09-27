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

app.get('/healthz', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);


export default app;


