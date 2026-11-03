// features/mapa/utils/geo-clustering.ts
import type { PropiedadMapaItem } from '../types/mapa-types';
import { calcularDistanciaMetros } from './geo-distance';

export interface ClusterMapaItem {
  id: string; // ej: 'prop-1' o 'cluster-1-2-3'
  latitud: number;
  longitud: number;
  propiedades: PropiedadMapaItem[];
  esMultiUnidad: boolean;
  precioRepresentativo: number;
  monedaRepresentativa: string;
}

/**
 * Agrupa propiedades que distan menos de umbralMetros (por defecto 30m)
 * o que comparten la misma coordenada exacta.
 */
export function agruparPropiedadesPorProximidad(
  propiedades: PropiedadMapaItem[],
  umbralMetros = 30
): ClusterMapaItem[] {
  const visitados = new Set<number>();
  const clusters: ClusterMapaItem[] = [];

  for (let i = 0; i < propiedades.length; i++) {
    const actual = propiedades[i];
    if (visitados.has(actual.id)) continue;

    const grupo: PropiedadMapaItem[] = [actual];
    visitados.add(actual.id);

    for (let j = i + 1; j < propiedades.length; j++) {
      const candidata = propiedades[j];
      if (visitados.has(candidata.id)) continue;

      const dist = calcularDistanciaMetros(
        actual.latitud,
        actual.longitud,
        candidata.latitud,
        candidata.longitud
      );

      if (dist <= umbralMetros) {
        grupo.push(candidata);
        visitados.add(candidata.id);
      }
    }

    const esMulti = grupo.length > 1;

    clusters.push({
      id: esMulti ? `cluster-${grupo.map((p) => p.id).join('-')}` : `prop-${actual.id}`,
      latitud: actual.latitud,
      longitud: actual.longitud,
      propiedades: grupo,
      esMultiUnidad: esMulti,
      precioRepresentativo: grupo[0].precio,
      monedaRepresentativa: grupo[0].moneda,
    });
  }

  return clusters;
}