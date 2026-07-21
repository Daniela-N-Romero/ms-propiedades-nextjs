'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function usePropertyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Obtener estados actuales de la URL 
  const filters = {
    categoria: searchParams.get('categoria') || '',
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
    // Cuántos filtros hay activos en total
    totalActivos: Object.keys(Object.fromEntries(searchParams.entries())).filter(k => k !== 'ordenar').length
  };

  // 2. Función para actualizar un filtro individual de valor único (radio, select, texto, rango)
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
    router.push(`${pathname}?${params.toString()}`);
  };

  // 3. Función específica para filtros múltiples (Checkboxes de Localidades)
  const toggleArrayFilter = (key: string, id: string, isChecked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.getAll(key);
    
    if (isChecked) {
      params.append(key, id);
    } else {
      params.delete(key);
      currentValues.filter(v => v !== id).forEach(v => params.append(key, v));
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // 4. Limpiar todos los filtros en un click si el usuario quiere reiniciar
  const clearAllFilters = () => {
    router.push(pathname);
  };

  return {
    filters,
    setFilter,
    toggleArrayFilter,
    clearAllFilters
  };
}
