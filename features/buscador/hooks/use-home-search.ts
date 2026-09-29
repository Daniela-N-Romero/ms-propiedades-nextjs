//features\buscador\hooks\use-home-search.ts
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ZonaServer } from '@/types/server-data';
import { trackHomeSearch } from '@/lib/analytics';

export function useHomeSearch(zonasDB: ZonaServer[] = []) {
  const router = useRouter();

  // 1. Memoizamos las zonas padre usando comprobación laxo (!z.padreId)
  const zonasPadre = useMemo(() => {
    return (zonasDB || []).filter(z => !z.padreId);
  }, [zonasDB]);

  const [zonaSelected, setZonaSelected] = useState<string>('');
  const [partidosFiltrados, setPartidosFiltrados] = useState<ZonaServer[]>([]);
  const [partidosSelected, setPartidosSelected] = useState<string[]>([]);
  const [categoriaSelected, setCategoriaSelected] = useState<string>('');
  const [subtipoSelected, setSubtipoSelected] = useState<string>('');

  // 2. Manejo de selección de zonas e hijas
  useEffect(() => {
    if (!zonaSelected) {
      setPartidosFiltrados([]);
      setPartidosSelected([]);
      return;
    }

    // Buscamos las hijas comparando Numbers
    const hijas = (zonasDB || []).filter(z => Number(z.padreId) === Number(zonaSelected));

    setPartidosFiltrados(hijas);
  }, [zonaSelected, zonasDB]);

  // Handler para cambiar de zona (limpia la localidad en el evento de usuario)
  const handleZonaChange = (id: string) => {
    setZonaSelected(id);
    setPartidosSelected([]);
  };

  // 3. Manejo de submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (categoriaSelected) {
      params.set('categoria', categoriaSelected.toLowerCase());
    }

    if (subtipoSelected) {
      params.set('subtipo', subtipoSelected);
    }

    //Enviamos el indicador de Zona si existe
    if (zonaSelected) {
      params.set('zona', zonaSelected);
    }

    //Traducimos los partidos seleccionados a los IDs de sus Localidades Hijas
    if (partidosSelected.length > 0) {
      const localidadesHijasIds = zonasDB
        .filter(z => partidosSelected.includes(String(z.padreId))) // Encuentra las localidades cuyo padreId es un Partido seleccionado
        .map(z => z.id);

      if (localidadesHijasIds.length > 0) {
      // Enviamos cada localidad como parámetro repetido o por coma
      localidadesHijasIds.forEach(id => params.append('localidad', String(id)));
      }
    }

    router.push(`/propiedades?${params.toString()}`);

    trackHomeSearch({
      categoria: categoriaSelected,
      subtipo: subtipoSelected,
      zonaLabel: zonaSelected,
      localidadLabel: partidosSelected.join(',')
    });

    router.push(`/propiedades?mercado=industrial&${params.toString()}`);
  };

  return {
    zonasPadre,
    partidosFiltrados,
    zonaSelected,
    partidosSelected,
    categoriaSelected,
    subtipoSelected,
    setZonaSelected: handleZonaChange, // Usamos la función envuelta
    setPartidosSelected,
    setCategoriaSelected,
    setSubtipoSelected,
    handleSubmit
  };
}