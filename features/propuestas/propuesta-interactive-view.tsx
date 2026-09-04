"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const MapaPropuesta = dynamic(
  () => import("./mapa-propuesta"),
  { ssr: false, loading: () => <div className="h-full bg-slate-100 flex items-center justify-center">Cargando Mapa Interactivo...</div> }
);

interface PropiedadPropuesta {
  id: string;
  slug?: string; // <-- Opcional
  title: string;
  localidad: string;
  lat: number;
  lng: number;
  precio: string;
  precioM2?: string; // <-- Opcional
  supCubierta: string;
  supTerreno: string;
  tiempoRuta: string;
  ahorroTiempo: string;
  aptitud?: string;  // <-- Opcional
  prioritaria?: boolean;
  imagen?: string;
  orden?: number;
}

interface Props {
  propiedades: PropiedadPropuesta[];
  destinoCoords: [number, number];
  puntoInteresNombre?: string; 
}

export default function PropuestaInteractiveView({
  propiedades,
  destinoCoords,
  puntoInteresNombre = "Punto de Interés",
}: Props) {
  const [selectedId, setSelectedId] = useState<string>(propiedades[0]?.id || "");
  const selectedProp = propiedades.find((p) => p.id === selectedId) || propiedades[0];


  // Helper para asignar el badge de opción según el orden
   const getBadgeOption = (index: number) => {
    const numeroOpcion = index + 1; // 0 -> 1 (Opción 1), 1 -> 2 (Opción 2), etc.
    
    if (numeroOpcion === 1) {
      return <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-bold whitespace-nowrap">⭐ Opción 1</span>;
    }
    if (numeroOpcion === 2) {
      return <span className="bg-blue-100 text-blue-900 text-xs px-2 py-0.5 rounded font-bold whitespace-nowrap">Opción 2</span>;
    }
    if (numeroOpcion === 3) {
      return <span className="bg-slate-100 text-slate-800 text-xs px-2 py-0.5 rounded font-bold whitespace-nowrap">Opción 3</span>;
    }
    return <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded font-bold whitespace-nowrap">Alternativa #{numeroOpcion}</span>;
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      {/* Columna Izquierda: Tarjetas y Pitch de Ventas */}
      <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto px-2">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-slate-800 text-sm">
          <p className="font-semibold text-blue-900 mb-1">🎯 Objetivo Logístico:</p>
          Evaluar la conectividad y factibilidad operativa de propiedades con respecto a <strong>{puntoInteresNombre}</strong>, optimizando costos e inversión por m².
        </div>

        {propiedades.map((prop, idx) => {
          const isSelected = selectedId === prop.id;

          return (
            <div
              key={prop.id}
              onClick={() => setSelectedId(prop.id)}
              className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 relative ${
                isSelected
                  ? "border-blue-600 bg-white shadow-lg scale-[1.01]"
                  : "border-gray-200 bg-white hover:border-blue-300 shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="font-bold text-slate-900 text-base leading-snug">{prop.title}</h3>
                {getBadgeOption(idx)}
              </div>
              
              <p className="text-sm font-medium text-slate-500 mb-3">{prop.localidad}</p>

              <div className="grid grid-cols-2 gap-2 text-xs mb-3 bg-gray-50 p-2.5 rounded-lg">
                <div>
                  <span className="text-gray-500 block">Precio Total:</span>
                  <span className="font-bold text-slate-800">{prop.precio}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Valor / m² Cubierto:</span>
                  <span className="font-bold text-emerald-600">{prop.precioM2}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Sup. Cubierta:</span>
                  <span className="font-bold text-slate-800">{prop.supCubierta}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Sup. Terreno:</span>
                  <span className="font-bold text-slate-800">{prop.supTerreno}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs mb-3">
                <div className="flex items-center text-slate-700">
                  <span className="mr-1">🚚</span>
                  <strong>Ruta a {puntoInteresNombre}:</strong>&nbsp;{prop.tiempoRuta}
                </div>
                {prop.ahorroTiempo && (
                  <div className="flex items-center text-emerald-700 font-medium">
                    <span className="mr-1">⚡</span>
                    {prop.ahorroTiempo}
                  </div>
                )}
                {prop.aptitud && (
                  <p className="text-slate-600 text-xs mt-2 border-t pt-2 italic">
                    "{prop.aptitud}"
                  </p>
                )}
              </div>

              {/* Botón / Enlace a la Ficha Completa de la Propiedad */}
              {prop.slug && (
                <div className="pt-2 border-t border-gray-100 flex justify-end">
                  <Link
                    href={`/propiedades/${prop.slug}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()} // Evita activar el onClick del card
                    className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-semibold gap-1 hover:underline"
                  >
                    Ver Ficha Completa ↗
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Columna Derecha: Mapa Interactivo Leaflet */}
      <div className="lg:col-span-7 bg-slate-100 rounded-2xl overflow-hidden shadow-md border border-gray-200">
        {selectedProp && (
          <MapaPropuesta
            selectedProp={selectedProp}
            destinoCoords={destinoCoords}
            puntoInteresNombre={puntoInteresNombre}
          />
        )}
      </div>
    </div>
  );
}