/**
 * Genera la URL relativa hacia la vista de lista (/propiedades)
 * preservando filtros de búsqueda (mercado, rangos, subtipos, localidades)
 * y eliminando parámetros efímeros del viewport del mapa (lat, lng, zoom).
 */
export function buildListUrlFromMapParams(searchParams: URLSearchParams | { toString(): string } | null | undefined): string {
  const current = searchParams ? searchParams.toString() : '';
  const params = new URLSearchParams(current);

  params.delete('lat');
  params.delete('lng');
  params.delete('zoom');

  const query = params.toString();
  return `/propiedades${query ? `?${query}` : ''}`;
}