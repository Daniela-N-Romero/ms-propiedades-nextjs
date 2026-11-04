// features/filtrado/components/filtro-zonas-jerarquico.tsx
'use client';

import { ChevronDown, ChevronRight, MapPin } from 'lucide-react';
import type { PartidoConLocalidades, ZonaPadre } from '../types/filtrado.types';
import { useFiltroZonasJerarquico } from '../hooks/use-filtro-zonas-jerarquico';

interface FiltroZonasJerarquicoProps {
  zonasPadre: ZonaPadre[];
  partidos: PartidoConLocalidades[];
  localidadesSeleccionadas: number[];
  onToggleLocalidad: (id: number) => void;
  onSelectMultipleLocalidades: (ids: number[], agregar: boolean) => void;
}

export function FiltroZonasJerarquico({
  zonasPadre,
  partidos,
  localidadesSeleccionadas,
  onToggleLocalidad,
  onSelectMultipleLocalidades,
}: FiltroZonasJerarquicoProps) {
  const {
    regionActivaId,
    partidosVisibles,
    partidosExpandidos,
    toggleExpandir,
    handleCambioRegion,
  } = useFiltroZonasJerarquico({
    zonasPadre,
    partidos,
    localidadesSeleccionadas,
    onSelectMultipleLocalidades,
  });

  return (
    <div className="space-y-3">
      {/* CABECERA DE SECCIÓN */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          Ubicación Geográfica
        </label>
      </div>

      {/* NIVEL 1: SELECTOR EXCLUSIVO DE REGIÓN */}
      {zonasPadre.length > 0 && (
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Región Principal
          </label>
          <select
            value={regionActivaId ?? ''}
            onChange={(e) => handleCambioRegion(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
          >
            {zonasPadre.map((zona) => (
              <option key={zona.id} value={zona.id}>
                {zona.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* NIVEL 2 Y 3: CONTENEDOR CON SCROLL PARA PARTIDOS Y LOCALIDADES */}
      <div className="max-h-56 overflow-y-auto pr-1 space-y-1.5 divide-y divide-slate-100">
        {partidosVisibles.map((partido) => {
          const idsHijas = partido.localidades.map((loc) => loc.id);

          const hijasSeleccionadas = idsHijas.filter((id) =>
            localidadesSeleccionadas.includes(id)
          );
          const todoElPartidoSeleccionado =
            idsHijas.length > 0 && hijasSeleccionadas.length === idsHijas.length;
          const estaExpandido = !!partidosExpandidos[partido.id];

          return (
            <div key={partido.id} className="pt-1.5 first:pt-0">
              {/* FILA DEL PARTIDO */}
              <div className="flex items-center justify-between py-1 hover:bg-slate-50 rounded px-1 group">
                <label className="flex items-center gap-2 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={todoElPartidoSeleccionado}
                    onChange={(e) => {
                      onSelectMultipleLocalidades(idsHijas, e.target.checked);
                    }}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-950">
                    {partido.nombre}
                  </span>
                </label>

                {/* BOTÓN ACORDEÓN PARA EXPANDIR LOCALIDADES */}
                {partido.localidades.length > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleExpandir(partido.id)}
                    className="p-1 text-slate-400 hover:text-slate-700 transition"
                    title={estaExpandido ? 'Ocultar localidades' : 'Ver localidades'}
                  >
                    {hijasSeleccionadas.length > 0 && !todoElPartidoSeleccionado && (
                      <span className="text-[10px] text-blue-600 font-bold mr-1">
                        ({hijasSeleccionadas.length})
                      </span>
                    )}
                    {estaExpandido ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              {/* NIVEL 3: LOCALIDADES HIJAS INDENTADAS */}
              {estaExpandido && partido.localidades.length > 0 && (
                <div className="ml-5 pl-2 border-l-2 border-slate-100 py-1 space-y-1">
                  {partido.localidades.map((loc) => {
                    const estaSeleccionada = localidadesSeleccionadas.includes(loc.id);
                    return (
                      <label
                        key={loc.id}
                        className="flex items-center gap-2 py-0.5 cursor-pointer text-[11px] text-slate-600 hover:text-slate-900"
                      >
                        <input
                          type="checkbox"
                          checked={estaSeleccionada}
                          onChange={() => onToggleLocalidad(loc.id)}
                          className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>{loc.nombre}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {partidosVisibles.length === 0 && (
          <p className="text-xs text-slate-400 italic py-2 text-center">
            No hay partidos cargados para esta región.
          </p>
        )}
      </div>
    </div>
  );
}