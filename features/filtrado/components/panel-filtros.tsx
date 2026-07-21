'use client';

import { usePropertyFilters } from '@/features/filtrado/index';
import type { TipoInmueble, Zona } from '@prisma-client';
import { styles } from './resultados.styles';
import { MonedaEnum } from '@/prisma/generated/enums';

interface PanelFiltrosProps {
    localidades: Zona[];
    subtipos: TipoInmueble[];
}
export default function PanelFiltros({ localidades, subtipos }: PanelFiltrosProps) {

    const { filters, setFilter, toggleArrayFilter, clearAllFilters } = usePropertyFilters();

    const localidadesPorPadre = localidades.reduce((acc, loc: any) => {
        const padreNombre = loc.padre?.nombre || 'Otras Zonas';
        if (!acc[padreNombre]) acc[padreNombre] = [];
        acc[padreNombre].push(loc);
        return acc;
    }, {} as Record<string, typeof localidades>);

    return (
        <div className="space-y-6">

            {/* BOTÓN LIMPIAR FILTROS (Muestra si hay al menos 1 filtro activo) */}
            {filters.totalActivos > 0 && (
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs text-slate-500 font-medium">
                        {filters.totalActivos} {filters.totalActivos === 1 ? 'filtro aplicado' : 'filtros aplicados'}
                    </span>
                    <button
                        type="button"
                        onClick={clearAllFilters}
                        className="text-xs font-spartan font-bold uppercase text-brand-orange hover:underline tracking-wider"
                    >
                        Limpiar Todo ✕
                    </button>
                </div>
            )}

            {/* FILTRO DE OPERACIÓN (CATEGORÍA) */}
            <div className={styles.filterSection}>
                <h4 className={styles.filterTitle}>Operación</h4>
                <div className="flex gap-2">
                    {[
                        { label: 'Todas', value: null },
                        { label: 'Alquiler', value: 'alquiler' },
                        { label: 'Venta', value: 'venta' }
                    ].map((op) => (
                        <button
                            key={op.label}
                            type="button"
                            onClick={() => setFilter('categoria', op.value)}
                            className={`px-3 py-1.5 text-xs font-spartan font-bold uppercase rounded-lg border transition-colors ${(filters.categoria === op.value || (!filters.categoria && op.value === null))
                                ? 'bg-brand-dark text-white border-brand-dark'
                                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                                }`}
                        >
                            {op.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* TIPO DE INMUEBLE INDUSTRIAL */}
            {subtipos.length > 0 && (
                <div className={styles.filterSection}>
                    <h4 className={styles.filterTitle}>Categoría Específica</h4>
                    <div className="space-y-2">
                        {subtipos.map((st) => (
                            <label key={st.id} className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={filters.subtipos.includes(st.slug)}
                                    onChange={(e) => toggleArrayFilter('subtipo', st.slug, e.target.checked)}
                                    className="accent-brand-dark"
                                />
                                <span>{st.nombre}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* CHECKBOXES LOCALIDADES */}
            <div className={styles.filterSection}>
                <h4 className={styles.filterTitle}>Localidades Disponibles</h4>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                    {Object.entries(localidadesPorPadre).map(([padreNombre, locs]) => (
                        <div key={padreNombre} className="space-y-1.5">
                            <span className="block text-[10px] font-spartan font-bold uppercase text-brand-orange tracking-wider border-b border-slate-100 pb-0.5">
                                📍 {padreNombre}
                            </span>
                            {locs.map((loc) => (
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

            {/* RANGO DE SUPERFICIE CUBIERTA */}
            <div className={styles.filterSection}>
                <h4 className={styles.filterTitle}>Superficie Cubierta (m²)</h4>
                <div className="flex gap-2 items-center">
                    <input
                        type="number"
                        placeholder="Min m²"
                        className={styles.inputRango}
                        defaultValue={filters.supCubMin}
                        onBlur={(e) => setFilter('supCubMin', e.target.value || null)}
                    />
                    <span className="text-slate-400 text-xs">-</span>
                    <input
                        type="number"
                        placeholder="Max m²"
                        className={styles.inputRango}
                        defaultValue={filters.supCubMax}
                        onBlur={(e) => setFilter('supCubMax', e.target.value || null)}
                    />
                </div>
            </div>

            {/* RANGO DE SUPERFICIE TOTAL*/}
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