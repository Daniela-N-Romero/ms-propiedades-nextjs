'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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

// Subcomponente para recentrar el mapa cuando cambian lat/lng externamente (por buscador)
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 15, { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

// Subcomponente para capturar clics directamente en el mapa
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [estimatedAddress, setEstimatedAddress] = useState<string | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const markerRef = useRef<L.Marker>(null);

  // Coordenadas por defecto (ej. Quilmes / Berazategui - GBA Sur si viene en 0)
  const currentLat = latitud || -34.78;
  const currentLng = longitud || -58.28;

  // 📍 REVERSE GEOCODING: Obtener dirección estimada desde lat/lng con OpenStreetMap
  useEffect(() => {
    if (!latitud || !longitud) return;

    const timer = setTimeout(async () => {
      setIsLoadingAddress(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitud}&lon=${longitud}&zoom=18&addressdetails=1`
        );
        if (res.ok) {
          const data = await res.json();
          setEstimatedAddress(data.display_name || 'Ubicación seleccionada en el mapa');
        }
      } catch (err) {
        console.error('Error obteniendo dirección:', err);
      } finally {
        setIsLoadingAddress(false);
      }
    }, 600); // Debounce para no saturar la API gratuita

    return () => clearTimeout(timer);
  }, [latitud, longitud]);

  // 🔍 FORWARD GEOCODING: Buscar dirección por texto
  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery + ', Buenos Aires, Argentina'
        )}`
      );
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const firstResult = results[0];
          const newLat = parseFloat(firstResult.lat);
          const newLng = parseFloat(firstResult.lon);
          onChangeLocation(newLat, newLng);
        } else {
          alert('No se encontraron coordenadas para esa dirección.');
        }
      }
    } catch (err) {
      console.error('Error buscando dirección:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Evento al arrastrar el Pin (Drag)
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onChangeLocation(latLng.lat, latLng.lng);
        }
      },
    }),
    [onChangeLocation]
  );

  return (
    <div className="space-y-3">
      {/* BUSCADOR DE DIRECCIÓN */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Buscar dirección o lugar (ej: Av. Mitre 1200, Berazategui)"
          className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-orange bg-white shadow-sm"
        />
        <button
          type="button"
          onClick={handleSearchAddress}
          disabled={isSearching}
          className="px-4 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition disabled:opacity-50 whitespace-nowrap shadow-sm"
        >
          {isSearching ? 'Buscando...' : 'Buscar en Mapa'}
        </button>
      </div>

      {/* CONTENEDOR DEL MAPA LEAFLET */}
      <div className="relative h-80 w-full rounded-2xl overflow-hidden border border-slate-300 shadow-inner z-0">
        <MapContainer
          center={[currentLat, currentLng]}
          zoom={14}
          scrollWheelZoom={false}
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
            ref={markerRef}
            icon={defaultIcon}
          />

          <MapRecenter lat={currentLat} lng={currentLng} />
          <MapClickHandler onClick={(lat, lng) => onChangeLocation(lat, lng)} />
        </MapContainer>
      </div>

      {/* SPAN / FOOTER CON DIRECCIÓN ESTIMADA Y COORDENADAS */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <span className="text-base">📍</span>
          <div>
            <span className="font-bold text-slate-800 block">Dirección estimativa OSM:</span>
            <span className="text-slate-600 font-medium">
              {isLoadingAddress
                ? 'Obteniendo dirección...'
                : estimatedAddress || 'Hacé clic o arrastrá el pin en el mapa'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-600 font-semibold self-end sm:self-auto">
          <span>Lat: {currentLat.toFixed(6)}</span>
          <span>Lng: {currentLng.toFixed(6)}</span>
        </div>
      </div>
    </div>
  );
}