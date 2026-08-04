import { useState, useEffect, useTransition } from 'react';
import type { ZonaServer } from '@/types/server-data';
import type { TipoInmueble } from '@prisma-client';

interface UsePropertyCascadesProps {
  subtiposIniciales?: TipoInmueble[];
  localidadesIniciales?: ZonaServer[];
  mercadoPadreInicialId?: number;
  regionInicialId?: number;
  partidoInicialId?: number;
}

export function usePropertyCascades({
  subtiposIniciales = [],
  localidadesIniciales = [],
  mercadoPadreInicialId = 0,
  regionInicialId = 0,
  partidoInicialId = 0,
}: UsePropertyCascadesProps) {
  const [isPending, startTransition] = useTransition();

  const [selectedMercadoId, setSelectedMercadoId] = useState<number>(mercadoPadreInicialId);
  const [selectedRegionId, setSelectedRegionId] = useState<number>(regionInicialId);
  const [selectedPartidoId, setSelectedPartidoId] = useState<number>(partidoInicialId);

  const [subtiposDisponibles, setSubtiposDisponibles] = useState<TipoInmueble[]>(subtiposIniciales);
  const [partidosDisponibles, setPartidosDisponibles] = useState<ZonaServer[]>([]);
  const [localidadesDisponibles, setLocalidadesDisponibles] = useState<ZonaServer[]>(localidadesIniciales);

  // Mercado -> Subtipos
  useEffect(() => {
    if (!selectedMercadoId) {
      setSubtiposDisponibles([]);
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch(`/api/tipos/subtipos?padreId=${selectedMercadoId}`);
        if (res.ok) setSubtiposDisponibles(await res.json());
      } catch (err) {
        console.error('Error al cargar subtipos:', err);
      }
    });
  }, [selectedMercadoId]);

  // Región -> Partidos
  useEffect(() => {
    if (!selectedRegionId) {
      setPartidosDisponibles([]);
      setLocalidadesDisponibles([]);
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch(`/api/zonas/localidades?padreId=${selectedRegionId}`);
        if (res.ok) setPartidosDisponibles(await res.json());
      } catch (err) {
        console.error('Error al cargar partidos:', err);
      }
    });
  }, [selectedRegionId]);

  // Partido -> Localidades
  useEffect(() => {
    if (!selectedPartidoId) {
      setLocalidadesDisponibles([]);
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch(`/api/zonas/localidades?padreId=${selectedPartidoId}`);
        if (res.ok) setLocalidadesDisponibles(await res.json());
      } catch (err) {
        console.error('Error al cargar localidades:', err);
      }
    });
  }, [selectedPartidoId]);

  return {
    isPending,
    selectedMercadoId,
    setSelectedMercadoId,
    selectedRegionId,
    setSelectedRegionId,
    selectedPartidoId,
    setSelectedPartidoId,
    subtiposDisponibles,
    partidosDisponibles,
    localidadesDisponibles,
  };
}