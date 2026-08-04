import { searchPropiedades, getSubtiposPorTipoMercado } from '@/backend/services/property.service';
import { getLocalidadesActivasPorTipo } from '@/backend/services/zone.service';
import MapaAdminResultsView from '@/features/mapa/components/mapa-admin-results-view';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface MapaPrivadoAdminProps {
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
  }>;
}

export default async function MapaPrivadoAdminPage({ searchParams }: MapaPrivadoAdminProps) {
  const search = await searchParams;

  const subtiposSlugs = Array.isArray(search.subtipo)
    ? search.subtipo
    : search.subtipo ? [search.subtipo] : undefined;

  const localidades = Array.isArray(search.localidad)
    ? search.localidad.map(Number)
    : search.localidad ? [Number(search.localidad)] : undefined;

  // Consulta paralela con los filtros del admin aplicados
  const [propiedadesRaw, todasLocalidades, todosSubtipos] = await Promise.all([
    searchPropiedades({
      categoria: search.categoria,
      mercadoSlug: search.mercado,
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
    getLocalidadesActivasPorTipo(search.mercado || undefined),
    getSubtiposPorTipoMercado(search.mercado || undefined),
  ]);

  const propiedadesMapa = propiedadesRaw
    .filter((p: any) => p.latitud && p.longitud)
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
      zonaNombre: p.direccionPersonalizada || p.zona?.nombre || 'Zona no especificada',
      origen: p.origen,
      propietarioNombre: p.propietario?.nombre,
      propietarioTel: p.propietario?.telefono,
      colegaNombre: p.colega?.nombre,
      colegaInmobiliaria: p.colega?.inmobiliaria,
      colegaTel: p.colega?.telefono,
    }));

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
        localidades={todasLocalidades}
        subtipos={todosSubtipos}
      />
    </div>
  );
}