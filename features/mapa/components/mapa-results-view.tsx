'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PanelFiltros, usePropertyFilters } from '@/features/filtrado';
import MapaPropiedades from './mapa-propiedades';
import type { Zona, TipoInmueble } from '@prisma-client';
import type { PropiedadMapaItem } from './mapa-propiedades-view';

interface MapaResultsViewProps {
  propiedades: PropiedadMapaItem[];
  localidades: Zona[];
  subtipos: TipoInmueble[];
}

export default function MapaResultsView({
  propiedades,
  localidades,
  subtipos,
}: MapaResultsViewProps) {
  const { filters } = usePropertyFilters();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* LEYENDA SUPERIOR & BOTÓN TOGGLE A VISTA DE LISTA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-spartan text-slate-900">
            Mapa Interactivo de Propiedades
          </h1>
          <p className="text-slate-500 text-xs">
            Mostrando <span className="font-bold text-brand-dark">{propiedades.length}</span> inmuebles ubicados
          </p>
        </div>

        {/* Botón para cambiar a Vista de Lista / Grilla */}
        <Link
          href="/propiedades/industrial"
          className="hidden md:inline-flex text-xs font-spartan font-bold uppercase tracking-wider text-brand-dark px-4 py-2 bg-white border border-slate-300 rounded-xl shadow-sm hover:bg-slate-50 transition-all items-center gap-1.5"
        >
          ☰ Ver en Lista
        </Link>
      </div>

      {/* 📱 BARRA BOTONES EN MOBILE */}
      <div className="flex md:hidden gap-2">
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex-1 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-spartan font-bold uppercase text-slate-700 flex items-center justify-center gap-2 shadow-sm"
        >
          <span>Filtros</span>
          {filters.totalActivos > 0 && (
            <span className="bg-brand-orange text-slate-950 px-1.5 py-0.5 rounded-full text-[10px]">
              {filters.totalActivos}
            </span>
          )}
        </button>

        <Link
          href="/propiedades/industrial"
          className="flex-1 py-2.5 bg-brand-dark text-white rounded-xl text-xs font-spartan font-bold uppercase flex items-center justify-center gap-1 shadow-sm"
        >
          ☰ Ver Lista
        </Link>
      </div>

      {/* 📱 MODAL FLOTANTE DE FILTROS EN MOBILE (Igual a ResultsView) */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileFiltersOpen(false)}
          />

          <div className="relative mt-16 ml-auto w-full max-w-xs bg-white shadow-2xl flex flex-col z-10 overflow-hidden rounded-l-2xl">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-spartan font-bold text-sm text-brand-dark uppercase tracking-wider">
                Filtrar Mapa
              </h3>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              <PanelFiltros localidades={localidades} subtipos={subtipos} />
            </div>

            <div className="p-4 border-t border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full bg-brand-dark text-white font-spartan font-bold uppercase tracking-wider py-3 rounded-xl text-xs"
              >
                Ver {propiedades.length} Propiedades en Mapa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUERPO PRINCIPAL DESKTOP (Grid 1/4 Filtros - 3/4 Mapa) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* PANEL LATERAL DE FILTROS DESKTOP */}
        <aside className="hidden md:block bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-spartan font-bold text-sm text-brand-dark uppercase tracking-wider border-b border-slate-100 pb-2">
            Filtrar Ubicaciones
          </h3>
          <PanelFiltros localidades={localidades} subtipos={subtipos} />
        </aside>

        {/* SECCIÓN PRINCIPAL DEL MAPA */}
        <section className="md:col-span-3">
          <MapaPropiedades propiedades={propiedades} />
        </section>
      </div>
    </main>
  );
}