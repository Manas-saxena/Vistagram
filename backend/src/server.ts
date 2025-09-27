import app from './app';
import prisma from './lib/prisma';

const PORT = 8080;

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit on connection errors
  if (!error.message?.includes('connection')) {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason: any, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit on connection errors
  if (!reason?.message?.includes('connection')) {
    process.exit(1);
  }
});

// Track server state
let isStarting = false;
let server: any = null;

async function connectWithRetry(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting database connection (attempt ${i + 1}/${retries})...`);
      await prisma.$connect();
      console.log('Successfully connected to database');
      return true;
    } catch (e) {
      console.error(`Database connection attempt ${i + 1} failed:`, e);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  return false;
}

async function startServer() {
  if (isStarting || server) {
    console.log('Server already starting/started');
    return;
  }
  
  isStarting = true;
  try {
    console.log('Starting server initialization...');
    
    // Connect to database with retries
    const connected = await connectWithRetry();
    if (!connected) {
      console.error('Failed to connect to database after retries');
      process.exit(1);
    }
    
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log('='.repeat(40));
      console.log(`Server ready and listening on port ${PORT}`);
      console.log('Environment:', process.env.NODE_ENV);
      console.log('Database URL:', process.env.DATABASE_URL?.slice(0, 20) + '...');
      console.log('Frontend Origin:', process.env.FRONTEND_ORIGIN);
      console.log('='.repeat(40));
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

// Start with some delay to ensure container is ready
console.log('Waiting for container initialization...');
setTimeout(() => {
  console.log('Starting server...');
  startServer();
}, 2000);