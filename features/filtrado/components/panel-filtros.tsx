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

    const { filters, setFilter, toggleArrayFilter, setArrayFilter, clearZonaAndLocalidades, clearAllFilters } = usePropertyFilters();

    // Agrupamos en 3 niveles: MacroZona (GBA Sur) -> Partido (Berazategui) -> Localidades
    const localidadesEstructuradas = localidades.reduce((acc, loc: any) => {
        const partido = loc.padre;
        const region = loc.padre?.padre;

        const regionId = region?.id ? String(region.id) : 'otras';
        const regionNombre = region?.nombre || 'Otras Regiones';
        const partidoId = partido?.id ? String(partido.id) : 'general';
        const partidoNombre = partido?.nombre || 'General';

        if (!acc[regionId]) {
            // Aseguramos guardar el id de la región aquí:
            acc[regionId] = { id: regionId, nombre: regionNombre, partidos: {} };
        }
        if (!acc[regionId].partidos[partidoId]) {
            acc[regionId].partidos[partidoId] = { id: partidoId, nombre: partidoNombre, locs: [] };
        }

        acc[regionId].partidos[partidoId].locs.push(loc);
        return acc;
    }, {} as Record<string, { id: string; nombre: string; partidos: Record<string, { id: string; nombre: string; locs: typeof localidades }> }>);

    // Nombre de la Zona activa si existe en los filtros o URL
    const zonaActivaNombre = filters.zona && localidadesEstructuradas[filters.zona] 
        ? localidadesEstructuradas[filters.zona].nombre 
        : null;

    // 🟢 Si hay 'zona' seleccionada y no se pasaron 'localidades' específicas en la URL,
    // consideramos activas por defecto todas las localidades de esa zona para que los checkboxes aparezcan tildados.
    const hayLocalidadesEnUrl = filters.localidades.length > 0;

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
                                    <span className="text-[12px]">{st.nombre}</span>
                                </label>
                            ))}
                        </div>
                    </details>
                </div>
            )}
           {/* 📍 UBICACIÓN Y LOCALIDADES */}
            <div className={styles.filterSection}>
                <h4 className={styles.filterTitle}>Ubicación</h4>

                {/* 1. MUESTRA EL CHIP SI YA HAY UNA ZONA SELECCIONADA */}
                {zonaActivaNombre ? (
                    <div className="mt-2 mb-3 flex items-center justify-between bg-slate-800 text-slate-100 p-2 rounded-full">
                        <span className="inline-flex items-center gap-1 text-xs font-bold">
                            📍 {zonaActivaNombre}
                        </span>
                        <button
                            type="button"
                            onClick={clearZonaAndLocalidades}
                            className="text-xs font-bold pr-2"
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    /* 2. SI NO HAY ZONA SELECCIONADA, PERMITE ELEGIR UNA DE LA LISTA */
                    <div className="mt-2 mb-4">
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">Seleccionar Zona General:</label>
                        <select
                            value={filters.zona || ''}
                            onChange={(e) => setFilter('zona', e.target.value || null)}
                            className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 text-slate-700 focus:outline-none focus:border-brand-dark"
                        >
                            <option value="">Seleccionar zona</option>
                            {Object.values(localidadesEstructuradas).map((region) => (
                                <option key={region.id} value={region.id}>
                                    {region.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* LISTA DE PARTIDOS Y LOCALIDADES */}
                {zonaActivaNombre && (
                <div className="space-y-3 pt-1">
                    {Object.entries(localidadesEstructuradas)
                        .filter(([regId]) => !filters.zona || regId === String(filters.zona))
                        .map(([regionId, region]) => (
                            <div key={regionId} className="space-y-2">
                                {Object.entries(region.partidos).map(([partidoId, partido]) => {
                                   const locsIds = partido.locs.map(l => String(l.id));

                                        // Comprobación de estado tildado:
                                        // Si no hay localidades explicitas en la URL pero hay Zona, toda la zona está marcada por defecto.
                                        const locEstaMarcada = (id: string) => !hayLocalidadesEnUrl || filters.localidades.includes(id);

                                        const totalmenteMarcado = locsIds.length > 0 && locsIds.every(id => locEstaMarcada(id));
                                        const parcialmenteMarcado = locsIds.some(id => locEstaMarcada(id));

                                        const handleTogglePartido = (checked: boolean) => {
                                            // Si veníamos de marcar todo por zona por defecto y el usuario desmarca un partido,
                                            // enviamos las localidades explícitas que se quedan activas.
                                            if (!hayLocalidadesEnUrl && !checked) {
                                                const todasLasDemasLocs = Object.values(region.partidos)
                                                    .filter(p => p.id !== partidoId)
                                                    .flatMap(p => p.locs.map(l => String(l.id)));
                                                setArrayFilter('localidad', todasLasDemasLocs, true);
                                                return;
                                            }

                                            setArrayFilter('localidad', locsIds, checked);
                                        };

                                    return (
                                        <details 
                                            key={partidoId} 
                                            className="group/partido space-y-1 pl-1"
                                            open={parcialmenteMarcado}
                                        >
                                            <summary className="flex items-center justify-between cursor-pointer py-1 select-none">
                                                <label 
                                                    className="flex items-center gap-2 text-xs font-spartan font-bold uppercase text-amber-800 hover:text-amber-900 cursor-pointer"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={totalmenteMarcado}
                                                        ref={el => {
                                                            if (el) el.indeterminate = parcialmenteMarcado && !totalmenteMarcado;
                                                        }}
                                                        onChange={(e) => handleTogglePartido(e.target.checked)}
                                                        className="accent-brand-dark rounded cursor-pointer"
                                                    />
                                                    <span>📍 {partido.nombre}</span>
                                                </label>
                                                <span className="text-[10px] text-slate-400 group-open/partido:rotate-180 transition-transform">▼</span>
                                            </summary>

                                            <div className="pl-6 pb-1">
                                                {partido.locs.map((loc) => (
                                                    <label key={loc.id} className={styles.checkboxLabel}>
                                                        <input
                                                            type="checkbox"
                                                            checked={filters.localidades.includes(String(loc.id))}
                                                            onChange={(e) => toggleArrayFilter('localidad', String(loc.id), e.target.checked)}
                                                            className="accent-brand-dark cursor-pointer"
                                                        />
                                                        <span className="text-[11px]">{loc.nombre}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </details>
                                    );
                                })}
                            </div>
                        ))}
                </div>
                )}
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