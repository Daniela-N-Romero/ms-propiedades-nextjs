import { prisma } from "@/backend/db";
import { getSubtiposPorTipoMercado, searchPropiedades } from "@/backend/services/property.service";
import { getLocalidadesActivasPorTipo } from "@/backend/services/zone.service";

interface RenderProps {
  searchParams: { [key: string]: string | string[] | undefined };
  mercadoSlug: string; // Pasamos el tipo explícito del mercado (Industrial, Residencial, etc.)
}

export async function renderPageByPropertyType({ searchParams, mercadoSlug }: RenderProps) {
  const params = searchParams;
  const page = Number(params.page) || 1;

  // 1. Mapeamos las variables de la URL
  let localidadesIds: number[] = [];
  // 1. Si viene el parámetro 'zona', buscamos todas sus localidades descendientes
if (params.zona) {
  const zonaId = Number(params.zona);
  if (!isNaN(zonaId)) {
    const localidadesDeZona = await prisma.zona.findMany({
      where: {
        OR: [
          { padreId: zonaId }, // Si es partido directo
          { padre: { padreId: zonaId } } // Si es localidad nieta de la MacroZona
        ]
      },
      select: { id: true }
    });
    localidadesIds = localidadesDeZona.map(l => l.id);
  }
}

// 2. Si vienen localidades/partidos específicos en la URL
if (params.localidad) {
  const rawLocs = Array.isArray(params.localidad) ? params.localidad : [params.localidad];
  const idsDirectos = rawLocs
    .flatMap(item => String(item).split(','))
    .map(str => Number(str.trim()))
    .filter(num => !isNaN(num) && num > 0);

  // Si ya había localidades de la zona, hacemos la intersección o sumamos
  localidadesIds = idsDirectos.length > 0 ? idsDirectos : localidadesIds;
}

  const categoriaParam = typeof params.categoria === 'string' ? params.categoria : undefined;
  let subtiposSlugs: string[] = [];
  if (params.subtipo) {
    subtiposSlugs = Array.isArray(params.subtipo) ? params.subtipo : [params.subtipo];
  }


  // 2. Ejecutamos los servicios en paralelo
  const [searchResult, localidades, subtipos] = await Promise.all([
    searchPropiedades({
      categoria: categoriaParam,
      mercadoSlug: mercadoSlug,
      subtiposSlugs: subtiposSlugs,
      moneda: typeof params.moneda === 'string' ? params.moneda : undefined,
      precioMin: params.precioMin ? Number(params.precioMin) : undefined,
      precioMax: params.precioMax ? Number(params.precioMax) : undefined,
      supMin: params.supMin ? Number(params.supMin) : undefined,
      supMax: params.supMax ? Number(params.supMax) : undefined,
      localidades: localidadesIds,
      ordenar: typeof params.ordenar === 'string' ? params.ordenar : undefined,
      page: page,      
      pageSize: 12,    // Cantidad de cards por página
    }, true, true, 'list'),
    getLocalidadesActivasPorTipo(mercadoSlug, categoriaParam),
    getSubtiposPorTipoMercado(mercadoSlug)
  ]);
  // 3. Declaramos las variables mutables con let
  let propiedades = searchResult.propiedades;
  let totalPropiedades = searchResult.totalPropiedades;
  let totalPages = searchResult.totalPages;
  let esFallback = false;

  // 4. 💡 SI NO HAY RESULTADOS: Búsqueda Relajada / Fallback
  if (propiedades.length === 0) {
    esFallback = true;

    const fallbackResult = await searchPropiedades({
      mercadoSlug: mercadoSlug,
      categoria: categoriaParam,
      page: 1,
      pageSize: 12,
    }, true, true, 'list'); // 👈 Pasamos 'list' también al fallback

    propiedades = fallbackResult.propiedades;
    totalPropiedades = fallbackResult.totalPropiedades;
    totalPages = fallbackResult.totalPages;
  }

  return {
    propiedades,
    totalPropiedades,
    currentPage: page,
    totalPages,
    localidades,
    subtipos,
    esFallback
  };
}