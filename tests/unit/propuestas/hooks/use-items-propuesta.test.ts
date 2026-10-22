// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useItemsPropuesta } from '@/features/propuestas/hooks/use-items-propuesta';

describe('🎣 Hook: useItemsPropuesta', () => {
  it('debe inicializar la lista de ítems correctamente', () => {
    console.log('  🔍 Evaluando: Carga inicial de ítems guardados desde la BBDD...');
    
    const initialItems = [
      { propiedadId: 1, esPrioritaria: true, nombre: 'Parque Industrial Hudson' }
    ];

    const { result } = renderHook(() =>
      useItemsPropuesta(initialItems, [], [], true, 350, 400)
    );

    expect(result.current.itemsSeleccionados).toHaveLength(1);
    expect(result.current.itemsSeleccionados[0].nombre).toBe('Parque Industrial Hudson');
    
    console.log('  ✅ Éxito: Los ítems iniciales se mapean e inicializan correctamente.');
  });

  it('debe agregar y quitar propiedades mediante togglePropiedad', () => {
    console.log('  🔍 Evaluando: Interacción del usuario al seleccionar y deseleccionar un lote del catálogo...');

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

    console.log('  ✅ Éxito: togglePropiedad agrega con cálculos automáticos (FOS/Nave) y remueve de forma limpia.');
  });

  it('debe calcular correctamente las métricas individuales de un ítem', () => {
    console.log('  🔍 Evaluando: Cálculo financiero dinámico de superficie de nave, inversión y ROI por ítem...');

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

    console.log('  ✅ Éxito: Las fórmulas matemáticas de proyección financiera responden con exactitud.');
  });

  it('debe re-sincronizar automáticamente el nombre del parque cuando se cargan las BBDD', () => {
    console.log('  🔍 Evaluando: Re-sincronización asíncrona de nombres de Parque Industrial...');

    const initialItems = [{ propiedadId: 10, nombre: '' }];
    const propiedadesBD: any[] = [{ id: 10, parqueIndustrialId: 99 }];
    const parquesBD: any[] = [{ id: 99, nombre: 'Parque Industrial Pilar', conectividad: 'Ruta 8' }];

    const { result } = renderHook(() =>
      useItemsPropuesta(initialItems, propiedadesBD, parquesBD, true, 350, 400)
    );

    expect(result.current.itemsSeleccionados[0].nombre).toBe('Parque Industrial Pilar');
    expect(result.current.itemsSeleccionados[0].notaLogistica).toBe('Ruta 8');

    console.log('  ✅ Éxito: Cruce asíncrono de ID de parque resolvió el nombre y accesos en las tarjetas.');
  });
});