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
    <main className="max-w-[1500px] mx-auto px-3 sm:px-4 py-2 space-y-2 h-[calc(100dvh-4rem)] md:h-[calc(100dvh-7rem)] flex flex-col overflow-hidden">
      {/* HEADER SUPERIOR COMPACTO */}
      <div className="flex items-center justify-between shrink-0 ">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="pt-3 text-lg sm:text-xl font-bold font-spartan text-slate-900 leading-tight">
              Mapa Interactivo de Propiedades
            </h1>
            <p className="text-slate-500 text-[11px]">
              Mostrando <span className="font-bold text-brand-dark">{propiedades.length}</span> inmuebles ubicados
            </p>
          </div>

          {isPending && (
            <span className="text-[11px] font-spartan font-bold text-amber-700 animate-pulse bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              Actualizando...
            </span>
          )}
        </div>

        <Link
          href={listaUrl}
          className="hidden md:inline-flex text-[11px] font-spartan font-bold uppercase tracking-wider text-brand-dark px-3.5 py-1.5 bg-white border border-slate-300 rounded-xl shadow-xs hover:bg-slate-50 transition items-center gap-1.5"
        >
          ☰ Ver en Lista
        </Link>
      </div>

      {/* BARRA MOBILE */}
      <div className="flex md:hidden gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex-1 py-2 bg-white border border-slate-300 rounded-xl text-xs font-spartan font-bold uppercase text-slate-700 flex items-center justify-center gap-2 shadow-sm"
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
          className="flex-1 py-2 bg-brand-dark text-white rounded-xl text-xs font-spartan font-bold uppercase flex items-center justify-center gap-1 shadow-sm"
        >
          ☰ Ver Lista
        </Link>
      </div>

      <MobileFilterDrawer
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        zonasPadre={zonasPadre}
        partidos={partidos}
        subtipos={subtipos}
      />

      {/* GRID PRINCIPAL: LLENA EXACTAMENTE EL ALTO RESTANTE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch flex-1 min-h-0 overflow-hidden">
        {/* ASIDE CON SCROLL INDEPENDIENTE */}
        <aside className="hidden md:block rounded-2xl border border-slate-200 shadow-sm space-y-3 h-full overflow-y-auto scrollbar-thin">

          <DesktopFilterSidebar
            zonasPadre={zonasPadre}
            partidos={partidos}
            subtipos={subtipos}
          />
        </aside>

        {/* MAPA A PANTALLA COMPLETA */}
        <section className="md:col-span-3 h-full min-h-0 relative">
          <MapaPropiedades
            propiedades={propiedades}
            centroInicial={centroInicial}
            zoomInicial={zoomInicial}
            alturaClass="h-full w-full"
          />
        </section>
      </div>
    </main>
  );
}