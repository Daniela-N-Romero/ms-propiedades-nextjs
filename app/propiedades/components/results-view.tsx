'use client';

import { usePropertyFilters } from '@/features/filtrado/hooks/use-property-filters';
import { PropertyCard } from '@/features/propiedades';
import PanelFiltros from './panel-filtros';
import OrdenarSelect from './ordenar-select';
import { styles } from '../resultados.styles';
import type { Zona, Propiedad } from '@prisma-client';

type PropertyWithZona = Propiedad & { zona: Zona };

interface ResultsViewProps {
  propiedades: PropertyWithZona[];
  localidades: Zona[];
  subtipos: string[];
}

export default function ResultsView({ propiedades, localidades, subtipos }: ResultsViewProps) {
  const { filters } = usePropertyFilters();

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

      {/* BARRA MOBILE */}
      <div className={styles.mobileStatusBar}>
        <button className={styles.mobileBtn}>
          <span>Image Filtros</span>
          {filters.totalActivos > 0 && <span className={styles.filterBadge}>{filters.totalActivos}</span>}
        </button>
        <button className={styles.mobileBtn}>
          <span>🗺️ Ver Mapa</span>
        </button>
      </div>

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