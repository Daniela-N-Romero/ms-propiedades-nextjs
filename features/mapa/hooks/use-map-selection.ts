// features/mapa/hooks/use-map-selection.ts
'use client';

import { useState, useCallback } from 'react';
import type { ClusterMapaItem } from '../utils/geo-clustering';
import type { PropiedadMapaItem } from '../types/mapa-types';

export function useMapSelection() {
  const [clusterActivo, setClusterActivo] = useState<ClusterMapaItem | null>(null);

  // Selecciona un cluster o pin individual al hacer click
  const handleSelectCluster = useCallback((cluster: ClusterMapaItem | null) => {
    setClusterActivo(cluster);
  }, []);

  // Cierra el carrusel (al presionar X o hacer click en el fondo del mapa)
  const handleCloseCarousel = useCallback(() => {
    setClusterActivo(null);
  }, []);

  return {
    clusterActivo,
    selectedClusterId: clusterActivo?.id ?? null,
    propiedadesEnCarrusel: clusterActivo?.propiedades ?? [],
    isOpen: !!clusterActivo && clusterActivo.propiedades.length > 0,
    handleSelectCluster,
    handleCloseCarousel,
  };
}