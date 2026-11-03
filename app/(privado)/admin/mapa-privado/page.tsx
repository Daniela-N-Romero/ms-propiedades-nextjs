import { getColegas, getPropietarios } from '@/backend/services/admin-catalogos.service';
import { searchPropiedades, getSubtiposPorTipoMercado } from '@/backend/services/property.service';
import { getZonasJerarquicasActivas } from '@/backend/services/zone.service';
import { MapaAdminResultsView, toPropiedadesMapa } from '@/features/mapa';
import type { SubtipoOption } from '@/features/filtrado';
import type { ColegaMapaItem, PropietarioMapaItem } from '@/features/mapa';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface MapaPrivadoAdminProps {
  searchParams: Promise<{
    mercado?: string;
    categoria?: string;
    subtipo?: string | string[];
    localidad?: string | string[];
    moneda?: string;
    financiacion?: string;
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

export default async function MapaPrivadoAdminPage({ searchParams }: MapaPrivadoAdminProps) {
  const search = await searchParams;
  const mercadoActual = search.mercado;

  const subtiposSlugs = Array.isArray(search.subtipo)
    ? search.subtipo
    : search.subtipo ? [search.subtipo] : undefined;

  const localidades = Array.isArray(search.localidad)
    ? search.localidad.map(Number)
    : search.localidad ? [Number(search.localidad)] : undefined;

  const [searchResult, zonasData, subtiposRaw, colegas, propietarios] = await Promise.all([
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
      false, // isPublishedOnly: false[cite: 15]
      false, // isNotUnlisted: false[cite: 15]
      'map'
    ),
    getZonasJerarquicasActivas(mercadoActual),
    getSubtiposPorTipoMercado(mercadoActual),
    getColegas(),
    getPropietarios(),
  ]);

  const propiedadesMapa = toPropiedadesMapa(searchResult.propiedades, true);

  const subtipos: SubtipoOption[] = subtiposRaw.map((st: any) => ({
    id: st.id,
    slug: st.slug,
    nombre: st.nombre,
  }));

  const centroInicial: [number, number] | undefined =
    search.lat && search.lng ? [Number(search.lat), Number(search.lng)] : undefined;

  const zoomInicial = search.zoom ? Number(search.zoom) : 11;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-4">
      <div className="flex justify-end">
        <Link
          href="/admin"
          className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-sm bg-white"
        >
          ← Volver al Menú
        </Link>
      </div>

      <MapaAdminResultsView
        propiedades={propiedadesMapa}
        zonasPadre={zonasData.zonasPadre}
        partidos={zonasData.partidos}
        subtipos={subtipos}
        colegas={colegas as ColegaMapaItem[]}
        propietarios={propietarios as PropietarioMapaItem[]}
        centroInicial={centroInicial}
        zoomInicial={zoomInicial}
      />
    </div>
  );
}