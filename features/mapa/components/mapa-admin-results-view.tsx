'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PanelFiltros, usePropertyFilters } from '@/features/filtrado';
import MapaPropiedades from './mapa-propiedades';
import type { TipoInmueble } from '@prisma-client';
import type { PropiedadMapaItem } from './mapa-propiedades-view';
import { ZonaServer } from '@/types/server-data';

interface MapaAdminResultsViewProps {
  propiedades: PropiedadMapaItem[];
  localidades: ZonaServer[];
  subtipos: TipoInmueble[];
}

export default function MapaAdminResultsView({
  propiedades,
  localidades,
  subtipos,
}: MapaAdminResultsViewProps) {
  const { filters } = usePropertyFilters();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* LEYENDA Y HEADER INTERNO */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-spartan text-slate-900">
            🗺️ Mapa Privado de Administración
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Mostrando <span className="font-bold text-slate-900">{propiedades.length}</span> inmuebles geolocalizados
          </p>
        </div>

        {/* LEYENDA DE COLORES DE CARTERA */}
        <div className="hidden sm:flex items-center gap-3 text-xs font-bold">
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Cartera Propia</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            <span>De Colega</span>
          </div>
        </div>
      </div>

      {/* BOTÓN MOBILE PARA FILTROS */}
      <div className="flex md:hidden">
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="w-full py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-spartan font-bold uppercase text-slate-700 flex items-center justify-center gap-2 shadow-sm"
        >
          <span>Filtros del Mapa</span>
          {filters.totalActivos > 0 && (
            <span className="bg-brand-orange text-slate-950 px-1.5 py-0.5 rounded-full text-[10px]">
              {filters.totalActivos}
            </span>
          )}
        </button>
      </div>

      {/* MODAL FLOTANTE DE FILTROS EN MOBILE */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileFiltersOpen(false)}
          />

          <div className="relative mt-16 ml-auto w-full max-w-xs bg-white shadow-2xl flex flex-col z-10 overflow-hidden rounded-l-2xl">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-spartan font-bold text-sm text-slate-900 uppercase tracking-wider">
                Filtrar Mapa Privado
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
                className="w-full bg-slate-900 text-white font-spartan font-bold uppercase tracking-wider py-3 rounded-xl text-xs"
              >
                Ver {propiedades.length} Propiedades en Mapa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUERPO PRINCIPAL (GRID: 1 COLUMNA FILTROS - 3 COLUMNAS MAPA) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* PANEL LATERAL DE FILTROS DESKTOP */}
        <aside className="hidden md:block bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto scrollbar-thin">
          <h3 className="font-spartan font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Filtros del Mapa
          </h3>
          <PanelFiltros localidades={localidades} subtipos={subtipos} />
        </aside>

        {/* MAPA PRINCIPAL */}
        <section className="md:col-span-3">
          <MapaPropiedades
            propiedades={propiedades}
            alturaClass="h-[calc(100vh-160px)] min-h-[500px]"
            isPrivateAdmin={true} 
          />
        </section>
      </div>
    </div>
  );
}