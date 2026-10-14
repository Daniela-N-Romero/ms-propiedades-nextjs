"use client";

import React from "react";

interface Props {
  costoObraMercado: number;
  setCostoObraMercado: (val: number) => void;
  costoObraPreferencial: number;
  setCostoObraPreferencial: (val: number) => void;
  tieneTarifaPreferencial: boolean;
  setTieneTarifaPreferencial: (val: boolean) => void;
}

export function PremisasInversionSection({
  costoObraMercado,
  setCostoObraMercado,
  costoObraPreferencial,
  setCostoObraPreferencial,
  tieneTarifaPreferencial,
  setTieneTarifaPreferencial,
}: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
          ⚙️ Premisas Financieras de Construcción ($USD/m²)
        </h2>
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
          <input
            type="checkbox"
            checked={tieneTarifaPreferencial}
            onChange={(e) => setTieneTarifaPreferencial(e.target.checked)}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
          <span>Activar Beneficio de Tarifa Preferencial</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            Precio de Mercado Referencial ($USD/m²)
          </label>
          <input
            type="number"
            value={costoObraMercado}
            onChange={(e) => setCostoObraMercado(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold outline-none"
          />
        </div>

        {tieneTarifaPreferencial && (
          <div>
            <label className="block text-[11px] font-bold text-emerald-700 mb-1">
              Tarifa Preferencial Exclusiva ($USD/m²)
            </label>
            <input
              type="number"
              value={costoObraPreferencial}
              onChange={(e) => setCostoObraPreferencial(Number(e.target.value))}
              className="w-full bg-emerald-50/60 border border-emerald-300 rounded-xl p-2.5 text-xs text-emerald-900 font-black outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}