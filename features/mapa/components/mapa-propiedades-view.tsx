'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { customBrandIcon } from '../utils/leaflet-icon';
import { formatPrecio } from '@/lib/utils';
import Link from 'next/link';

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
}

export default function MapaPropiedadesView({
  propiedades,
  centroInicial = [-34.8833, -58.3833], // Por defecto: Zona Sur / Canning / Ezeiza
  zoomInicial = 11,
}: MapaPropiedadesViewProps) {
  return (
    <div className="w-full h-[calc(100vh-140px)] min-h-125 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={centroInicial}
        zoom={zoomInicial}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Capa de Mapa Estilo Limpio (OpenStreetMap / CartoDB) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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