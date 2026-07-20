'use client';

import { usePropertyFilters } from '@/features/filtrado/hooks/use-property-filters';
import type { Zona } from '@prisma-client';
import { styles } from '../resultados.styles';
import { TipoPropiedadEnum, MonedaEnum } from '@/prisma/generated/enums';

interface PanelFiltrosProps {
  localidades: Zona[];
  subtipos: string[]; 
}
export default function PanelFiltros({ localidades, subtipos }: PanelFiltrosProps) {

    const { filters, setFilter, toggleArrayFilter } = usePropertyFilters();

    return (
        <div className="space-y-6">
            {/* TIPO DE INMUEBLE INDUSTRIAL */}
            {subtipos.length > 0 && (
        <div className={styles.filterSection}>
          <h4 className={styles.filterTitle}>Categoría Específica</h4>
          <div className="space-y-2">
            {subtipos.map(s => (
              <label key={s} className={styles.checkboxLabel}>
                <input 
                  type="radio" 
                  name="subtipo"
                  checked={filters.subtipo === s}
                  onChange={(e) => setFilter('subtipo', e.target.checked ? s : null)}
                  className="accent-brand-dark"
                />
                <span className="capitalize">{s}</span>
              </label>
            ))}
          </div>
        </div>
      )}

            {/* CHECKBOXES LOCALIDADES */}
            <div className={styles.filterSection}>
                <h4 className={styles.filterTitle}>Localidades</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {localidades.map(loc => (
                        <label key={loc.id} className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={filters.localidades.includes(String(loc.id))}
                                onChange={(e) => toggleArrayFilter('localidad', String(loc.id), e.target.checked)}
                                className="accent-brand-dark"
                            />
                            <span>{loc.nombre}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* FILTRO MONEDA */}
            <div className={styles.filterSection}>
                <h4 className={styles.filterTitle}>Moneda</h4>
                <div className="flex gap-4">
                    {Object.values(MonedaEnum).map(m => (
                        <label key={m} className={styles.checkboxLabel}>
                            <input
                                type="radio"
                                name="moneda"
                                checked={filters.moneda === m}
                                onChange={() => setFilter('moneda', m)}
                                className="accent-brand-dark"
                            />
                            <span>{m}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* RANGO DE PRECIO CON LLAVE DE MONEDA DINÁMICA */}
            <div className={styles.filterSection}>
                <h4 className={styles.filterTitle}>Rango de Precio ({filters.moneda})</h4>
                <div className="flex gap-2 items-center">
                    <input
                        key={`${filters.moneda}-min`} // Fuerza a resetear la vista visual si cambia la moneda
                        type="number"
                        placeholder="Min"
                        className={styles.inputRango}
                        defaultValue={filters.precioMin}
                        onBlur={(e) => setFilter('precioMin', e.target.value || null)}
                    />
                    <span className="text-slate-400 text-xs">-</span>
                    <input
                        key={`${filters.moneda}-max`}
                        type="number"
                        placeholder="Max"
                        className={styles.inputRango}
                        defaultValue={filters.precioMax}
                        onBlur={(e) => setFilter('precioMax', e.target.value || null)}
                    />
                </div>
            </div>

            {/* RANGO DE SUPERFICIE */}
            <div className={styles.filterSection}>
                <h4 className={styles.filterTitle}>Superficie Total (m²)</h4>
                <div className="flex gap-2 items-center">
                    <input
                        type="number"
                        placeholder="Min m²"
                        className={styles.inputRango}
                        defaultValue={filters.supMin}
                        onBlur={(e) => setFilter('supMin', e.target.value || null)}
                    />
                    <span className="text-slate-400 text-xs">-</span>
                    <input
                        type="number"
                        placeholder="Max m²"
                        className={styles.inputRango}
                        defaultValue={filters.supMax}
                        onBlur={(e) => setFilter('supMax', e.target.value || null)}
                    />
                </div>
            </div>
        </div>
    );
}