import { describe, it, expect, vi } from 'vitest';
import { savePropertyAction } from '@/actions/propiedades-actions';
import { prisma } from '@/backend/db';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock('@/backend/db', () => ({
  prisma: {
    propiedad: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    zona: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, nombre: 'Berazategui' }),
    },
    tipoInmueble: {
      findUnique: vi.fn().mockResolvedValue({ id: 2, slug: 'nave-industrial' }),
    },
    $transaction: vi.fn((cb) => cb(prisma)),
  },
}));

describe('⚡ Actions: savePropertyAction', () => {
  it('debe persistir los campos esPreventa y fechaEstimadaEntrega al crear una propiedad', async () => {

    const fechaSimulada = '2027-06-30';
    const mockFormData: any = {
      titulo: 'Loteo en Preventa Polo Hudson',
      slug: 'loteo-preventa-hudson',
      precio: 120000,
      zonaId: 1,
      tipoInmuebleId: 2,
      agenteId: 1,
      esPreventa: true,
      fechaEstimadaEntrega: fechaSimulada,
      isPublished: true,
    };

    vi.spyOn(prisma.propiedad, 'create').mockResolvedValue({
      id: 50,
      ...mockFormData,
      fechaEstimadaEntrega: new Date(fechaSimulada),
    } as any);

    const resultado = await savePropertyAction(mockFormData);

    expect(resultado.success).toBe(true);
    expect(prisma.propiedad.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          esPreventa: true,
          fechaEstimadaEntrega: new Date(fechaSimulada),
        }),
      })
    );
  });
});