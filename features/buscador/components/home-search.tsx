'use client';
import { ZonaServer } from '@/types/server-data';
import { useHomeSearch } from '../hooks/use-home-search'
import SearchView from './search-view';
import type { TipoInmueble } from  '@prisma-client'


export default function HomeSearch({ zonasDB, subtipos }: { zonasDB: ZonaServer[], subtipos: TipoInmueble[] }) {

const searchProps = useHomeSearch(zonasDB);

  return (
    <SearchView 
      zonasPadre={searchProps.zonasPadre}
      localidadesFiltradas={searchProps.partidosFiltrados}
      zonaSelected={searchProps.zonaSelected}
      partidosSelected={searchProps.partidosSelected}
      categoriaSelected={searchProps.categoriaSelected}
      subtipoSelected={searchProps.subtipoSelected}
      onZonaChange={searchProps.setZonaSelected}
      onPartidosChange={searchProps.setPartidosSelected}
      onCategoriaChange={searchProps.setCategoriaSelected}
      onSubtipoChange={searchProps.setSubtipoSelected}
      onSubmit={searchProps.handleSubmit}
      subtipos={subtipos}
    />
  );
}