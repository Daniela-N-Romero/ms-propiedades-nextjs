import { getPropiedades } from '@/backend/services/property.service';
import { getZonas, getTiposInmueble } from '@/backend/services/zone.service';
import MapaResultsView from '@/features/mapa/components/mapa-results-view';

interface MapaPageProps {
  searchParams: Promise<{
    categoria?: string;
    subtipo?: string | string[];
    localidad?: string | string[];
    moneda?: string;
    superficieTotal: number;
    superficieCubierta: number;
    precioMin?: string;
    precioMax?: string;
  }>;
}

export default async function MapaPage({ searchParams }: MapaPageProps) {
  const params = await searchParams;

  // Enviamos los filtros a Prisma
  const [propiedadesRaw, localidades, subtipos] = await Promise.all([
    getPropiedades(),
    getZonas(),
    getTiposInmueble(),
  ]);

  // Filtramos solo las que tienen latitud y longitud definidas
  const propiedadesConUbicacion = propiedadesRaw
    .filter((p: any) => p.latitud !== null && p.longitud !== null)
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
      localidades={localidades}
      subtipos={subtipos}
    />
  );
}
