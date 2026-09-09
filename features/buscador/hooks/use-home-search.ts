//features\buscador\hooks\use-home-search.ts
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ZonaServer } from '@/types/server-data';
import { trackHomeSearch } from '@/lib/analytics';

export function useHomeSearch(zonasDB: ZonaServer[] = []) {
  const router = useRouter();

  console.log("Zonas que llegaron al cliente desde DB:", zonasDB);
  // 1. Memoizamos las zonas padre usando comprobación laxo (!z.padreId)
  const zonasPadre = useMemo(() => {
    return (zonasDB || []).filter(z => !z.padreId);
  }, [zonasDB]);
  console.log("Zonas Padre filtradas:", zonasPadre);

  const [zonaSelected, setZonaSelected] = useState<string>('');
  const [localidadesFiltradas, setLocalidadesFiltradas] = useState<ZonaServer[]>([]);
  const [localidadSelected, setLocalidadSelected] = useState<string>('');
  const [categoriaSelected, setCategoriaSelected] = useState<string>('');
  const [subtipoSelected, setSubtipoSelected] = useState<string>('');

  // 2. Manejo de selección de zonas e hijas
  useEffect(() => {
    if (!zonaSelected) {
      setLocalidadesFiltradas([]);
      setLocalidadSelected('');
      return;
    }

    // Buscamos las hijas comparando Numbers
    const hijas = (zonasDB || []).filter(z => Number(z.padreId) === Number(zonaSelected));
    
    setLocalidadesFiltradas(hijas);
  }, [zonaSelected, zonasDB]);

  // Handler para cambiar de zona (limpia la localidad en el evento de usuario)
  const handleZonaChange = (id: string) => {
    setZonaSelected(id);
    setLocalidadSelected('');
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

    if (localidadSelected) {
      params.set('localidad', localidadSelected);
    } else if (zonaSelected) {
      localidadesFiltradas.forEach(loc => params.append('localidad', String(loc.id)));
    }

    trackHomeSearch({
      categoria: categoriaSelected,
      subtipo: subtipoSelected,
      zonaLabel: zonaSelected,
      localidadLabel: localidadSelected
    });

    router.push(`/propiedades?mercado=industrial&${params.toString()}`);
  };

  return {
    zonasPadre,
    localidadesFiltradas,
    zonaSelected,
    localidadSelected,
    categoriaSelected,
    subtipoSelected,
    setZonaSelected: handleZonaChange, // Usamos la función envuelta
    setLocalidadSelected,
    setCategoriaSelected,
    setSubtipoSelected,
    handleSubmit
  };
}