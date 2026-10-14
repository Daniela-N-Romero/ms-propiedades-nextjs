"use client";

import React from "react";

interface Props {
  clienteNombre: string;
  setClienteNombre: (val: string) => void;
  clienteEmpresa: string;
  setClienteEmpresa: (val: string) => void;
  slug: string;
  setSlug: (val: string) => void;
  isEdit: boolean;
  esInversion: boolean;
}

export function ClienteSection({
  clienteNombre,
  setClienteNombre,
  clienteEmpresa,
  setClienteEmpresa,
  slug,
  setSlug,
  isEdit,
  esInversion,
}: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
        📋 Información del Cliente & Presentación
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nombre Cliente
          </label>
          <input
            type="text"
            required
            value={clienteNombre}
            onChange={(e) => {
              setClienteNombre(e.target.value);
              if (!isEdit) {
                const prefix = esInversion ? "inversion-" : "";
                setSlug(
                  `${prefix}${e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)+/g, "")}`
                );
              }
            }}
            placeholder="Ej: Ignacio Angotzi"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Empresa (Opcional)
          </label>
          <input
            type="text"
            value={clienteEmpresa}
            onChange={(e) => setClienteEmpresa(e.target.value)}
            placeholder="Ej: Grupo Logístico Sur"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-amber-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            URL Pública / Slug
          </label>
          <div className="flex items-center text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <span className="text-slate-400 font-medium">/propuestas/</span>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-transparent border-none p-0 focus:outline-none text-slate-900 font-bold"
            />
          </div>
        </div>
      </div>
    </div>
  );
}