'use client';

import { usePropertyFilters } from '@/features/filtrado/index';
import type { TipoInmueble } from '@prisma-client';
import { styles } from './resultados.styles';
import { MonedaEnum } from '@/prisma/generated/enums';
import { ZonaServer } from '@/types/server-data';

interface PanelFiltrosProps {
    localidades: ZonaServer[];
    subtipos: TipoInmueble[];
}
export default function PanelFiltros({ localidades, subtipos }: PanelFiltrosProps) {

    const { filters, setFilter, toggleArrayFilter, clearAllFilters } = usePropertyFilters();

    // Agrupamos en 3 niveles: MacroZona (GBA Sur) -> Partido (Berazategui) -> Localidades
    const localidadesEstructuradas = localidades.reduce((acc, loc: any) => {
        const partidoNodo = loc.padre;        // Ej: Berazategui
        const regionNodo = loc.padre?.padre; // Ej: GBA Sur

        const regionNombre = regionNodo?.nombre || 'Otras Regiones';
        const partidoNombre = partidoNodo?.nombre || 'General';

        if (!acc[regionNombre]) acc[regionNombre] = {};
        if (!acc[regionNombre][partidoNombre]) acc[regionNombre][partidoNombre] = [];

        acc[regionNombre][partidoNombre].push(loc);
        return acc;
    }, {} as Record<string, Record<string, typeof localidades>>);

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
                        className="text-xs font-spartan font-bold uppercase  text-amber-600 hover:underline tracking-wider"
                    >
                        Limpiar Todo ✕
                    </button>
                </div>
            )}

            {/* FILTRO DE OPERACIÓN (CATEGORÍA) */}
            <div className={styles.filterSection}>
                <h4 className={styles.filterTitle}>Operación</h4>
                <div className="flex gap-1 flex-wrap">
                    {[
                        { label: 'Todas', value: null },
                        { label: 'Alquiler', value: 'alquiler' },
                        { label: 'Venta', value: 'venta' }
                    ].map((op) => (
                        <button
                            key={`cat-${op.label}`}
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

            {/* FILTRO DE TIPO DE MERCADO (INDUSTRIAL, RESIDENCIAL, O COMERCIAL) */}
            <div className={styles.filterSection}>
                <h4 className={styles.filterTitle}>Tipo de inmueble</h4>
                <div className="flex gap-1 flex-wrap">
                    {[
                        { label: 'Todas', value: null },
                        { label: 'Industrial', value: 'industrial' },
                        { label: 'Residencial', value: 'residencial' },
                        { label: 'Comercial', value: 'comercial' }
                    ].map((op) => (
                        <button
                            key={`tipo-${op.label}`}
                            type="button"
                            onClick={() => setFilter('mercado', op.value)}
                            className={`px-3 py-1.5 text-xs font-spartan font-bold uppercase rounded-lg border transition-colors ${(filters.mercado === op.value || (!filters.mercado && op.value === null))
                                ? 'bg-brand-dark text-white border-brand-dark'
                                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                                }`}
                        >
                            {op.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* TIPO DE INMUEBLE */}
            {subtipos.length > 0 && (
                <div className={styles.filterSection}>
                    <details className="group" open>
                        <summary className="flex justify-between items-center cursor-pointer select-none pb-1">
                            <h4 className={styles.filterTitle}>Categoría Específica</h4>
                            <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="space-y-2 pt-2">
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
                    </details>
                </div>
            )}
            {/* LOCALIDADES Y ZONAS */}
            <div className={styles.filterSection}>
                <h4 className={styles.filterTitle}>Localidades y Zonas</h4>

                <div className="space-y-2 pt-2">
                    {Object.entries(localidadesEstructuradas).map(([regionNombre, partidos]) => {
                        // Revisa si hay algún checkbox activo en esta Macro Zona (ej: GBA Sur)
                        const isRegionActive = Object.values(partidos).some((locs) =>
                            locs.some((loc) => filters.localidades.includes(String(loc.id)))
                        );

                        return (
                            <details
                                key={regionNombre}
                                className="group border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs transition-all"
                                open={isRegionActive}
                            >
                                {/* NIVEL 1: MACRO REGIÓN (Ej: GBA SUR) */}
                                <summary className="flex justify-between items-center cursor-pointer select-none p-3 bg-slate-100 hover:bg-slate-200/70 transition-colors">
                                    <span className="text-xs font-spartan font-bold uppercase text-brand-dark tracking-wider flex items-center gap-1.5">
                                        🗺️ {regionNombre}
                                    </span>
                                    <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                                </summary>

                                {/* NIVEL 2: PARTIDOS (Ej: Berazategui, Quilmes, Florencio Varela) */}
                                <div className="p-2 space-y-2 bg-slate-50/50 border-t border-slate-200">
                                    {Object.entries(partidos).map(([partidoNombre, locs]) => {
                                        const isPartidoActive = locs.some((loc) =>
                                            filters.localidades.includes(String(loc.id))
                                        );

                                        return (
                                            <details
                                                key={partidoNombre}
                                                className="group/partido border border-slate-200 rounded-lg bg-white p-2.5 transition-all"
                                                open={isPartidoActive}
                                            >
                                                <summary className="flex justify-between items-center cursor-pointer select-none text-[11px] font-spartan font-bold uppercase text-amber-800 tracking-wider">
                                                    <span>📍 {partidoNombre}</span>
                                                    <span className="text-[10px] text-slate-400 group-open/partido:rotate-180 transition-transform">▼</span>
                                                </summary>

                                                {/* NIVEL 3: LOCALIDADES (Ej: G.E. Hudson, Sourigues, Ranelagh) */}
                                                <div className="space-y-1.5 pt-2 pl-2 border-t border-slate-100 mt-1.5">
                                                    {locs.map((loc) => (
                                                        <label key={loc.id} className={styles.checkboxLabel}>
                                                            <input
                                                                type="checkbox"
                                                                checked={filters.localidades.includes(String(loc.id))}
                                                                onChange={(e) => toggleArrayFilter('localidad', String(loc.id), e.target.checked)}
                                                                className="accent-brand-dark cursor-pointer"
                                                            />
                                                            <span>{loc.nombre}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </details>
                                        );
                                    })}
                                </div>
                            </details>
                        );
                    })}
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