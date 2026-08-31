'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ZonaServer } from '@/types/server-data';
import { trackHomeSearch } from '@/lib/analytics';

export function useHomeSearch(zonasDB: ZonaServer[]) {
  const router = useRouter();
  const zonasPadre = zonasDB.filter(z => z.padreId === null);

  const [zonaSelected, setZonaSelected] = useState<string>('');
  const [localidadesFiltradas, setLocalidadesFiltradas] = useState<ZonaServer[]>([]);
  const [localidadSelected, setLocalidadSelected] = useState<string>('');
  const [categoriaSelected, setCategoriaSelected] = useState<string>('');
  const [subtipoSelected, setSubtipoSelected] = useState<string>('');

  //Manejo de selección de zonas y localidades
  useEffect(() => {
    if (!zonaSelected) {
      setLocalidadesFiltradas([]);
      setLocalidadSelected('');
      return;
    }
    const hijas = zonasDB.filter(z => z.padreId === Number(zonaSelected));
    setLocalidadesFiltradas(hijas);
    setLocalidadSelected('');
  }, [zonaSelected, zonasDB]);

  //Manejo de submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    // Forzamos siempre minúsculas para coincidir con TipoOperacionEnum
    if (categoriaSelected) {
      params.set('categoria', categoriaSelected.toLowerCase());
    }

    if (subtipoSelected) {
      params.set('subtipo', subtipoSelected);
    }

    if (localidadSelected) {
      params.set('localidad', localidadSelected);
    } else if (zonaSelected) {
      // Si eligió una Zona Padre pero no especificó localidad, mandamos las hijas
      localidadesFiltradas.forEach(loc => params.append('localidad', String(loc.id)));
    }

    //  tracking de búsquedas
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
    setZonaSelected,
    setLocalidadSelected,
    setCategoriaSelected,
    setSubtipoSelected,
    handleSubmit
  };
}