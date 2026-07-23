'use client';

import dynamic from 'next/dynamic';

// Carga dinámica sin SSR para evitar errores de 'window is not defined'
const MapaPropiedadesView = dynamic(
  () => import('./mapa-propiedades-view'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[calc(100vh-140px)] min-h-125 bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center text-slate-400 text-sm font-semibold">
        📍 Cargando mapa interactivo...
      </div>
    )
  }
);

export default MapaPropiedadesView;