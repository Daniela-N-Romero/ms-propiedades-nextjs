'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import type { PropiedadMapaItem, PropietarioMapaItem, ColegaMapaItem } from '../types/mapa-types';
import { agruparPropiedadesPorProximidad } from '../utils/geo-clustering';
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
  propiedadIdInicial?: number;
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
  const searchParams = useSearchParams();
  const idFromParam = searchParams?.get('propiedadId');
  const targetId = props.propiedadIdInicial || (idFromParam ? Number(idFromParam) : null);

  // Calculamos los clusters
  const clusters = useMemo(() => {
    return agruparPropiedadesPorProximidad(props.propiedades, 30);
  }, [props.propiedades]);

  // Si viene un ID objetivo, buscamos el cluster que lo contiene
  const clusterInicial = useMemo(() => {
    if (!targetId) return null;
    return clusters.find((c) => c.propiedades.some((p) => p.id === targetId)) ?? null;
  }, [clusters, targetId]);

  const {
    isOpen,
    selectedClusterId,
    propiedadesEnCarrusel,
    handleSelectCluster,
    handleCloseCarousel,
  } = useMapSelection(clusterInicial);

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