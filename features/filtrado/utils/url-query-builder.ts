/**
 * @file url-query-builder.ts
 * @description Funciones puras encargadas de:
 * 1. Convertir un objeto FiltrosState en un query string higiénico para la URL.
 * 2. Extraer y tipar los searchParams de la URL actual hacia FiltrosState.
 */

import { FiltrosState } from '../types/filtrado.types';

interface BuildQueryOptions {
  currentSearchParams?: URLSearchParams | Record<string, string | string[] | undefined>;    /** searchParams actuales para no perder parámetros contextuales como 'mercado' */
  preserveKeys?: string[]; /** Parámetros que deben preservarse obligatoriamente de la URL previa */
}



/**
 * Construye un query string seguro y optimizado a partir de un estado de filtros.
 * Elimina duplicados en arrays y descarta valores no numéricos (NaN) o nulos.
 */

export function buildFilterQueryString(
  filters: FiltrosState,
  options?: BuildQueryOptions
): string {
  const params = new URLSearchParams();

  // Si se pasaron opciones para preservar claves de la URL actual:
  if (options?.currentSearchParams && options?.preserveKeys) {
    const sp = options.currentSearchParams instanceof URLSearchParams
      ? options.currentSearchParams
      : new URLSearchParams(options.currentSearchParams as any);

    options.preserveKeys.forEach((key) => {
      const val = sp.get(key);
      if (val) params.set(key, val);
    });
  }

  // Procesar filtros de texto simple (operación, moneda, orden)
  // Usamos `.set(clave, valor)`: si la clave ya existía, la sobreescribe (evita duplicados).
  // Validamos con `.trim() !== ''` para no generar URLs con claves vacías tipo "?categoria=".
  if (filters.mercado && filters.mercado.trim() !== '') {
    params.set('mercado', filters.mercado.trim());
  }
  if (filters.categoria && filters.categoria.trim() !== '') {
    params.set('categoria', filters.categoria.trim());
  }

  if (filters.moneda && filters.moneda.trim() !== '') {
    params.set('moneda', filters.moneda.trim());
  }

   // Mapeamos 'orden' al nombre que espera el backend ('ordenar')
  if (filters.orden && filters.orden.trim() !== '') {
    params.set('ordenar', filters.orden.trim());
  }

  // Procesar arrays (subtipos y localidades) evitando duplicaciones en la URL
  if (filters.subtipo && filters.subtipo.length > 0) {
    const subtiposUnicos = Array.from(new Set(filters.subtipo.filter(Boolean)));
    subtiposUnicos.forEach((slug) => params.append('subtipo', slug));
  }

  if (filters.localidad && filters.localidad.length > 0) {
    // Filtramos IDs válidos (> 0 y que no sean NaN)
    const locsValidas = Array.from(
      new Set(filters.localidad.filter((id) => typeof id === 'number' && !isNaN(id) && id > 0))
    );
    locsValidas.forEach((id) => params.append('localidad', String(id)));
  }

  // Procesar rangos numéricos con validación estricta
    // Definimos una tabla de equivalencias entre la propiedad de FiltrosState
  // y el nombre del parámetro que espera la base de datos en Next.js.
  const rangos: Array<[keyof FiltrosState, string]> = [
    ['precioMin', 'precioMin'],
    ['precioMax', 'precioMax'],
    ['supMin', 'supMin'],
    ['supMax', 'supMax'],
    ['supCubMin', 'supCubMin'],
    ['supCubMax', 'supCubMax'],
  ];

  rangos.forEach(([key, paramName]) => {
    const val = filters[key];
    // Solo escribimos el parámetro si es un número válido y mayor a 0.
    // Esto previene que si el usuario borra un input, se envíe "?precioMin=0" o "?precioMin=NaN".
    if (typeof val === 'number' && !isNaN(val) && val > 0) {
      params.set(paramName, String(val));
    }
  });

  // ... resto de serialización (categoria, subtipo, localidad, etc.)
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Lee los searchParams que Next.js recibe en la URL y los transforma en un objeto
 * tipado `FiltrosState` que los componentes de React pueden consumir sin riesgo de errores.
 * 
 * @param searchParams - Parámetros de la URL actual.
 * @returns Objeto estructurado con los filtros parseados y limpios.
 */
export function parseSearchParamsToFilters(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): FiltrosState {

  // Helper interno: obtiene un string único sin importar si viene como URLSearchParams o como objeto
  const getParam = (key: string): string | undefined => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key) || undefined;
    }
    const val = searchParams[key];
    return Array.isArray(val) ? val[0] : val;
  };

  // Helper para obtener una lista de valores (cuando hay múltiples ?subtipo=...)
  const getAllParam = (key: string): string[] => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.getAll(key);
    }
    const val = searchParams[key];
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  };

  // Helper para convertir strings en números seguros descartando NaN o negativos
  const parseNum = (val: string | undefined): number | undefined => {
    if (!val) return undefined;
    const num = Number(val);
    return isNaN(num) || num <= 0 ? undefined : num;
  };

  return {
    mercado: getParam('mercado'),
    categoria: getParam('categoria'),
    moneda: getParam('moneda'),
    orden: getParam('ordenar') || getParam('orden'),
    subtipo: getAllParam('subtipo').filter(Boolean),
    localidad: getAllParam('localidad').map(Number).filter((n) => !isNaN(n) && n > 0),
    precioMin: parseNum(getParam('precioMin')),
    precioMax: parseNum(getParam('precioMax')),
    supMin: parseNum(getParam('supMin')),
    supMax: parseNum(getParam('supMax')),
    supCubMin: parseNum(getParam('supCubMin')),
    supCubMax: parseNum(getParam('supCubMax')),
  };
}