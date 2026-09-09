'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export function usePropertyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 🔑 Capturamos el estado de transición del servidor
  const [isPending, startTransition] = useTransition();

  // 1. Obtener estados actuales de la URL 
  const filters = {
    categoria: searchParams.get('categoria') || '',
    mercado: searchParams.get('mercado') || '',
    tipo: searchParams.get('tipo') || '',
    subtipos: searchParams.getAll('subtipo'),
    moneda: searchParams.get('moneda') || 'USD',
    precioMin: searchParams.get('precioMin') || '',
    precioMax: searchParams.get('precioMax') || '',
    supMin: searchParams.get('supMin') || '',
    supMax: searchParams.get('supMax') || '',
    supCubMin: searchParams.get('supCubMin') || '', 
    supCubMax: searchParams.get('supCubMax') || '',
    localidades: searchParams.getAll('localidad'),
    ordenar: searchParams.get('ordenar') || '',
    totalActivos: Object.keys(Object.fromEntries(searchParams.entries())).filter(k => k !== 'ordenar').length
  };

  // Helper centralizado con startTransition y scroll: false
  const navigateWithFilters = (params: URLSearchParams) => {
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // 2. Función para actualizar un filtro individual
  const setFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === 'moneda') {
      params.delete('precioMin');
      params.delete('precioMax');
    }
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    navigateWithFilters(params);
  };

  // 3. Función para filtros múltiples (Checkboxes)
  const toggleArrayFilter = (key: string, id: string, isChecked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.getAll(key);
    
    if (isChecked) {
      params.append(key, id);
    } else {
      params.delete(key);
      currentValues.filter(v => v !== id).forEach(v => params.append(key, v));
    }
    navigateWithFilters(params);
  };

  // 4. Limpiar todos los filtros
  const clearAllFilters = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  return {
    filters,
    isPending,
    setFilter,
    toggleArrayFilter,
    clearAllFilters
  };
}