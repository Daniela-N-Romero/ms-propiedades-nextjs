import { describe, it, vi, expect, beforeEach } from 'vitest';
import { saveColegaAction } from '@/actions/colegas-actions';
import { savePropietarioAction } from '@/actions/propietarios-actions';
import { saveZonaAction } from '@/actions/zonas-actions';

// SILENCIAR REVALIDATEPATH DE NEXT.JS DENTRO DE LOS TESTS
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));


describe('Pruebas de Server Actions de Catálogos de Creación en Modals de Formulario de Propiedades', () => {
  
    // SILENCIAR CONSOLE.ERROR Y CONSOLE.LOG TEMPORALMENTE DURANTE LOS TESTS
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });


  // 1. COLEGA: Validación de Inmobiliaria
  it('saveColegaAction debe rechazar la creación si falta la inmobiliaria', async () => {
    const res = await saveColegaAction({
      nombre: 'Carlos',
      apellido: 'Pérez',
      inmobiliaria: '', // Campo obligatorio en blanco
    });

    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  // 2. PROPIETARIO: Validación de Nombre
  it('savePropietarioAction debe rechazar si el nombre está vacío', async () => {
    const res = await savePropietarioAction({
      nombre: '',
      apellido: 'Gómez',
    });

    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  // 3. ZONA: Validación de Nombre
  it('saveZonaAction debe rechazar si el nombre de ubicación está vacío', async () => {
    const res = await saveZonaAction({
      nombre: '  ',
    });

    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});