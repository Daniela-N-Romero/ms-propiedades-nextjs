// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useItemsPropuesta } from '@/features/propuestas/hooks/use-items-propuesta';

describe('🎣 Hook: useItemsPropuesta', () => {
  it('debe inicializar la lista de ítems correctamente', () => {
    
    const initialItems = [
      { propiedadId: 1, esPrioritaria: true, nombre: 'Parque Industrial Hudson' }
    ];

    const { result } = renderHook(() =>
      useItemsPropuesta(initialItems, [], [], true, 350, 400)
    );

    expect(result.current.itemsSeleccionados).toHaveLength(1);
    expect(result.current.itemsSeleccionados[0].nombre).toBe('Parque Industrial Hudson');
    
  });

  it('debe agregar y quitar propiedades mediante togglePropiedad', () => {

    const mockPropiedad: any = {
      id: 10,
      titulo: 'Terreno Industrial 5000m2',
      precio: 200000,
      superficieTotal: 5000,
      financiacion: '30% anticipo y 24 cuotas',
    };

    const { result } = renderHook(() =>
      useItemsPropuesta([], [], [], true, 350, 400)
    );

    // 1. Agregar propiedad
    act(() => {
      result.current.togglePropiedad(mockPropiedad);
    });

    expect(result.current.itemsSeleccionados).toHaveLength(1);
    expect(result.current.itemsSeleccionados[0].propiedadId).toBe(10);
    expect(result.current.itemsSeleccionados[0].supNaveProyectada).toBe(3000); // FOS 0.6 sobre 5000m2

    // 2. Quitar propiedad (Toggle de nuevo)
    act(() => {
      result.current.togglePropiedad(mockPropiedad);
    });

    expect(result.current.itemsSeleccionados).toHaveLength(0);

  });

  it('debe calcular correctamente las métricas individuales de un ítem', () => {

    const { result } = renderHook(() =>
      useItemsPropuesta([], [], [], true, 350, 400)
    );

    const mockItem: any = {
      propiedadId: 1,
      costoTierraCustom: 100000,
      supNaveProyectada: 1000,
      alquilerM2Estimado: 5.0,
      fosAplicado: 0.6,
    };

    const metricas = result.current.calcularMetricasItem(mockItem);

    // Obra: 1000m2 * USD 350 = 350.000 | Inversión Total: 100.000 + 350.000 = 450.000
    // Ingreso Anual: 1000 * 5 * 12 = 60.000 | ROI: (60.000 / 450.000) * 100 = 13.33%
    expect(metricas.costoObraTotal).toBe(350000);
    expect(metricas.inversionTotal).toBe(450000);
    expect(metricas.ingresoAnualUSD).toBe(60000);
    expect(metricas.roiAnual).toBe(13.33);

  });

 it('debe re-sincronizar automáticamente el nombre del parque cuando se cargan las BBDD', () => {

    // Aseguramos que el ítem tenga tanto id como propiedadId por compatibilidad
    const initialItems: any[] = [
      { id: 10, propiedadId: 10, nombre: '', notaLogistica: '' }
    ];

    const parqueMock = {
      id: 99,
      nombre: 'Parque Industrial Pilar',
      conectividad: 'Ruta 8'
    };

    // Le damos a la propiedad tanto el ID foráneo como el objeto anidado por si el hook lee uno u otro
    const propiedadesBD: any[] = [
      {
        id: 10,
        titulo: 'Lote 10',
        parqueIndustrialId: 99,
        parqueIndustrial: parqueMock,
        esPreventa: false,
      }
    ];

    const parquesBD: any[] = [parqueMock];

    const { result } = renderHook(() =>
      useItemsPropuesta(initialItems, propiedadesBD, parquesBD, true, 350, 400)
    );

    expect(result.current.itemsSeleccionados[0].nombre).toBe('Parque Industrial Pilar');
    expect(result.current.itemsSeleccionados[0].notaLogistica).toBe('Ruta 8');

  });
});