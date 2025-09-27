import app from './app';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Database URL:', process.env.DATABASE_URL?.slice(0, 20) + '...');
  console.log('Frontend Origin:', process.env.FRONTEND_ORIGIN);
});