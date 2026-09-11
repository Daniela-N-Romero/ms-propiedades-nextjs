'use client';

import { PropertyCard } from '@/features/propiedades';
import { PanelFiltros, OrdenarSelect, usePropertyFilters } from '../index';
import { styles } from './resultados.styles';
import type { TipoInmueble } from '@prisma-client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { PropertyFullData, ZonaServer } from '@/types/server-data';

interface ResultsViewProps {
  propiedades: PropertyFullData[];
  localidades: ZonaServer[];
  subtipos: TipoInmueble[];
  esFallback?: boolean;
  // Props de paginación
  totalPropiedades?: number;
  currentPage?: number;
  totalPages?: number;
}

export default function ResultsView({
  propiedades,
  localidades,
  subtipos,
  esFallback,
  totalPropiedades = propiedades.length,
  currentPage = 1,
  totalPages = 1,
}: ResultsViewProps) {
  const { filters, isPending } = usePropertyFilters();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const mercadoActual = pathname.split('/')[2];
  const params = new URLSearchParams(searchParams.toString());

  if (['industrial', 'residencial', 'comercial'].includes(mercadoActual)) {
    if (!params.has('mercado')) {
      params.set('mercado', mercadoActual);
    }
  }

  const mapaUrl = `/propiedades/mapa?${params.toString()}`;

  // Función para cambiar de página conservando los demás filtros de la URL
  const handlePageChange = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('page', newPage.toString());
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  return (
    <main className={styles.container}>
      {/* LEYENDA SUPERIOR CON INDICADOR DE CARGA */}
      <div className={styles.headerBar}>
        <div className="flex items-center gap-3 flex-wrap">
          <div className={styles.leyenda}>
            Mostrando{' '}
            <span className={styles.strongEmphasis}>{propiedades.length}</span>{' '}
            de <span className={styles.strongEmphasis}>{totalPropiedades}</span>{' '}
            propiedades
            {filters.categoria ? ` en ${filters.categoria}` : ''}{' '}
            {filters.mercado ? ` de tipo ${filters.mercado}` : ''}
          </div>

          {/* INDICADOR VISUAL MIENTRAS SE APLICAN LOS FILTROS */}
          {isPending && (
            <span className="text-xs font-spartan font-bold text-amber-700 animate-pulse bg-amber-50 px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Aplicando filtros...
            </span>
          )}
        </div>

        <div className={styles.topControlsDesktop}>
          <Link
            href={mapaUrl}
            className="text-xs font-spartan font-bold uppercase tracking-wider text-brand-dark px-4 py-1.5 bg-white border border-slate-300 rounded-lg shadow-xs"
          >
            🗺️ Ver Mapa
          </Link>
        </div>
      </div>

      {/* 📱 BARRA DE BOTONES MOBILE */}
      <div className={styles.mobileStatusBar}>
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className={styles.mobileBtn}
        >
          <img src="/icons/filter-slider-icon.svg" alt="" className="w-4" />
          <span>Filtros</span>
          {filters.totalActivos > 0 && (
            <span className={styles.filterBadge}>{filters.totalActivos}</span>
          )}
        </button>

        <Link href={mapaUrl} className={styles.mobileBtn}>
          🗺️ Ver Mapa
        </Link>
      </div>

      {/* MODAL FLOTANTE DE FILTROS EN MOBILE */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileFiltersOpen(false)}
          />

          <div className="relative mt-20 ml-auto w-full max-w-xs bg-white shadow-2xl flex flex-col z-10 overflow-hidden">
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

            <div className="p-5 overflow-y-auto flex-1">
              <PanelFiltros localidades={localidades} subtipos={subtipos} />
            </div>

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
          <PanelFiltros localidades={localidades} subtipos={subtipos} />
        </aside>

        <section className={styles.mainContent}>
          {/* BANNER AVISO DE FALLBACK */}
          {esFallback && (
            <div className="mb-6 p-4 bg-amber-200/40 border border-amber-300 rounded-2xl flex items-center gap-3 text-amber-900 shadow-sm">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="font-spartan font-bold text-xs uppercase tracking-wider text-amber-800">
                  Sin coincidencias exactas
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  No encontramos propiedades con todos los filtros aplicados.{' '}
                  <span className="font-semibold">Te sugerimos estas alternativas</span> dentro del mismo mercado:
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end mb-4">
            <OrdenarSelect />
          </div>

          <div className={styles.cardsGrid}>
            {propiedades.map((prop) => (
              <PropertyCard key={prop.id} propiedad={prop as any} />
            ))}
          </div>

          {propiedades.length === 0 && (
            <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-2">
              <p className="text-2xl">🔍</p>
              <p className="text-slate-500 font-bold text-sm font-spartan uppercase">
                No se encontraron propiedades
              </p>
              <p className="text-slate-400 text-xs">
                Intente limpiar los filtros para ver más opciones en esta categoría.
              </p>
            </div>
          )}

          {/* CONTROLES DE PAGINACIÓN PÚBLICA */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white p-4 mt-8 rounded-2xl border border-slate-200 shadow-sm">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-4 py-2 text-xs font-spartan font-bold uppercase rounded-xl border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                ← Anterior
              </button>

              <span className="text-xs font-spartan font-bold text-slate-700">
                Página {currentPage} de {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-4 py-2 text-xs font-spartan font-bold uppercase rounded-xl border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                Siguiente →
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}