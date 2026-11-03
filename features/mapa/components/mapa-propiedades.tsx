// features/mapa/components/mapa-propiedades.tsx
'use client';

import dynamic from 'next/dynamic';
import type { PropiedadMapaItem, PropietarioMapaItem, ColegaMapaItem } from '../types/mapa-types';
import { useMapSelection } from '../hooks/use-map-selection';
import { MapaBottomCarousel } from './mapa-bottom-carousel';

interface MapaPropiedadesProps {
  propiedades: PropiedadMapaItem[];
  centroInicial?: [number, number];
  zoomInicial?: number;
  alturaClass?: string;
  isPrivateAdmin?: boolean;
  propietarios?: PropietarioMapaItem[];
  colegas?: ColegaMapaItem[];
}

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
  const {
    isOpen,
    selectedClusterId,
    propiedadesEnCarrusel,
    handleSelectCluster,
    handleCloseCarousel,
  } = useMapSelection();

  return (
    <div className="relative w-full h-full">
      <MapaPropiedadesView
        {...props}
        clusterSeleccionadoId={selectedClusterId}
        onSelectCluster={handleSelectCluster}
      />

      <MapaBottomCarousel
        isOpen={isOpen}
        propiedades={propiedadesEnCarrusel}
        onClose={handleCloseCarousel}
        isPrivateAdmin={props.isPrivateAdmin}
      />
    </div>
  );
}