/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFilterDraft } from '@/features/filtrado/hooks/use-filter-draft';

const pushMock = vi.fn();
let currentSearchParamsMock = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/propiedades',
  useSearchParams: () => currentSearchParamsMock, // Lee la variable viva
}));

describe('useFilterDraft', () => {
  beforeEach(() => {
    pushMock.mockClear();
    currentSearchParamsMock = new URLSearchParams();
  });

  it('debe permitir cambiar de mercado y resetear subtipos concurrentemente', () => {
    const { result } = renderHook(() => useFilterDraft());

    act(() => {
      result.current.updateDraft({
        mercado: 'industrial',
        subtipo: ['nave-industrial'],
      });
    });

    expect(result.current.draftFilters.mercado).toBe('industrial');
    expect(result.current.draftFilters.subtipo).toEqual(['nave-industrial']);

    // Simula el click en "Residencial" que limpia subtipos
    act(() => {
      result.current.updateDraft({
        mercado: 'residencial',
        subtipo: [],
      });
    });

    expect(result.current.draftFilters.mercado).toBe('residencial');
    expect(result.current.draftFilters.subtipo).toEqual([]);
  });

  it('debe aplicar filtros navegando con la URL formateada correctamente con "?"', () => {
    const { result } = renderHook(() => useFilterDraft());

    act(() => {
      result.current.updateDraft({ mercado: 'industrial' });
    });

    act(() => {
      result.current.applyFilters();
    });

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith('/propiedades?mercado=industrial');
  });

  it('debe conservar el mercado seleccionado al llamar a resetDraft', () => {
    const { result } = renderHook(() => useFilterDraft());

    act(() => {
      result.current.updateDraft({
        mercado: 'comercial',
        categoria: 'alquiler',
        precioMin: 100000,
        subtipo: ['local-comercial'],
      });
    });

    expect(result.current.draftFilters.mercado).toBe('comercial');
    expect(result.current.activeCount).toBeGreaterThan(1);

    act(() => {
      result.current.resetDraft();
    });

    expect(result.current.draftFilters.mercado).toBe('comercial');
    expect(result.current.draftFilters.categoria).toBeUndefined();
    expect(result.current.draftFilters.precioMin).toBeUndefined();
    expect(result.current.draftFilters.subtipo).toBeUndefined();
  });

  it('debe sincronizar draftFilters cuando searchParams cambia externamente', () => {
    currentSearchParamsMock = new URLSearchParams('mercado=industrial');

    const { result, rerender } = renderHook(() => useFilterDraft());

    expect(result.current.draftFilters.mercado).toBe('industrial');

    // Cambiamos el mock y forzamos re-render
    currentSearchParamsMock = new URLSearchParams('mercado=comercial');
    rerender();

    expect(result.current.draftFilters.mercado).toBe('comercial');
  });
});