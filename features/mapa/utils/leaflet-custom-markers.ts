// features/mapa/utils/leaflet-custom-markers.ts
import L from 'leaflet';
import { formatPrecioCompacto } from './geo-distance';
import type { ClusterMapaItem } from './geo-clustering';

export function createPillMarkerIcon(
  cluster: ClusterMapaItem,
  isSelected = false,
  isPrivateAdmin = false
): L.DivIcon {
  const { esMultiUnidad, propiedades, precioRepresentativo, monedaRepresentativa } = cluster;
  const tienePropia = propiedades.some((p) => p.origen !== 'fromColleague');

  // Estado Activo (estilo Mercado Libre: contraste total al hacer click)
  let baseClasses = '';
  if (isSelected) {
    baseClasses = 'bg-slate-900 text-white border-brand-orange ring-2 ring-brand-orange/40 scale-110 z-50 shadow-2xl';
  } else if (isPrivateAdmin) {
    baseClasses = tienePropia
      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md hover:scale-105'
      : 'bg-blue-600 text-white border-blue-700 shadow-md hover:scale-105';
  } else {
    baseClasses = 'bg-white text-slate-900 border-slate-300 shadow-md hover:scale-105 hover:border-slate-400';
  }

  let innerContent = '';

  if (esMultiUnidad) {
    innerContent = `
      <div class="-translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[11px] font-sans border transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${baseClasses}">
        <span>🏢</span>
        <span>${propiedades.length} unid.</span>
      </div>
    `;
  } else {
    const textoPrecio = formatPrecioCompacto(precioRepresentativo, monedaRepresentativa);
    innerContent = `
      <div class="-translate-x-1/2 -translate-y-1/2 flex items-center justify-center px-3 py-1.5 rounded-full font-bold text-[11px] font-sans border transition-all duration-150 cursor-pointer select-none whitespace-nowrap ${baseClasses}">
        <span>${textoPrecio}</span>
      </div>
    `;
  }

  return L.divIcon({
    html: innerContent,
    className: 'custom-pill-marker',
    iconSize: undefined,
    iconAnchor: [0, 0],
  });
}