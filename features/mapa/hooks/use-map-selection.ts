'use client';

import { useState, useCallback } from 'react';
import type { ClusterMapaItem } from '../utils/geo-clustering';

export function useMapSelection(clusterInicial: ClusterMapaItem | null = null) {
  const [clusterManual, setClusterManual] = useState<ClusterMapaItem | null>(null);
  const [prevClusterInicial, setPrevClusterInicial] = useState<ClusterMapaItem | null>(clusterInicial);

  // Patrón oficial de React: ajustar estado durante el render cuando cambian las props
  if (clusterInicial !== prevClusterInicial) {
    setPrevClusterInicial(clusterInicial);
    setClusterManual(clusterInicial);
  }

  const clusterActivo = clusterManual ?? clusterInicial;

  const handleSelectCluster = useCallback((cluster: ClusterMapaItem | null) => {
    setClusterManual(cluster);
  }, []);

  const handleCloseCarousel = useCallback(() => {
    setClusterManual(null);
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