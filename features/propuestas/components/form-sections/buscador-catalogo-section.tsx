"use client";

import React from "react";
import { ItemForm, PropiedadSimple } from "../../types/propuesta.types";

interface Props {
  busqueda: string;
  setBusqueda: (val: string) => void;
  catalogoFiltrado: PropiedadSimple[];
  itemsSeleccionados: ItemForm[];
  togglePropiedad: (prop: PropiedadSimple) => void;
  parseSeguro: (val: any) => number;
  extraerSuperficieLote: (p: PropiedadSimple) => number;
}

export function BuscadorCatalogoSection({
  busqueda,
  setBusqueda,
  catalogoFiltrado,
  itemsSeleccionados,
  togglePropiedad,
  parseSeguro,
  extraerSuperficieLote,
}: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
        ➕ Agregar Inmueble del Catálogo
      </h2>

      <input
        type="text"
        placeholder="🔍 Buscar por título, código o zona..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-amber-500 transition-all"
      />

      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
        {catalogoFiltrado
          .filter(
            (p) => !itemsSeleccionados.some((i) => i.propiedadId === p.id)
          )
          .map((prop) => (
            <div
              key={prop.id}
              className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-100 flex justify-between items-center text-xs transition-colors"
            >
              <div>
                <strong className="text-slate-900">{prop.titulo}</strong>
                <span className="text-slate-500 block text-[11px]">
                  Cód: {prop.codigo} | {prop.moneda}{" "}
                  {parseSeguro(prop.precio).toLocaleString("es-AR")} | Sup:{" "}
                  {extraerSuperficieLote(prop).toLocaleString("es-AR")} m²
                </span>
              </div>
              <button
                type="button"
                onClick={() => togglePropiedad(prop)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-all cursor-pointer"
              >
                + Seleccionar
              </button>
            </div>
          ))}

        {catalogoFiltrado.filter(
          (p) => !itemsSeleccionados.some((i) => i.propiedadId === p.id)
        ).length === 0 && (
          <div className="p-4 text-center text-slate-400 text-xs italic">
            No se encontraron lotes adicionales en el catálogo que coincidan con la búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}