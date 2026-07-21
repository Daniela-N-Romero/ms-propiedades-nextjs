'use client';

import { PropertyCard } from '@/features/propiedades';
import { PanelFiltros,  OrdenarSelect, usePropertyFilters } from '../index';
import { styles } from './resultados.styles';
import type { Zona, Propiedad, TipoInmueble } from '@prisma-client';
import { useState } from 'react';
import { PropertyWithZona } from '@/types/propiedad';

interface ResultsViewProps {
  propiedades: PropertyWithZona[];
  localidades: Zona[];
  subtipos: TipoInmueble[];
}

export default function ResultsView({ propiedades, localidades, subtipos }: ResultsViewProps) {
  const { filters } = usePropertyFilters();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  return (
    <main className={styles.container}>
      {/* LEYENDA SUPERIOR */}
      <div className={styles.headerBar}>
        <div className={styles.leyenda}>
          Mostrando <span className={styles.strongEmphasis}>{propiedades.length}</span> propiedades 
          {filters.categoria ? ` en ${filters.categoria}` : ''}
        </div>
        <div className={styles.topControlsDesktop}>
          <button className="text-xs font-spartan font-bold uppercase tracking-wider text-brand-dark px-4 py-1.5 bg-white border border-slate-300 rounded-lg shadow-sm">
            🗺️ Ver Mapa
          </button>
        </div>
      </div>

      {/* 📱 BARRA DE BOTONES MOBILE */}
      <div className={styles.mobileStatusBar}>
        <button 
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)} // 👈 Abre el modal mobile
          className={styles.mobileBtn}
        >
          <span>Filtros</span>
          {filters.totalActivos > 0 && (
            <span className={styles.filterBadge}>{filters.totalActivos}</span>
          )}
        </button>
        
        <button type="button" className={styles.mobileBtn}>
          <span>🗺️ Ver Mapa</span>
        </button>
      </div>

      {/* MODAL FLOTANTE DE FILTROS EN MOBILE */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Fondo traslúcido oscuro */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileFiltersOpen(false)}
          />

          {/* Panel deslizante lateral */}
          <div className="relative mt-20 ml-auto w-full max-w-xs bg-white shadow-2xl flex flex-col z-10 overflow-hidden">
            
            {/* Header del modal */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-spartan font-bold text-sm text-brand-dark uppercase tracking-wider">
                Filtrar Propiedades
              </h3>
              <button 
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 font-bold hover:bg-slate-300"
              >
                ✕
              </button>
            </div>

            {/* Contenido scrolleable con el panel de filtros */}
            <div className="p-5 overflow-y-auto flex-1">
              <PanelFiltros localidades={localidades} subtipos={subtipos} />
            </div>

            {/* Footer fijo del modal */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full bg-brand-dark text-white font-spartan font-bold uppercase tracking-wider py-3 rounded-xl text-xs"
              >
                Ver {propiedades.length} Resultados
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CUERPO PRINCIPAL */}
      <div className={styles.layoutGrid}>
        <aside className={styles.asideDesktop}>
          <h3 className="font-spartan font-bold text-sm text-brand-dark uppercase tracking-wider border-b border-slate-100 pb-2">
            Filtrar Resultados
          </h3>
          <PanelFiltros localidades={localidades} subtipos={subtipos}/>
        </aside>

        <section className={styles.mainContent}>
          <div className="flex justify-end mb-4">
            <OrdenarSelect />
          </div>

          <div className={styles.cardsGrid}>
            {propiedades.map((prop) => (
              <PropertyCard key={prop.id} propiedad={prop as any} />
            ))}
          </div>

          {propiedades.length === 0 && (
            <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
              <p className="text-slate-400 font-medium">No se encontraron propiedades.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}