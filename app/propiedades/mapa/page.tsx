import { getSubtiposPorTipoMercado, searchPropiedades } from '@/backend/services/property.service';
import { getLocalidadesActivasPorTipo } from '@/backend/services/zone.service';
import MapaResultsView from '@/features/mapa/components/mapa-results-view';

interface MapaPageProps {
  params: Promise<{
    mercado: string; // 'industrial' | 'comercial' | 'residencial'
  }>;
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

  // Mapeamos los parametros de la URL hacia la interfaz SearchFilters
  const subtiposSlugs = Array.isArray(search.subtipo)
    ? search.subtipo
    : search.subtipo ? [search.subtipo] : undefined;

  const localidades = Array.isArray(search.localidad)
    ? search.localidad.map(Number)
    : search.localidad ? [Number(search.localidad)] : undefined;

  // Buscamos las propiedades segun search
  const [propiedadesRaw, todasLocalidades, todosSubtipos] = await Promise.all([
    searchPropiedades({
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
    }),
    getLocalidadesActivasPorTipo(mercadoActual),
    getSubtiposPorTipoMercado(mercadoActual),
  ]);

  // Coordenadas iniciales para el re-centrado desde la Ficha de Detalle
  const centroInicial: [number, number] | undefined = (search.lat && search.lng)
    ? [Number(search.lat), Number(search.lng)]
    : undefined;

  const zoomInicial = search.zoom ? Number(search.zoom) : 11;

  // 4. Mapeamos las propiedades que tienen ubicación
  const propiedadesConUbicacion = propiedadesRaw
    .filter((p: any) => {
      const lat = Number(p.latitud);
      const lng = Number(p.longitud);
      // Solo permitimos propiedades con latitud y longitud válidas y distintas de 0
      return p.latitud !== null && p.longitud !== null && !isNaN(lat) && !isNaN(lng) && lat !== 0;
    })
    .map((p: any) => ({
      id: p.id,
      codigo: p.codigo,
      slug: p.slug,
      titulo: p.titulo,
      precio: Number(p.precio),
      superficieTotal: p.superficieTotal ? Number(p.superficieTotal) : null,
      superficieCubierta: p.superficieCubierta ? Number(p.superficieCubierta) : null,
      moneda: p.moneda,
      latitud: Number(p.latitud),
      longitud: Number(p.longitud),
      imagenPortada: p.imagenes?.[0]?.url || '/images/placeholder.png',
      zonaNombre: p.zona?.nombre || 'Zona no especificada',
    }));

  return (
    <MapaResultsView
      propiedades={propiedadesConUbicacion}
      localidades={todasLocalidades}
      subtipos={todosSubtipos}
      centroInicial={centroInicial}
      zoomInicial={zoomInicial}
    />
  );
}
