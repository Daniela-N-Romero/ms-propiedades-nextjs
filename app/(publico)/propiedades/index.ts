import { getSubtiposPorTipoMercado, searchPropiedades } from "@/backend/services/property.service";
import { getLocalidadesActivasPorTipo } from "@/backend/services/zone.service";

interface RenderProps {
  searchParams: { [key: string]: string | string[] | undefined };
  mercadoSlug: string; // Pasamos el tipo explícito del mercado (Industrial, Residencial, etc.)
}

export async function renderPageByPropertyType({ searchParams, mercadoSlug }: RenderProps) {
  const params = searchParams;

  // 1. Mapeamos las variables de la URL
  let localidadesIds: number[] = [];
  if (params.localidad) {
    localidadesIds = Array.isArray(params.localidad)
      ? params.localidad.map(Number)
      : [Number(params.localidad)];
  }

  const categoriaParam = typeof params.categoria === 'string' ? params.categoria : undefined;
  let subtiposSlugs: string[] = [];
  if (params.subtipo) {
    subtiposSlugs = Array.isArray(params.subtipo) ? params.subtipo : [params.subtipo];
  }


  // 2. Ejecutamos los servicios en paralelo
  const [propiedades, localidades, subtipos] = await Promise.all([
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
      ordenar: typeof params.ordenar === 'string' ? params.ordenar : undefined
    }),
    getLocalidadesActivasPorTipo(mercadoSlug, categoriaParam),
    getSubtiposPorTipoMercado(mercadoSlug)
  ]);

  return [propiedades, localidades, subtipos] as const;

}