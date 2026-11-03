'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useFilterDraft, DesktopFilterSidebar, MobileFilterDrawer } from '@/features/filtrado';
import type { ZonaPadre, PartidoConLocalidades, SubtipoOption } from '@/features/filtrado';
import MapaPropiedades from './mapa-propiedades';
import type { PropiedadMapaItem } from '../types/mapa-types';
import { buildListUrlFromMapParams } from '../utils/mapa-navigation';

interface MapaResultsViewProps {
  propiedades: PropiedadMapaItem[];
  zonasPadre: ZonaPadre[];
  partidos: PartidoConLocalidades[];
  subtipos: SubtipoOption[];
  centroInicial?: [number, number];
  zoomInicial?: number;
}

export default function MapaResultsView({
  propiedades,
  zonasPadre,
  partidos,
  subtipos,
  centroInicial,
  zoomInicial,
}: MapaResultsViewProps) {
  const { activeCount, isPending } = useFilterDraft();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const searchParams = useSearchParams();

  const listaUrl = buildListUrlFromMapParams(searchParams);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* HEADER SUPERIOR */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-spartan text-slate-900">
              Mapa Interactivo de Propiedades
            </h1>
            <p className="text-slate-500 text-xs">
              Mostrando <span className="font-bold text-brand-dark">{propiedades.length}</span> inmuebles ubicados
            </p>
          </div>

          {isPending && (
            <span className="text-xs font-spartan font-bold text-amber-700 animate-pulse bg-amber-50 px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Actualizando mapa...
            </span>
          )}
        </div>

        <Link
          href={listaUrl}
          className="hidden md:inline-flex text-xs font-spartan font-bold uppercase tracking-wider text-brand-dark px-4 py-2 bg-white border border-slate-300 rounded-xl shadow-xs hover:bg-slate-50 transition-all items-center gap-1.5"
        >
          ☰ Ver en Lista
        </Link>
      </div>

      {/* BARRA MOBILE */}
      <div className="flex md:hidden gap-2">
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex-1 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-spartan font-bold uppercase text-slate-700 flex items-center justify-center gap-2 shadow-sm"
        >
          <span>Filtros</span>
          {activeCount > 0 && (
            <span className="bg-brand-orange text-slate-950 font-bold px-2 py-0.5 rounded-full text-[10px]">
              {activeCount}
            </span>
          )}
        </button>

        <Link
          href={listaUrl}
          className="flex-1 py-2.5 bg-brand-dark text-white rounded-xl text-xs font-spartan font-bold uppercase flex items-center justify-center gap-1 shadow-sm"
        >
          ☰ Ver Lista
        </Link>
      </div>

      {/* DRAWER MOBILE CON BATCHING */}
      <MobileFilterDrawer
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        zonasPadre={zonasPadre}
        partidos={partidos}
        subtipos={subtipos}
      />

      {/* LAYOUT PRINCIPAL DESKTOP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        <aside className="hidden md:block bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb-brand-dark/75 scrollbar-track-gray-100">
          <h3 className="font-spartan font-bold text-sm text-brand-dark uppercase tracking-wider border-b border-slate-100 pb-2">
            Filtrar Ubicaciones
          </h3>
          <DesktopFilterSidebar
            zonasPadre={zonasPadre}
            partidos={partidos}
            subtipos={subtipos}
          />
        </aside>

        <section className="md:col-span-3">
          <MapaPropiedades
            propiedades={propiedades}
            centroInicial={centroInicial}
            zoomInicial={zoomInicial}
            alturaClass="h-[calc(100vh-140px)] min-h-[500px]"
          />
        </section>
      </div>
    </main>
  );
}