'use client';

import { PropertyCard } from '@/features/propiedades';
import { OrdenarSelect } from '../index';
import { DesktopFilterSidebar } from './desktop-filter-sidebar';
import { MobileFilterDrawer } from './mobile-filter-drawer';
import { ZonaPadre, PartidoConLocalidades } from './filtro-zonas-jerarquico';
import { styles } from './resultados.styles';
import type { TipoInmueble } from '@prisma-client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { PropertyFullData, ZonaServer } from '@/types/server-data';
import { useFilterDraft } from '../hooks/use-filter-draft';

interface ResultsViewProps {
  propiedades: PropertyFullData[];
  localidades: ZonaServer[];
  subtipos: TipoInmueble[];
  zonasPadre?: ZonaPadre[];
  partidos?: PartidoConLocalidades[];
  esFallback?: boolean;
  totalPropiedades?: number;
  currentPage?: number;
  totalPages?: number;
}

export default function ResultsView({
  propiedades,
  localidades,
  subtipos,
  zonasPadre = [],
  partidos = [],
  esFallback,
  totalPropiedades = propiedades.length,
  currentPage = 1,
  totalPages = 1,
}: ResultsViewProps) {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const { activeCount, isPending } = useFilterDraft();

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
          </div>

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
          {activeCount > 0 && (
            <span className={styles.filterBadge}>{activeCount}</span>
          )}
        </button>

        <Link href={mapaUrl} className={styles.mobileBtn}>
          🗺️ Ver Mapa
        </Link>
      </div>

      {/* MODAL MÓVIL AISLADO CON BATCH-APPLY */}
      <MobileFilterDrawer
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        zonasPadre={zonasPadre}
        partidos={partidos}
        subtipos={subtipos as any}
      />

      {/* CUERPO PRINCIPAL */}
      <div className={styles.layoutGrid}>
        {/* SIDEBAR DESKTOP CON BATCH-APPLY */}
        <aside className={styles.asideDesktop}>
          <DesktopFilterSidebar
            zonasPadre={zonasPadre}
            partidos={partidos}
            subtipos={subtipos as any}
          />
        </aside>

        <section className={styles.mainContent}>
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