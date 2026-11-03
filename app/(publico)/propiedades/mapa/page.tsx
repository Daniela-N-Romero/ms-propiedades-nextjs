import { getSubtiposPorTipoMercado, searchPropiedades } from '@/backend/services/property.service';
import { getZonasJerarquicasActivas } from '@/backend/services/zone.service';
import { MapaResultsView, toPropiedadesMapa } from '@/features/mapa';
import type { SubtipoOption } from '@/features/filtrado';

interface MapaPageProps {
  searchParams: Promise<{
    mercado?: string;
    categoria?: string;
    subtipo?: string | string[];
    localidad?: string | string[];
    moneda?: string;
    precioMin?: string;
    precioMax?: string;
    supMin?: string;
    supMax?: string;
    supCubMin?: string;
    supCubMax?: string;
    lat?: string;
    lng?: string;
    zoom?: string;
  }>;
}

export default async function MapaPage({ searchParams }: MapaPageProps) {
  const search = await searchParams;
  const mercadoActual = search.mercado;

  const subtiposSlugs = Array.isArray(search.subtipo)
    ? search.subtipo
    : search.subtipo ? [search.subtipo] : undefined;

  const localidades = Array.isArray(search.localidad)
    ? search.localidad.map(Number)
    : search.localidad ? [Number(search.localidad)] : undefined;

  const [searchResults, zonasData, subtiposRaw] = await Promise.all([
    searchPropiedades(
      {
        categoria: search.categoria,
        mercadoSlug: mercadoActual,
        subtiposSlugs,
        moneda: search.moneda,
        precioMin: search.precioMin ? Number(search.precioMin) : undefined,
        precioMax: search.precioMax ? Number(search.precioMax) : undefined,
        supMin: search.supMin ? Number(search.supMin) : undefined,
        supMax: search.supMax ? Number(search.supMax) : undefined,
        supCubMin: search.supCubMin ? Number(search.supCubMin) : undefined,
        supCubMax: search.supCubMax ? Number(search.supCubMax) : undefined,
        localidades,
      },
      true, // isPublishedOnly
      true, // isNotUnlisted
      'map'
    ),
    getZonasJerarquicasActivas(mercadoActual),
    getSubtiposPorTipoMercado(mercadoActual),
  ]);

  const centroInicial: [number, number] | undefined =
    search.lat && search.lng
      ? [Number(search.lat), Number(search.lng)]
      : undefined;

  const zoomInicial = search.zoom ? Number(search.zoom) : 11;

  const propiedades = toPropiedadesMapa(searchResults.propiedades, false);

  const subtipos: SubtipoOption[] = subtiposRaw.map((st: any) => ({
    id: st.id,
    slug: st.slug,
    nombre: st.nombre,
  }));

  return (
    <MapaResultsView
      propiedades={propiedades}
      zonasPadre={zonasData.zonasPadre}
      partidos={zonasData.partidos}
      subtipos={subtipos}
      centroInicial={centroInicial}
      zoomInicial={zoomInicial}
    />
  );
}