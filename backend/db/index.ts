import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma-client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    // LIMITAMOS LAS CONEXIONES POR LAMBDA A 1 O 2 MAXIMO:
    max: process.env.NODE_ENV === 'production' ? 1 : 10,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000,
  });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter: adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  }); 
};

// 1. Reusamos la instancia si ya existe en memoria global, o creamos una nueva
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// 2. Guardamos la instancia en globalThis (para Dev y para Producción)
globalForPrisma.prisma = prisma;