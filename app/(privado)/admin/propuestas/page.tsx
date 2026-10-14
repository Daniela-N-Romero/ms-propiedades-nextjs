"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Propuesta {
  id: string;
  clienteNombre: string;
  clienteEmpresa?: string;
  slug: string;
  tipo: "LOGISTICA_RUTAS" | "INVERSION_DESARROLLO";
  puntoInteresNombre?: string;
  createdAt: string;
  _count?: { items: number };
}

export default function GestionPropuestasPage() {
  const [propuestas, setPropuestas] = useState<Propuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSelectorModal, setShowSelectorModal] = useState(false);

  const cargarPropuestas = async () => {
    try {
      const res = await fetch("/api/propuestas");
      const data = await res.json();
      if (Array.isArray(data)) setPropuestas(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPropuestas();
  }, []);

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta propuesta?")) return;
    await fetch(`/api/propuestas/${id}`, { method: "DELETE" });
    cargarPropuestas();
  };

  const copiarLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/propuestas/${slug}`;
    try {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* HEADER SUPERIOR */}
      <div className="bg-slate-900 text-white py-4 px-4 sm:px-6 mb-6 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-xs font-spartan font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
            >
              ← Menú
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-spartan font-bold">Propuestas Comerciales</h1>
              <p className="text-xs text-gray-400">Landings interactivas para clientes corporativos e inversores</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSelectorModal(true)}
            className="w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>+ Nueva Propuesta</span>
          </button>
        </div>
      </div>

      {/* MODAL SELECTOR DE TIPO */}
      {showSelectorModal && (
        <ModalSelectorPropuesta onClose={() => setShowSelectorModal(false)} />
      )}

      {/* TABLA DE PROPUESTAS */}
      <div className="px-4 sm:px-6 max-w-6xl mx-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-spartan text-xs uppercase tracking-wider animate-pulse">
            Cargando propuestas...
          </div>
        ) : propuestas.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
            No tienes propuestas creadas aún. ¡Crea la primera para tus presentaciones!
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-spartan font-bold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Cliente / Empresa</th>
                    <th className="p-4">Punto Ref / Parques</th>
                    <th className="p-4">Inmuebles</th>
                    <th className="p-4">Fecha</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {propuestas.map((p) => {
                    const esInversion = p.tipo === "INVERSION_DESARROLLO";

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 whitespace-nowrap">
                          {esInversion ? (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                              📈 Inversión & ROI
                            </span>
                          ) : (
                            <span className="bg-blue-100 text-blue-900 border border-blue-300 font-bold text-[11px] px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                              🚚 Logística
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-semibold text-slate-900">
                          {p.clienteNombre}
                          {p.clienteEmpresa && (
                            <span className="block text-xs font-normal text-slate-500">
                              {p.clienteEmpresa}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-600 text-xs">
                          {esInversion ? "📊 Comparativa ROI" : `📍 ${p.puntoInteresNombre || "S/D"}`}
                        </td>
                        <td className="p-4 text-slate-600">{p._count?.items || 0} inmuebles</td>
                        <td className="p-4 text-slate-500 text-xs">
                          {new Date(p.createdAt).toLocaleDateString("es-AR", {
                            day: "numeric",
                            month: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => copiarLink(p.slug, p.id)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer inline-flex items-center gap-1 ${
                              copiedId === p.id
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                          >
                            {copiedId === p.id ? "✅ Copiado" : "📋 Enlace"}
                          </button>

                          <Link
                            href={`/propuestas/${p.slug}`}
                            target="_blank"
                            className="inline-flex text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors"
                          >
                            👁️
                          </Link>

                          <Link
                            href={`/admin/propuestas/${p.id}/editar`}
                            className="inline-flex text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors"
                          >
                            ✏️
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleEliminar(p.id)}
                            className="inline-flex text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// SUBCOMPONENTE DE MODAL
function ModalSelectorPropuesta({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-base">Seleccionar Tipo de Propuesta</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Seleccioná el enfoque comercial con el que querés presentar las opciones a tu cliente:
        </p>

        <div className="grid grid-cols-1 gap-3">
          <Link
            href="/admin/propuestas/crear?tipo=LOGISTICA_RUTAS"
            className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/50 transition-all text-left flex items-start gap-3 group"
          >
            <span className="text-2xl">🚚</span>
            <div>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700">
                Propuesta Logística & Rutas
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Evalúa la conectividad, rutas y tiempos de traslado hacia un punto de referencia.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/propuestas/crear?tipo=INVERSION_DESARROLLO"
            className="p-4 rounded-xl border-2 border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all text-left flex items-start gap-3 group"
          >
            <span className="text-2xl">📈</span>
            <div>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-700">
                Inversión, Desarrollo & ROI
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Comparativa de lotes en parques, costo de obra por m², proyección de alquiler y retorno (ROI %).
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}