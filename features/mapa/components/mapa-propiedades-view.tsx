// features/mapa/components/mapa-propiedades-view.tsx
'use client';

import { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { PropietarioMapaItem, ColegaMapaItem, PropiedadMapaItem } from '@/features/mapa/types/mapa-types';
import { agruparPropiedadesPorProximidad, type ClusterMapaItem } from '../utils/geo-clustering';
import { createPillMarkerIcon } from '../utils/leaflet-custom-markers';

interface MapaPropiedadesViewProps {
  propiedades: PropiedadMapaItem[];
  centroInicial?: [number, number];
  zoomInicial?: number;
  alturaClass?: string;
  isPrivateAdmin?: boolean;
  propietarios?: PropietarioMapaItem[];
  colegas?: ColegaMapaItem[];
  clusterSeleccionadoId?: string | null;
  onSelectCluster?: (cluster: ClusterMapaItem | null) => void;
}

function RecenterMap({ center, zoom }: { center?: [number, number]; zoom: number }) {
  const map = useMap();
  const lat = center?.[0];
  const lng = center?.[1];

  useEffect(() => {
    if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
      const raf = requestAnimationFrame(() => {
        map.invalidateSize();
        map.setView([lat, lng], zoom, { animate: false });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [lat, lng, zoom, map]);

  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick?: () => void }) {
  const map = useMap();

  useEffect(() => {
    if (!onMapClick) return;
    const handleClick = () => onMapClick();
    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  return null;
}

export default function MapaPropiedadesView({
  propiedades,
  centroInicial = [-34.8833, -58.3833],
  zoomInicial = 11,
  alturaClass = 'h-full w-full',
  isPrivateAdmin = false,
  clusterSeleccionadoId = null,
  onSelectCluster,
}: MapaPropiedadesViewProps) {
  const clusters = useMemo(() => {
    return agruparPropiedadesPorProximidad(propiedades, 30);
  }, [propiedades]);

  return (
    <div className={`w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0 ${alturaClass}`}>
      <MapContainer
        center={centroInicial}
        zoom={zoomInicial}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <RecenterMap center={centroInicial} zoom={zoomInicial} />
        <MapClickHandler onMapClick={() => onSelectCluster?.(null)} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {clusters.map((cluster) => {
          const isSelected = cluster.id === clusterSeleccionadoId;
          const icon = createPillMarkerIcon(cluster, isSelected, isPrivateAdmin);

          return (
            <Marker
              key={cluster.id}
              position={[cluster.latitud, cluster.longitud]}
              icon={icon}
              zIndexOffset={isSelected ? 1000 : 0}
              eventHandlers={{
                click: (e) => {
                  const map = e.target._map;
                  map.panTo([cluster.latitud, cluster.longitud], { animate: true, duration: 0.4 });
                  onSelectCluster?.(cluster);
                },
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}