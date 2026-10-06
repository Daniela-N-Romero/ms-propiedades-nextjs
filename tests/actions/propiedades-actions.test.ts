import { describe, it, vi, expect, beforeEach } from 'vitest';
import { savePropertyAction } from '@/actions/propiedades-actions';

// 1. SILENCIAR REVALIDATEPATH DE NEXT.JS DENTRO DE LOS TESTS
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Pruebas de Server Action: savePropertyAction', () => {

    // 2. SILENCIAR CONSOLE.ERROR Y CONSOLE.LOG TEMPORALMENTE DURANTE LOS TESTS
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  // 1. VERIFICAR QUE RECHAZA PROPIEDADES PUBLICADAS SIN TÍTULO O PRECIO VÁLIDO
  it('Debe rechazar la publicación si faltan campos obligatorios como el precio', async () => {
    const res = await savePropertyAction({
      titulo: 'Nave Industrial Test',
      categoria: 'venta',
      origen: 'own',
      precio: 0, // Precio inválido
      moneda: 'USD',
      zonaId: 1,
      superficieTotal: 1000,
      superficieCubierta: 800,
      tipoInmuebleId: 1,
      agenteId: 1,
      descripcion: 'Descripción de prueba para publicar la propiedad.',
      isMapConfirmed: true,
      isPublished: true, // Intenta publicar
      latitud: -34.78,
      longitud: -58.28,
      imagenes: ['/images/placeholder.png'],
    } as any);

    expect(res.success).toBe(false);
  });

  // 2. VERIFICAR QUE RECHAZA BORRADORES SIN TÍTULO
  it('Debe rechazar un borrador si el título es demasiado corto', async () => {
    const res = await savePropertyAction({
      titulo: 'A', // Título inválido (< 3 caracteres)
      isPublished: false,
    } as any);

    expect(res.success).toBe(false);
  });
});