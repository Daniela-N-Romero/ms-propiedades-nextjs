"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Propuesta {
  id: string;
  clienteNombre: string;
  slug: string;
  puntoInteresNombre: string;
  createdAt: string;
  _count?: { items: number };
}

export default function GestionPropuestasPage() {
  const [propuestas, setPropuestas] = useState<Propuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      console.error("Error al copiar el enlace:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* HEADER SUPERIOR */}
      <div className="bg-slate-900 text-white py-4 px-4 sm:px-6 mb-6 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <Link
              href="/admin"
              className="text-xs font-spartan font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
            >
              ← Menú
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-spartan font-bold">Propuestas Comerciales</h1>
              <p className="text-xs text-gray-400">Gestión de landings interactivas para clientes</p>
            </div>
          </div>

          <Link
            href="/admin/propuestas/crear"
            className="w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-lg shadow-xs transition-all"
          >
            + Nueva Propuesta
          </Link>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
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
          <>
            {/* 📱 VISTA EN TARJETAS PARA MOBILE (oculta en escritorio) */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {propuestas.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{p.clienteNombre}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        📍 {p.puntoInteresNombre}
                      </p>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md">
                      {p._count?.items || 0} inmuebles
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Creado el:{" "}
                      {new Date(p.createdAt).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* BOTONERA ADAPTADA EN MOBILE */}
                  <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => copiarLink(p.slug, p.id)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        copiedId === p.id
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                      title="Copiar Enlace"
                    >
                      {copiedId === p.id ? "✅ Listo" : "📋 Enlace"}
                    </button>

                    <Link
                      href={`/propuestas/${p.slug}`}
                      target="_blank"
                      className="py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold text-center flex items-center justify-center"
                      title="Ver Landing"
                    >
                      👁️ Ver
                    </Link>

                    <Link
                      href={`/admin/propuestas/${p.id}/editar`}
                      className="py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold text-center flex items-center justify-center"
                      title="Editar"
                    >
                      ✏️ Editar
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleEliminar(p.id)}
                      className="py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 🖥️ TABLA TRADICIONAL PARA ESCRITORIO (oculta en mobile) */}
            <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-spartan font-bold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Punto de Referencia</th>
                      <th className="p-4">Inmuebles</th>
                      <th className="p-4">Fecha</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {propuestas.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-semibold text-slate-900">{p.clienteNombre}</td>
                        <td className="p-4 text-slate-600">📍 {p.puntoInteresNombre}</td>
                        <td className="p-4 text-slate-600">{p._count?.items || 0} propiedades</td>
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
                            title="Copiar URL para el cliente"
                          >
                            {copiedId === p.id ? "✅ Copiado" : "📋 Enlace"}
                          </button>

                          <Link
                            href={`/propuestas/${p.slug}`}
                            target="_blank"
                            className="inline-flex text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors"
                            title="Ver Landing"
                          >
                            👁️
                          </Link>

                          <Link
                            href={`/admin/propuestas/${p.id}/editar`}
                            className="inline-flex text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleEliminar(p.id)}
                            className="inline-flex text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}