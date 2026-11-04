// features/filtrado/hooks/use-filtro-zonas-jerarquico.ts
'use client';

import { useState, useMemo } from 'react';
import type { PartidoConLocalidades, ZonaPadre } from '../types/filtrado.types';

interface UseFiltroZonasJerarquicoProps {
  zonasPadre: ZonaPadre[];
  partidos: PartidoConLocalidades[];
  localidadesSeleccionadas: number[];
  onSelectMultipleLocalidades: (ids: number[], agregar: boolean) => void;
}

export function useFiltroZonasJerarquico({
  zonasPadre,
  partidos,
  localidadesSeleccionadas,
  onSelectMultipleLocalidades,
}: UseFiltroZonasJerarquicoProps) {
  // 1. Mapeo rápido: ID de localidad -> padreId (ID de la región/macro-zona)
  const mapaLocalidadARegion = useMemo(() => {
    const mapa = new Map<number, number>();
    for (const partido of partidos) {
      if (partido.padreId) {
        for (const loc of partido.localidades) {
          mapa.set(loc.id, partido.padreId);
        }
      }
    }
    return mapa;
  }, [partidos]);

  // 2. Inferir qué región contiene alguna de las localidades activas
  const regionInferidaId = useMemo(() => {
    if (localidadesSeleccionadas.length > 0) {
      for (const locId of localidadesSeleccionadas) {
        const padreId = mapaLocalidadARegion.get(locId);
        if (padreId) return padreId;
      }
    }
    return zonasPadre[0]?.id;
  }, [localidadesSeleccionadas, mapaLocalidadARegion, zonasPadre]);

  // 3. Estado local para cuando el usuario cambia manualmente el select
  const [regionManualId, setRegionManualId] = useState<number | null>(null);
  const [prevInferidaId, setPrevInferidaId] = useState<number | undefined>(regionInferidaId);

  // Si las localidades seleccionadas cambian externamente (ej: reabrir modal), sincronizamos
  if (regionInferidaId !== prevInferidaId) {
    setPrevInferidaId(regionInferidaId);
    setRegionManualId(null);
  }

  // La región activa es la que el usuario cambió a mano, o la inferida por los filtros
  const regionActivaId = regionManualId ?? regionInferidaId;

  // 4. Control de acordeones expandidos
  const [partidosExpandidos, setPartidosExpandidos] = useState<Record<number, boolean>>({});

  const toggleExpandir = (partidoId: number) => {
    setPartidosExpandidos((prev) => ({
      ...prev,
      [partidoId]: !prev[partidoId],
    }));
  };

  // 5. Partidos filtrados por la región activa
  const partidosVisibles = useMemo(() => {
    if (!regionActivaId) return partidos;
    return partidos.filter((p) => p.padreId === regionActivaId);
  }, [partidos, regionActivaId]);

  // 6. Cambio voluntario de región
  const handleCambioRegion = (nuevaRegionId: number) => {
    setRegionManualId(nuevaRegionId);

    const partidosDeNuevaRegion = partidos.filter((p) => p.padreId === nuevaRegionId);
    const todasLasLocalidadesRegion = partidosDeNuevaRegion.flatMap((p) =>
      p.localidades.map((loc) => loc.id)
    );

    // Limpiamos las anteriores y seleccionamos todas las de la nueva región
    onSelectMultipleLocalidades(localidadesSeleccionadas, false);
    onSelectMultipleLocalidades(todasLasLocalidadesRegion, true);
  };

  return {
    regionActivaId,
    partidosVisibles,
    partidosExpandidos,
    toggleExpandir,
    handleCambioRegion,
  };
}