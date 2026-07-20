'use client';

import { useState, useEffect } from 'react';
import SearchView from './search-view';
import { Zona } from  '@prisma-client'


export default function HomeSearch({ zonasDB }: { zonasDB: Zona[] }) {
  const zonasPadre = zonasDB.filter(z => z.padreId === null);
  
  const [zonaSelected, setZonaSelected] = useState<string>('');
  const [localidadesFiltradas, setLocalidadesFiltradas] = useState<Zona[]>([]);
  const [localidadSelected, setLocalidadSelected] = useState<string>('');

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

  return (
    <SearchView 
      zonasPadre={zonasPadre}
      localidadesFiltradas={localidadesFiltradas}
      zonaSelected={zonaSelected}
      localidadSelected={localidadSelected}
      onZonaChange={setZonaSelected}
      onLocalidadChange={setLocalidadSelected}
    />
  );
}