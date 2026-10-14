import { describe, it, vi, expect, beforeEach } from 'vitest';
import { savePropertyAction } from '@/actions/propiedades-actions';
import { draftPropertySchema } from '@/features/admin/form/schemas/property-schema';

vi.mock('@/backend/db', () => ({
  prisma: {
    zona: {
      findUnique: vi.fn().mockResolvedValue({ id: 3, nombre: 'Zona Test' }),
    },
    agente: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, nombre: 'Agente Test' }),
    },
    tipoInmueble: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, nombre: 'Galpón' }),
    },
    propiedad: {
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn().mockResolvedValue(null), // 👈 Agregar esta línea
      create: vi.fn().mockResolvedValue({
        id: 1,
        titulo: 'Propiedad Test',
        code: 'IND-TEST-123',
      }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
  },
}));
// 1. SILENCIAR REVALIDATEPATH DE NEXT.JS DENTRO DE LOS TESTS
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Pruebas de Server Action: savePropertyAction', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  // 1. VERIFICAR QUE RECHAZA PROPIEDADES PUBLICADAS SIN PRECIO VÁLIDO
  it('Debe rechazar la publicación si faltan campos obligatorios como el precio', async () => {
    const res = await savePropertyAction({
      titulo: 'Nave Industrial Test',
      categoria: 'venta',
      origen: 'own',
      precio: 0, // Precio inválido (<= 0)
      moneda: 'USD',
      zonaId: 3,
      agenteId: 1,
      superficieTotal: 1000,
      superficieCubierta: 800,
      tipoInmuebleId: 1,
      descripcion: 'Descripción de prueba para publicar la propiedad.',
      isMapConfirmed: true,
      isPublished: true, // Intenta publicar sin precio
      latitud: -34.78,
      longitud: -58.28,
      imagenes: ['/images/placeholder.png'],
    } as any);

    expect(res.success).toBe(false);
  });

  // 2. VERIFICAR QUE RECHAZA BORRADORES CON TÍTULO CORTO
    it('Debe rechazar un borrador si el título es demasiado corto según Zod', () => {
      const datosInvalidos = {
        titulo: 'A', // Título < 3 caracteres
        tipoInmuebleId: 1,
        agenteId: 1,
        zonaId: 1,
      };

      const result = draftPropertySchema.safeParse(datosInvalidos);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Escriba un título de al menos 3 caracteres');
      }
    });
});