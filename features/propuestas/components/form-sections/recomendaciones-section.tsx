"use client";

import React from "react";
import { TarjetaRecomendacion, ItemForm } from "../../types/propuesta.types";

interface Props {
  recomMostrar: boolean;
  setRecomMostrar: (val: boolean) => void;
  recomTituloGeneral: string;
  setRecomTituloGeneral: (val: string) => void;
  tarjetasRecom: TarjetaRecomendacion[];
  itemsSeleccionados: ItemForm[];
  agregarTarjetaRecom: () => void;
  eliminarTarjetaRecom: (id: string) => void;
  actualizarTarjetaRecom: (id: string, campo: Partial<TarjetaRecomendacion>) => void;
  calcularMetricasItem: (item: ItemForm) => {
    supNave: number;
    costoObraTotal: number;
    inversionTotal: number;
    ingresoAnualUSD: number;
    roiAnual: number;
  };
  maxRoiCalculado?: number;
}

export function RecomendacionesSection({
  recomMostrar,
  setRecomMostrar,
  recomTituloGeneral,
  setRecomTituloGeneral,
  tarjetasRecom,
  itemsSeleccionados,
  agregarTarjetaRecom,
  eliminarTarjetaRecom,
  actualizarTarjetaRecom,
  calcularMetricasItem,
  maxRoiCalculado
}: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          ✍️ Conclusiones & Recomendaciones Relacionadas
        </h2>
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">
          <input
            type="checkbox"
            checked={recomMostrar}
            onChange={(e) => setRecomMostrar(e.target.checked)}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
          <span>Mostrar bloque en el informe público</span>
        </label>
      </div>

      {recomMostrar && (
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Título de la Sección General
            </label>
            <input
              type="text"
              value={recomTituloGeneral}
              onChange={(e) => setRecomTituloGeneral(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-bold outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tarjetasRecom.map((card, idx) => (
              <div
                key={card.id}
                className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                  card.activa
                    ? "bg-slate-50 border-slate-300"
                    : "bg-slate-100/60 border-slate-200 opacity-60"
                }`}
              >
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-extrabold text-slate-700">
                    <input
                      type="checkbox"
                      checked={card.activa}
                      onChange={(e) =>
                        actualizarTarjetaRecom(card.id, { activa: e.target.checked })
                      }
                      className="w-3.5 h-3.5 accent-amber-500 rounded cursor-pointer"
                    />
                    <span>Tarjeta #{idx + 1}</span>
                  </label>

                  {tarjetasRecom.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarTarjetaRecom(card.id)}
                      className="text-[10px] text-red-600 font-bold hover:underline"
                    >
                      ✕ Quitar
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
                    Vincular a Opción Elegida
                  </label>
                  <select
                    value={card.opcionAsociadaId || ""}
                    onChange={(e) =>
                      actualizarTarjetaRecom(card.id, {
                        opcionAsociadaId: e.target.value,
                      })
                    }
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-slate-800"
                  >
                    <option value="">-- Sin Vincular / General --</option>
                    {itemsSeleccionados.map((item, i) => {
                      const metricas = calcularMetricasItem(item);
                      
                      const esTop = maxRoiCalculado !== undefined && maxRoiCalculado > 0 && metricas.roiAnual === maxRoiCalculado;

                      return (
                        <option key={item.propiedadId} value={`Opción #${i + 1}: ${item.nombre}`}>
                          Opción #{i + 1}: {item.nombre} — ROI: {metricas.roiAnual}% {esTop ? "🏆 (Top ROI)" : ""}
                        </option>
                      );
                     })}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">
                    Título de la Tarjeta
                  </label>
                  <input
                    type="text"
                    value={card.titulo}
                    onChange={(e) =>
                      actualizarTarjetaRecom(card.id, { titulo: e.target.value })
                    }
                    className="w-full font-bold text-xs bg-white border border-slate-200 rounded-lg p-1.5 text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5 uppercase">
                    Análisis / Descripción
                  </label>
                  <textarea
                    rows={3}
                    value={card.texto}
                    onChange={(e) =>
                      actualizarTarjetaRecom(card.id, { texto: e.target.value })
                    }
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 text-slate-600 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={agregarTarjetaRecom}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-dashed border-slate-300 transition-all cursor-pointer"
          >
            ➕ Agregar Tarjeta de Recomendación Personalizada
          </button>
        </div>
      )}
    </div>
  );
}