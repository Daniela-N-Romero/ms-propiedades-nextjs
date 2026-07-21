'use client';
import { useHomeSearch } from '../hooks/use-home-search'
import SearchView from './search-view';
import type { TipoInmueble, Zona } from  '@prisma-client'


export default function HomeSearch({ zonasDB, subtipos }: { zonasDB: Zona[], subtipos: TipoInmueble[] }) {

const searchProps = useHomeSearch(zonasDB);

  return (
    <SearchView 
      zonasPadre={searchProps.zonasPadre}
      localidadesFiltradas={searchProps.localidadesFiltradas}
      zonaSelected={searchProps.zonaSelected}
      localidadSelected={searchProps.localidadSelected}
      categoriaSelected={searchProps.categoriaSelected}
      subtipoSelected={searchProps.subtipoSelected}
      onZonaChange={searchProps.setZonaSelected}
      onLocalidadChange={searchProps.setLocalidadSelected}
      onCategoriaChange={searchProps.setCategoriaSelected}
      onSubtipoChange={searchProps.setSubtipoSelected}
      onSubmit={searchProps.handleSubmit}
      subtipos={subtipos}
    />
  );
}