'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export function usePropertyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Capturamos el estado de transición del servidor
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
    zona: searchParams.get('zona') || '',
    // Excluimos 'ordenar' y 'page' del conteo de filtros activos
    totalActivos: Object.keys(Object.fromEntries(searchParams.entries())).filter(
      k => k !== 'ordenar' && k !== 'page'
    ).length
  };

  // Helper centralizado con startTransition y scroll: false
  const navigateWithFilters = (params: URLSearchParams) => {
    params.delete('page'); // Resetea la paginación al cambiar filtros
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

// 3. Toggle de un elemento individual en array (Corregido y Atómico)
  const toggleArrayFilter = (key: string, id: string, isChecked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.getAll(key);

    let updatedValues: string[];
    if (isChecked) {
      updatedValues = Array.from(new Set([...currentValues, id]));
    } else {
      updatedValues = currentValues.filter(v => v !== id);
    }

    // Reemplazamos atómicamente todos los valores de esa clave
    params.delete(key);
    updatedValues.forEach(val => params.append(key, val));

    navigateWithFilters(params);
  };

  // 4. Set masivo de un array (Para marcar/desmarcar partidos completos)
  const setArrayFilter = (key: string, idsToToggle: string[], isChecked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.getAll(key);

    let updatedValues: string[];
    if (isChecked) {
      updatedValues = Array.from(new Set([...currentValues, ...idsToToggle]));
    } else {
      updatedValues = currentValues.filter(v => !idsToToggle.includes(v));
    }

    // Reemplazamos atómicamente todos los valores
    params.delete(key);
    updatedValues.forEach(val => params.append(key, val));

    navigateWithFilters(params);
  };

  const clearZonaAndLocalidades = () => {
  const params = new URLSearchParams(searchParams.toString());
  params.delete('zona');
  params.delete('localidad');
  params.delete('partido');
  navigateWithFilters(params);
};

  // 5. Limpiar todos los filtros
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
    setArrayFilter,
    clearZonaAndLocalidades,
    clearAllFilters
  };
}