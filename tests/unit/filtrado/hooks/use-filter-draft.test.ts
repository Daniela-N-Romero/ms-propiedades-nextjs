/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFilterDraft } from '@/features/filtrado/hooks/use-filter-draft';

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams('');

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/propiedades/industrial',
  useSearchParams: () => mockSearchParams,
}));

describe('useFilterDraft Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams('mercado=industrial');
  });

  it('inicia con los filtros parseados de la URL sin disparar router.push', () => {
    mockSearchParams = new URLSearchParams('mercado=industrial&categoria=alquiler&localidad=10');
    const { result } = renderHook(() => useFilterDraft());

    expect(result.current.draftFilters.categoria).toBe('alquiler');
    expect(result.current.draftFilters.localidad).toEqual([10]);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('alterna valores en arrays y actualiza activeCount en memoria', () => {
    const { result } = renderHook(() => useFilterDraft());

    act(() => {
      result.current.toggleArrayDraft('subtipo', 'nave-industrial');
      result.current.updateDraft({ supMin: 1500 });
    });

    expect(result.current.draftFilters.subtipo).toEqual(['nave-industrial']);
    expect(result.current.draftFilters.supMin).toBe(1500);
    expect(result.current.activeCount).toBe(2);
    expect(mockPush).not.toHaveBeenCalled();

    // Desmarcar subtipo
    act(() => {
      result.current.toggleArrayDraft('subtipo', 'nave-industrial');
    });

    expect(result.current.draftFilters.subtipo).toEqual([]);
    expect(result.current.activeCount).toBe(1);
  });

  it('agrega o remueve múltiples localidades de un partido de una sola vez', () => {
    const { result } = renderHook(() => useFilterDraft());

    act(() => {
      result.current.setMultipleInArrayDraft('localidad', [101, 102, 103], true);
    });

    expect(result.current.draftFilters.localidad).toEqual([101, 102, 103]);

    act(() => {
      result.current.setMultipleInArrayDraft('localidad', [102], false);
    });

    expect(result.current.draftFilters.localidad).toEqual([101, 103]);
  });

  it('ejecuta 1 sola llamada a router.push al invocar applyFilters', () => {
    const { result } = renderHook(() => useFilterDraft());

    act(() => {
      result.current.updateDraft({ categoria: 'venta' });
      result.current.toggleArrayDraft('localidad', 25);
    });

    act(() => {
      result.current.applyFilters();
    });

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/propiedades/industrial?')
    );
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('categoria=venta'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('localidad=25'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('mercado=industrial'));
  });
});