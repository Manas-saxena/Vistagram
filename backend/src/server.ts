import app from './app';
import prisma from './lib/prisma';

// Railway expects 8080
const PORT = 8080;

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Track server state
let isStarting = false;
let server: any = null;

async function startServer() {
  if (isStarting || server) {
    console.log('Server already starting/started');
    return;
  }
  
  isStarting = true;
  try {
    await prisma.$connect();
    console.log('Successfully connected to database');
    
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`API listening on port ${PORT}`);
      console.log('Environment:', process.env.NODE_ENV);
      console.log('Database URL:', process.env.DATABASE_URL?.slice(0, 20) + '...');
      console.log('Frontend Origin:', process.env.FRONTEND_ORIGIN);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down...');
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    });
  } catch (e) {
    console.error('Failed to start server:', e);
    process.exit(1);
  }
}

startServer();