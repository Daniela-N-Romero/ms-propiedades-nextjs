'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los íconos por defecto de Leaflet en Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationPickerMapProps {
  latitud: number;
  longitud: number;
  onChangeLocation: (lat: number, lng: number) => void;
}

// Subcomponente para re-centrar el mapa cuando cambian coordenadas
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

// Subcomponente para capturar clics directos sobre el mapa
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPickerMap({
  latitud,
  longitud,
  onChangeLocation,
}: LocationPickerMapProps) {
  const [estimatedAddress, setEstimatedAddress] = useState<string | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Garantizar valores numéricos limpios
  const currentLat = typeof latitud === 'number' && !isNaN(latitud) && latitud !== 0 ? latitud : -34.78;
  const currentLng = typeof longitud === 'number' && !isNaN(longitud) && longitud !== 0 ? longitud : -58.28;

  // 📍 REVERSE GEOCODING: Obtener dirección estimada según lat/lng
  useEffect(() => {
    if (!currentLat || !currentLng) return;

    const timer = setTimeout(async () => {
      setIsLoadingAddress(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLat}&lon=${currentLng}&zoom=18&addressdetails=1`,
          { headers: { 'Accept-Language': 'es' } }
        );
        if (res.ok) {
          const data = await res.json();
          setEstimatedAddress(data.display_name || 'Ubicación seleccionada en el mapa');
        }
      } catch (err) {
        console.error('Error al obtener dirección:', err);
      } finally {
        setIsLoadingAddress(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [currentLat, currentLng]);

  // 📌 MANEJADOR DE ARRASTRE (DRAG) DEL PIN
  const handleDragEnd = useCallback(
    (e: any) => {
      const marker = e.target;
      if (marker) {
        const position = marker.getLatLng();
        onChangeLocation(position.lat, position.lng);
      }
    },
    [onChangeLocation]
  );

  const eventHandlers = useMemo(() => ({ dragend: handleDragEnd }), [handleDragEnd]);

 // 📌 MANEJADOR DE ARRASTRE ZOOM
function WheelZoomHandler() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const handleWheel = (e: WheelEvent) => {
      // Si el usuario usa la rueda sobre el mapa, prevenimos el zoom/scroll de la página
      e.preventDefault();
      
      if (e.deltaY < 0) {
        map.zoomIn();
      } else {
        map.zoomOut();
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [map]);

  return null;
}

  return (
    <div className="space-y-3">
      {/* CONTENEDOR DEL MAPA */}
      <div className="relative h-80 w-full rounded-2xl overflow-hidden border border-slate-300 shadow-inner z-0">
        <MapContainer
          center={[currentLat, currentLng]}
          zoom={15}
          scrollWheelZoom={false} 
          doubleClickZoom={true}  
          keyboard={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={[currentLat, currentLng]}
            icon={defaultIcon}
          />
          <WheelZoomHandler />

          <MapRecenter lat={currentLat} lng={currentLng} />
          <MapClickHandler onClick={(lat, lng) => onChangeLocation(lat, lng)} />
        </MapContainer>
      </div>

      {/* FOOTER CON COORDENADAS Y DIRECCIÓN ESTIMADA */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <span className="text-base">📍</span>
          <div>
            <span className="font-bold text-slate-800 block">Dirección estimada (OSM):</span>
            <span className="text-slate-600 font-medium">
              {isLoadingAddress
                ? 'Obteniendo dirección...'
                : estimatedAddress || 'Hacé clic o arrastrá el pin en el mapa'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-600 font-semibold self-end sm:self-auto shadow-2xs">
          <span>Lat: {currentLat.toFixed(6)}</span>
          <span>Lng: {currentLng.toFixed(6)}</span>
        </div>
      </div>
    </div>
  );
}