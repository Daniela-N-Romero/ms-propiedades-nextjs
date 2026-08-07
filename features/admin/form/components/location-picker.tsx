'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('./location-picker-map'), {
  ssr: false,
  loading: () => (
    <div className="h-80 w-full rounded-2xl bg-slate-100 animate-pulse flex flex-col items-center justify-center gap-2 border border-slate-200 text-slate-400 text-xs font-semibold">
      <span>🗺️ Cargando Mapa Interactivo...</span>
    </div>
  ),
});

interface LocationPickerProps {
  latitud: number;
  longitud: number;
  onChangeLocation: (lat: number, lng: number) => void;
}

export function LocationPicker({ latitud, longitud, onChangeLocation }: LocationPickerProps) {
  // Estado local que responde al instante a los eventos del usuario
  const [coords, setCoords] = useState({
    lat: latitud || -34.78,
    lng: longitud || -58.28,
  });

  // Si las props externas cambian (por ejemplo, al cargar la propiedad) actualizamos el estado local
  useEffect(() => {
    if (latitud && longitud) {
      setCoords({ lat: latitud, lng: longitud });
    }
  }, [latitud, longitud]);

  const handleLocationChange = (newLat: number, newLng: number) => {
    // 1. Actualizamos el mapa al instante
    setCoords({ lat: newLat, lng: newLng });
    // 2. Notificamos al formulario de la propiedad
    onChangeLocation(newLat, newLng);
  };

  return (
    <LocationPickerMap
      latitud={coords.lat}
      longitud={coords.lng}
      onChangeLocation={handleLocationChange}
    />
  );
}