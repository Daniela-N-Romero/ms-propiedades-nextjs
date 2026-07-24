'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { customBrandIcon } from '../utils/leaflet-icon';
import { formatPrecio } from '@/lib/utils';
import Link from 'next/link';
import { useEffect } from 'react';

export interface PropiedadMapaItem {
  id: number;
  codigo: string;
  slug: string;
  titulo: string;
  precio: number;
  superficieTotal: number | null;
  superficieCubierta: number | null;
  moneda: string;
  latitud: number;
  longitud: number;
  imagenPortada?: string;
  zonaNombre: string;
}

interface MapaPropiedadesViewProps {
  propiedades: PropiedadMapaItem[];
  centroInicial?: [number, number]; // [lat, lng]
  zoomInicial?: number;
  alturaClass?: string;
}

function RecenterMap({ center, zoom }: { center?: [number, number]; zoom: number }) {
  const map = useMap();

  // Desestructuramos los números exactos
  const lat = center?.[0];
  const lng = center?.[1];

  useEffect(() => {
    if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
      // Esperamos a que el navegador termine de renderizar el layout
      const raf = requestAnimationFrame(() => {
        map.invalidateSize();
        map.setView([lat, lng], zoom, { animate: false });
      });

      return () => cancelAnimationFrame(raf);
    }
  }, [lat, lng, zoom, map]); 

  return null;
}

export default function MapaPropiedadesView({
  propiedades,
  centroInicial = [-34.8833, -58.3833],
  zoomInicial = 11,
  alturaClass = 'h-full min-h-[300px]', 
}: MapaPropiedadesViewProps) {
  return (
    <div className={`w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0 ${alturaClass}`}>
      <MapContainer
        center={centroInicial}
        zoom={zoomInicial}
        scrollWheelZoom={true}
        className="w-full h-full"
      >

        <RecenterMap center={centroInicial} zoom={zoomInicial} />
        
        {/* Capa de Mapa Estilo Limpio (OpenStreetMap / CartoDB) */}
        <TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>


        {/* Pines con Popups */}
        {propiedades.map((prop) => (
          <Marker
            key={prop.id}
            position={[prop.latitud, prop.longitud]}
            icon={customBrandIcon}
          >
            <Popup className="custom-popup">
              <div className="w-60 p-1 space-y-2">
                {prop.imagenPortada && (
                  <div className="h-33 w-full overflow-hidden rounded-lg bg-slate-100">
                    <img
                      src={prop.imagenPortada}
                      alt={prop.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    REF: {prop.codigo} • {prop.zonaNombre}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                    {prop.titulo}
                  </h4>
                  < div className="text-[11px] font-medium text-slate-500">
                    {prop.superficieTotal ? `${prop.superficieTotal} m² tot.` : ''}
                    {prop.superficieTotal && prop.superficieCubierta ? ' • ' : ''}
                    {prop.superficieCubierta ? `${prop.superficieCubierta} m² cub.` : ''}

                  </div>
                  <p className="text-sm font-extrabold text-brand-green">
                    {formatPrecio(prop.precio, prop.moneda)}
                  </p>
                </div>

                <Link
                  href={`/propiedades/${prop.slug}`}
                  className="block w-full text-center hover:text-brand-dark bg-brand-dark hover:bg-amber-500 font-bold text-[11px] uppercase py-2 rounded-lg transition-all"
                  style={{ color: 'white' }}
                >
                  Ver Propiedad
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div >
  );
}