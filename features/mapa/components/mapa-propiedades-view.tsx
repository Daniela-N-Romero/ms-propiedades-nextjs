'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { customBrandIcon, colleagueBrandIcon } from '../utils/leaflet-icon';
import { formatPrecio } from '@/lib/utils-formatting';
import Link from 'next/link';
import { useEffect } from 'react';
import type { PropietarioMapaItem, ColegaMapaItem } from '@/app/(privado)/admin/mapa-privado/page.tsx'


export interface PropiedadMapaItem {
  id: number;
  codigo: string;
  slug: string;
  titulo: string;
  precio: number;
  financiacion?: string;
  superficieTotal: number | null;
  superficieCubierta: number | null;
  moneda: string;
  latitud: number;
  longitud: number;
  imagenPortada?: string;
  zonaNombre: string;
  // Campos opcionales para la vista del mapa privado
  origen?: string;
  propietarioId?: number | null;
  colegaId?: number | null;
}

interface MapaPropiedadesViewProps {
  propiedades: PropiedadMapaItem[];
  centroInicial?: [number, number];
  zoomInicial?: number;
  alturaClass?: string;
  isPrivateAdmin?: boolean; // Para habilitar botón de edición y datos de contacto
  propietarios?: PropietarioMapaItem[];
  colegas?: ColegaMapaItem[];

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
  isPrivateAdmin = false,
  propietarios = [],
  colegas = []
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

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Pines con Popups */}
        {propiedades.map((prop) => {
          const isOwn = prop.origen !== 'fromColleague';
          const iconToUse = isOwn ? customBrandIcon : colleagueBrandIcon;
          const colega = colegas.find(c => c.id === prop.colegaId);
          const propietario = propietarios.find(p => p.id === prop.propietarioId);

          return (
            <Marker
              key={prop.id}
              position={[prop.latitud, prop.longitud]}
              icon={iconToUse}
            >
              <Popup className="custom-popup">
                <div className="w-60 p-1 space-y-2">
                  {prop.imagenPortada && (
                    <div className="h-32 w-full overflow-hidden rounded-lg bg-slate-100 relative">
                      <img
                        src={prop.imagenPortada}
                        alt={prop.titulo}
                        className="w-full h-full object-cover"
                      />
                      {isPrivateAdmin && (
                        <span
                          className={`absolute top-1.5 left-1.5 px-2 py-0.5 text-[9px] font-bold text-white uppercase rounded shadow-sm ${isOwn ? 'bg-emerald-600' : 'bg-blue-600'
                            }`}
                        >
                          {isOwn ? 'Propia' : 'Colega'}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      REF: {prop.codigo} • {prop.zonaNombre}
                    </span>
                    {isOwn && (
                      <Link href={`/propiedades/${prop.slug}`} className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight">
                        {prop.titulo}
                      </Link>
                    )}
                    {!isOwn && (
                      <span className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight">
                        {prop.titulo}
                      </span>
                    )}
                    <div className="text-[13px] font-medium text-slate-500">
                      {prop.superficieTotal ? `${prop.superficieTotal} m² tot.` : ''}
                      {prop.superficieTotal && prop.superficieCubierta ? ' • ' : ''}
                      {prop.superficieCubierta ? `${prop.superficieCubierta} m² cub.` : ''}
                    </div>
                    <p className="text-base font-extrabold text-brand-green">
                      {formatPrecio(prop.precio, prop.moneda)}
                    </p>
                    {prop.financiacion && (
                      <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded mt-0.5">
                        💳 {prop.financiacion}
                      </span>
                    )}
                  </div>

                  {/* BLOQUE DE CONTACTO INTERNO (SOLO VISIBLE EN PANEL ADMIN) */}
                  {isPrivateAdmin && (
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] space-y-0.5">
                      {isOwn ? (
                        <>
                          <span className="font-bold text-emerald-800 block">Propietario:</span>
                          <span className="text-slate-700 block truncate">
                            {propietario?.nombre || 'Sin asignar'}
                            {propietario?.telefono ? ` (${propietario.telefono})` : ''}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-blue-800 block">Colega:</span>
                          <span className="text-slate-700 block truncate">
                            {colega?.inmobiliaria || colega?.nombre || 'Sin asignar'}
                            {colega?.telefono ? ` (${colega.telefono})` : ''}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* LINK O BOTÓN */}
                  {isPrivateAdmin ? (
                    <Link
                      href={`/admin/${prop.id}/editar/`}
                      className="block w-full text-center bg-brand-orange hover:bg-slate-200 font-bold text-[13px] uppercase py-2 rounded-lg transition-all text-white"
                    >
                      ✏️ Editar Propiedad
                    </Link>
                  ) : (
                    <Link
                      href={`/propiedades/${prop.slug}`}
                      className="block w-full text-center bg-brand-orange hover:bg-slate-200 font-bold text-[13px] uppercase py-2 rounded-lg transition-all text-white shadow-1xl"
                    >
                      Ver Propiedad
                    </Link>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}