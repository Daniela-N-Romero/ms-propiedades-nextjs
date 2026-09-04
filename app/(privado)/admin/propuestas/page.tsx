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

  const copiarLink = (slug: string) => {
    const url = `${window.location.origin}/propuestas/${slug}`;
    navigator.clipboard.writeText(url);
    alert("¡Link copiado al portapapeles! Listo para enviar por WhatsApp o Mail.");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Propuestas Comerciales</h1>
          <p className="text-sm text-gray-500">Gestión de landings interactivas para clientes</p>
        </div>
        <Link
          href="/admin/propuestas/crear"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all"
        >
          + Nueva Propuesta
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Cargando propuestas...</div>
      ) : propuestas.length === 0 ? (
        <div className="bg-white border rounded-xl p-8 text-center text-gray-500">
          No tienes propuestas creadas aún. ¡Crea la primera para tus presentaciones!
        </div>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b text-slate-700">
              <tr>
                <th className="p-4">Cliente</th>
                <th className="p-4">Punto de Referencia</th>
                <th className="p-4">Inmuebles</th>
                <th className="p-4">Fecha</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {propuestas.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-900">{p.clienteNombre}</td>
                  <td className="p-4 text-slate-600">📍 {p.puntoInteresNombre}</td>
                  <td className="p-4 text-slate-600">{p._count?.items || 0} propiedades</td>
                  <td className="p-4 text-slate-600 text-xs">
                    {new Date(p.createdAt).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {/* Botón Copiar Link */}
                    <button
                      onClick={() => copiarLink(p.slug)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-slate-700 px-2.5 py-1.5 rounded font-medium"
                      title="Copiar URL para el cliente"
                    >
                      📋 Copiar Link
                    </button>

                    {/* Botón Ver Landing */}
                    <Link
                      href={`/propuestas/${p.slug}`}
                      target="_blank"
                      className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1.5 rounded font-medium"
                    >
                      👁️ Ver Landing
                    </Link>

                    {/* Botón Editar */}
                    <Link
                      href={`/admin/propuestas/${p.id}/editar`}
                      className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1.5 rounded font-medium"
                    >
                      ✏️ Editar
                    </Link>

                    {/* Botón Eliminar */}
                    <button
                      onClick={() => handleEliminar(p.id)}
                      className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1.5 rounded font-medium"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}