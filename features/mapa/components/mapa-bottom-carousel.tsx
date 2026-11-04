// features/mapa/components/mapa-bottom-carousel.tsx
'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { PropiedadMapaItem } from '../types/mapa-types';
import { MapaPropertyCardCompact } from './mapa-property-card-compact';

interface MapaBottomCarouselProps {
  isOpen: boolean;
  propiedades: PropiedadMapaItem[];
  onClose: () => void;
  isPrivateAdmin?: boolean;
}

export function MapaBottomCarousel({
  isOpen,
  propiedades,
  onClose,
  isPrivateAdmin = false,
}: MapaBottomCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [indiceActual, setIndiceActual] = useState(0);

  if (!isOpen || propiedades.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Permite desplazar con la rueda del mouse en desktop
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current && e.deltaY !== 0) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  // Detecta qué tarjeta está visible para actualizar el badge "1 de 4"
  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 300;
      const index = Math.round(scrollLeft / cardWidth);
      setIndiceActual(Math.min(index, propiedades.length - 1));
    }
  };

  return (
    <div className="absolute bottom-3 left-0 right-0 z-1000 px-2 sm:px-4 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
      <div className="max-w-5xl mx-auto flex flex-col items-end gap-1.5 relative">
        
        {/* Fila superior: Indicador de unidades (mobile) + Botón cerrar */}
        <div className="w-full flex items-center justify-between px-2">
          {propiedades.length > 1 ? (
            <span className="pointer-events-auto bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <span>🏢 {indiceActual + 1} de {propiedades.length}</span>
              <span className="text-slate-400 font-normal ml-0.5 sm:hidden">desliza para ver más ➔</span>
            </span>
          ) : <div />}

          <button
            type="button"
            onClick={onClose}
            className="pointer-events-auto bg-white/95 hover:bg-white text-slate-700 shadow-md rounded-full p-1.5 border border-slate-200 transition hover:scale-105 active:scale-95"
            title="Cerrar vista previa"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Marco con ancho completo y padding lateral para no superponer flechas */}
        <div className="w-full relative">
          {/* Flecha Izquierda Desktop (Fuera del flujo de las cards) */}
          {propiedades.length > 1 && (
            <button
              type="button"
              onClick={() => scroll('left')}
              className="hidden md:flex pointer-events-auto absolute left-1 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white text-slate-800 shadow-xl rounded-full p-2.5 border border-slate-200 transition hover:scale-110 active:scale-95 items-center justify-center"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
          )}

          {/* 
            Contenedor de Scroll:
            - px-12 asegura que la primera y última card nunca queden debajo de las flechas.
            - w-full + overflow-x-auto permite el scroll natural.
          */}
          <div
            ref={scrollRef}
            onWheel={handleWheel}
            onScroll={handleScroll}
            className="pointer-events-auto w-full overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth px-2 md:px-12"
          >
            {/* 
              Contenedor Interior Centrador:
              - w-max y min-w-full con mx-auto centra 1 o 2 cards automáticamente.
              - Si hay muchas cards, no produce el recorte de justify-center.
            */}
            <div className="w-max min-w-full flex items-center justify-center gap-4 mx-auto">
              {propiedades.map((prop) => (
                <div key={prop.id} className="snap-center shrink-0">
                  <MapaPropertyCardCompact
                    propiedad={prop}
                    isPrivateAdmin={isPrivateAdmin}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Flecha Derecha Desktop */}
          {propiedades.length > 1 && (
            <button
              type="button"
              onClick={() => scroll('right')}
              className="hidden md:flex pointer-events-auto absolute right-1 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white text-slate-800 shadow-xl rounded-full p-2.5 border border-slate-200 transition hover:scale-110 active:scale-95 items-center justify-center"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5 text-slate-700" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}