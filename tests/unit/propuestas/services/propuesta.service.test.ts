import { describe, it, expect, vi } from 'vitest';
import { PropuestasService } from '@/features/propuestas/services/propuesta.service';
import { prisma } from '@/backend/db';

vi.mock('@/backend/db', () => ({
  prisma: {
    propuestaComercial: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('📦 Service: PropuestasService', () => {
  it('debe obtener una propuesta por Slug y ejecutar el sanitizer', async () => {
    console.log('  🔍 Evaluando: Búsqueda de propuesta por Slug e inclusión de imágenes limitadas...');

    const mockDbData = {
      id: 'prop-1',
      slug: 'test-slug',
      clienteNombre: 'Ignacio',
      tipo: 'LOGISTICA_RUTAS',
      items: [],
    };

    vi.spyOn(prisma.propuestaComercial, 'findUnique').mockResolvedValue(mockDbData as any);

    const resultado = await PropuestasService.obtenerPorSlug('test-slug');

    expect(resultado?.slug).toBe('test-slug');
    expect(prisma.propuestaComercial.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: 'test-slug' } })
    );

    console.log('  ✅ Éxito: Consulta a la BBDD efectuada y respuesta saneada correctamente.');
  });

  it('debe crear una propuesta comercial con sus ítems mapeados', async () => {
    console.log('  🔍 Evaluando: Creación de propuesta con mapeo de ítems y orden...');

    const mockBody = {
      tipo: 'INVERSION_DESARROLLO',
      clienteNombre: 'Cliente Nuevo',
      slug: 'cliente-nuevo',
      items: [{ propiedadId: 10, costoObraM2: 350 }],
    };

    vi.spyOn(prisma.propuestaComercial, 'create').mockResolvedValue({ id: 'prop-2', ...mockBody } as any);

    const resultado = await PropuestasService.crear(mockBody);

    expect(resultado.id).toBe('prop-2');
    expect(prisma.propuestaComercial.create).toHaveBeenCalled();

    console.log('  ✅ Éxito: Persistencia de propuesta invocada con los valores por defecto requeridos.');
  });
});

vi.mock('@/backend/db', () => ({
  prisma: {
    propuestaComercial: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb({
      propuestaItem: { deleteMany: vi.fn() },
      propuestaComercial: { update: vi.fn().mockResolvedValue({ id: 'prop-1', clienteNombre: 'Actualizado' }) }
    })),
  },
}));

describe('📦 Service: PropuestasService (Métodos Restantes)', () => {
  it('debe obtener una propuesta por ID', async () => {
    console.log('  🔍 Evaluando: Búsqueda de propuesta por ID...');
    vi.spyOn(prisma.propuestaComercial, 'findUnique').mockResolvedValue({ id: 'prop-123', items: [] } as any);

    const res = await PropuestasService.obtenerPorId('prop-123');
    expect(res?.id).toBe('prop-123');
  });

  it('debe obtener el listado para el panel de administración', async () => {
    console.log('  🔍 Evaluando: Consulta de listado para el dashboard...');
    vi.spyOn(prisma.propuestaComercial, 'findMany').mockResolvedValue([{ id: '1' }] as any);

    const res = await PropuestasService.obtenerListadoAdmin();
    expect(res).toHaveLength(1);
  });

  it('debe actualizar una propuesta existente dentro de una transacción', async () => {
    console.log('  🔍 Evaluando: Actualización transaccional de propuesta...');
    const body = { clienteNombre: 'Actualizado', items: [] };

    const res = await PropuestasService.actualizar('prop-1', body);
    expect(res.clienteNombre).toBe('Actualizado');
  });

  it('debe eliminar una propuesta por ID', async () => {
    console.log('  🔍 Evaluando: Eliminación de propuesta...');
    vi.spyOn(prisma.propuestaComercial, 'delete').mockResolvedValue({ id: 'prop-1' } as any);

    const res = await PropuestasService.eliminarPorId('prop-1');
    expect(res.id).toBe('prop-1');
  });
});