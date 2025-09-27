import { PrismaClient } from '@prisma/client';

// Ensure single Prisma instance
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Keep connection alive
setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    console.error('Prisma keep-alive failed:', e);
    // Try to reconnect
    try {
      await prisma.$disconnect();
      await prisma.$connect();
      console.log('Prisma reconnected successfully');
    } catch (e) {
      console.error('Prisma reconnection failed:', e);
    }
  }
}, 30000); // Every 30 seconds

export default prisma;