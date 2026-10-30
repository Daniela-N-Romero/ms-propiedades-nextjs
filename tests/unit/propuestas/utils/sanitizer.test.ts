import { describe, it, expect } from 'vitest';
import { serializarPrisma } from '@/lib/sanitizers';

describe('🧼 Lib: serializarPrisma', () => {
  it('debe convertir recursivamente Decimals y Dates a primitivos de JS', () => {

    // Simulamos un objeto retornado por Prisma con método Decimal.toNumber()
    const rawPrismaData = {
      id: 1,
      precio: { toNumber: () => 125000.50 },
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      relacionAnidada: {
        superficie: { toNumber: () => 450.75 },
      },
      arrayItems: [
        { costo: { toNumber: () => 350 } }
      ]
    };

    const resultado = serializarPrisma(rawPrismaData);

    expect(resultado.precio).toBe(125000.50);
    expect(resultado.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(resultado.relacionAnidada.superficie).toBe(450.75);
    expect(resultado.arrayItems[0].costo).toBe(350);
  });
});