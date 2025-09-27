import app from './app';
import prisma from './lib/prisma';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Ensure DB is connected before starting server
prisma.$connect()
  .then(() => {
    console.log('Successfully connected to database');
    app.listen(PORT, () => {
      console.log(`API listening on port ${PORT}`);
      console.log('Environment:', process.env.NODE_ENV);
      console.log('Database URL:', process.env.DATABASE_URL?.slice(0, 20) + '...');
      console.log('Frontend Origin:', process.env.FRONTEND_ORIGIN);
    });
  })
  .catch((e) => {
    console.error('Failed to connect to database:', e);
    process.exit(1);
  });