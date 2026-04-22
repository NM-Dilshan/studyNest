
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
  prismaPool: Pool | undefined;
  prismaAdapter: PrismaPg | undefined;
};

let prisma: PrismaClient;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const defaultPoolMax = process.env.NODE_ENV === 'production' ? '5' : '2';
const poolMax = Number.parseInt(process.env.DATABASE_POOL_MAX || defaultPoolMax, 10);

const createPool = () =>
  new Pool({
    connectionString,
    max: Number.isNaN(poolMax) ? 5 : poolMax,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    allowExitOnIdle: true,
  });

if (process.env.NODE_ENV === 'production') {
  const pool = createPool();
  const adapter = new PrismaPg(pool);

  prisma = new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });
} else {
  if (!globalForPrisma.prismaPool) {
    globalForPrisma.prismaPool = createPool();
  }

  if (!globalForPrisma.prismaAdapter) {
    globalForPrisma.prismaAdapter = new PrismaPg(globalForPrisma.prismaPool);
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      adapter: globalForPrisma.prismaAdapter,
      log: ['error'],
    });
  }

  prisma = globalForPrisma.prisma;
}

export { prisma };
