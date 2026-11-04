/**
 * Calcula la distancia en metros entre dos coordenadas geográficas (fórmula de Haversine).
 */
export function calcularDistanciaMetros(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const R = 6371e3; // Radio de la Tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formatea un precio en una pastilla compacta (ej: USD 420K, USD 1.2M, $ 85M).
 */
export function formatPrecioCompacto(precio: number, moneda: string = 'USD'): string {
  if (!precio || isNaN(precio)) return `${moneda} Consultar`;

  const simbolo = moneda.toUpperCase() === 'PESOS' || moneda.toUpperCase() === 'ARS' ? '$' : 'USD';

  if (precio >= 1_000_000) {
    const millones = precio / 1_000_000;
    const formateado = millones % 1 === 0 ? millones.toFixed(0) : millones.toFixed(1);
    return `${simbolo} ${formateado}M`;
  }

  if (precio >= 1_000) {
    const miles = precio / 1_000;
    const formateado = miles % 1 === 0 ? miles.toFixed(0) : miles.toFixed(0);
    return `${simbolo} ${formateado}K`;
  }

  return `${simbolo} ${precio.toLocaleString('es-AR')}`;
}