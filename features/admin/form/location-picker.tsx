'use client';

import dynamic from 'next/dynamic';

// Importación dinámica deshabilitando SSR
const LocationPickerMap = dynamic(() => import('./location-picker-map'), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] w-full rounded-2xl bg-slate-100 animate-pulse flex flex-col items-center justify-center gap-2 border border-slate-200 text-slate-400 text-xs font-semibold">
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
  return <LocationPickerMap latitud={latitud} longitud={longitud} onChangeLocation={onChangeLocation} />;
}