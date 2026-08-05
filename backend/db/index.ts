import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma-client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    // LIMITAMOS LAS CONEXIONES POR LAMBDA A 1 O 2 MAXIMO:
    max: process.env.NODE_ENV === 'production' ? 2 : 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter: adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  }); 
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
// De acá en adelante, cualquier servicio que necesite la DB importa este "prisma"
