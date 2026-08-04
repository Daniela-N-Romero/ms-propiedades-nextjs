'use client';

import dynamic from 'next/dynamic';
import type { PropiedadMapaItem } from './mapa-propiedades-view';

interface MapaPropiedadesProps {
  propiedades: PropiedadMapaItem[];
  centroInicial?: [number, number];
  zoomInicial?: number;
  alturaClass?: string;
  isPrivateAdmin?: boolean; // Para habilitar botón de edición y datos de contacto
}

// Carga dinámica sin SSR para evitar errores de 'window is not defined'
const MapaPropiedadesView = dynamic(
  () => import('./mapa-propiedades-view'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-125 bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center text-slate-400 text-sm font-semibold">
        📍 Cargando mapa interactivo...
      </div>
    )
  }
);

export default function MapaPropiedades(props: MapaPropiedadesProps) {
  return <MapaPropiedadesView {...props} />;
}