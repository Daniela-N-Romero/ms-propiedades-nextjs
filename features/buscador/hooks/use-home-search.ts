'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Zona } from '@prisma-client';

export function useHomeSearch(zonasDB: Zona[]) {
  const router = useRouter();
  const zonasPadre = zonasDB.filter(z => z.padreId === null);

  const [zonaSelected, setZonaSelected] = useState<string>('');
  const [localidadesFiltradas, setLocalidadesFiltradas] = useState<Zona[]>([]);
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

    // 🔒 Forzamos siempre minúsculas para coincidir con TipoOperacionEnum
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

    router.push(`/propiedades/industrial?${params.toString()}`);
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