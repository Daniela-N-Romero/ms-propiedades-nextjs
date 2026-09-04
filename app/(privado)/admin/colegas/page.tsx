'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  saveColegaAction,
  unassignColegaAction,
  assignColegaAction,
  deleteColegaAction,
} from './actions';

interface PropiedadMini {
  id: number;
  codigo: string;
  titulo: string;
  slug: string;
  imagenes?: { url: string }[];
}

interface Colega {
  id: number;
  nombre: string;
  apellido: string;
  inmobiliaria: string;
  telefono?: string | null;
  email?: string | null;
  notasPrivadas?: string | null;
  propiedades: PropiedadMini[];
}

export default function ColegasManagerPage() {
  const [colegas, setColegas] = useState<Colega[]>([]);
  const [propiedadesLibres, setPropiedadesLibres] = useState<PropiedadMini[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [showImages, setShowImages] = useState(true);
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [editModalColega, setEditModalColega] = useState<Partial<Colega> | null>(null);
  const [linkModalColegaId, setLinkModalColegaId] = useState<number | null>(null);
  const [selectedPropertyToLink, setSelectedPropertyToLink] = useState<string>('');

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/colegas', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setColegas(data.colegas || []);
        setPropiedadesLibres(data.propiedadesLibres || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const colegasFiltrados = useMemo(() => {
    if (!searchQuery.trim()) return colegas;
    const q = searchQuery.toLowerCase();
    return colegas.filter(
      (c) =>
        c.inmobiliaria.toLowerCase().includes(q) ||
        c.nombre.toLowerCase().includes(q) ||
        c.apellido.toLowerCase().includes(q) ||
        (c.telefono && c.telefono.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [colegas, searchQuery]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const formatWhatsappUrl = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    const fullNumber = clean.startsWith('54') ? clean : `549${clean}`;
    return `https://wa.me/${fullNumber}`;
  };

  const handleSaveColega = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalColega?.nombre || !editModalColega?.inmobiliaria) return;

    const res = await saveColegaAction({
      id: editModalColega.id,
      nombre: editModalColega.nombre,
      apellido: editModalColega.apellido || '',
      inmobiliaria: editModalColega.inmobiliaria,
      telefono: editModalColega.telefono || undefined,
      email: editModalColega.email || undefined,
      notasPrivadas: editModalColega.notasPrivadas || undefined,
    });

    if (res.success) {
      setEditModalColega(null);
      cargarDatos();
    }
  };

  const handleUnassign = async (propertyId: number) => {
    if (confirm('¿Desvincular esta propiedad del colega? Pasará a estar "Sin Asignar".')) {
      const res = await unassignColegaAction(propertyId);
      if (res.success) cargarDatos();
    }
  };

  const handleLinkProperty = async (targetColegaId?: number, targetPropertyId?: number) => {
    const colegaId = targetColegaId || linkModalColegaId;
    const propId = targetPropertyId || Number(selectedPropertyToLink);

    if (!colegaId || !propId) return;

    const res = await assignColegaAction(propId, colegaId);
    if (res.success) {
      setLinkModalColegaId(null);
      setSelectedPropertyToLink('');
      cargarDatos();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      {/* HEADER */}
      <div className="bg-slate-900 text-white py-4 px-6 mb-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="text-xs font-spartan font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
            >
              ← Dashboard
            </Link>
            <h1 className="text-lg font-spartan font-bold">Gestión de Inmobiliarias Colegas</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowImages(!showImages)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {showImages ? '🖼️ Ocultar Fotos' : '📷 Mostrar Fotos'}
            </button>

            <button
              onClick={() => setEditModalColega({ inmobiliaria: '', nombre: '', apellido: '', telefono: '', email: '', notasPrivadas: '' })}
              className="px-4 py-1.5 bg-brand-orange hover:bg-amber-600 text-brand-dark font-spartan font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
            >
              + Nuevo Colega
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* BUSCADOR */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Buscar por inmobiliaria, contacto, teléfono o email..."
              className="w-full px-4 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none focus:border-brand-dark"
            />
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            Mostrando {colegasFiltrados.length} de {colegas.length} colegas
          </span>
        </div>

        {/* TABLA PRINCIPAL DE COLEGAS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold animate-pulse">
              📍 Cargando colegas...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-200 text-[11px] font-spartan font-bold uppercase text-slate-800">
                    <th className="p-3">Inmobiliaria & Contacto</th>
                    <th className="p-3">Teléfono / Email</th>
                    <th className="p-3 w-64 min-w-[240px]">Notas Privadas</th>
                    <th className="p-3">Propiedades Compartidas</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {colegasFiltrados.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      {/* INMOBILIARIA Y CONTACTO */}
                      <td className="p-3 font-bold text-slate-900 align-top">
                        <div className="font-extrabold text-purple-900 text-xs">
                          🤝 {c.inmobiliaria}
                        </div>
                        <div className="text-slate-600 text-[11px] font-semibold mt-0.5">
                          {c.nombre} {c.apellido}
                        </div>
                        <span className="block text-[10px] text-slate-400 font-mono font-normal">
                          ID: #{c.id}
                        </span>
                      </td>

                      {/* CONTACTO */}
                      <td className="p-3 align-top space-y-1.5">
                        {c.telefono ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-700">{c.telefono}</span>
                            <button
                              onClick={() => handleCopy(c.telefono!, `tel-${c.id}`)}
                              title="Copiar Teléfono"
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-[10px] rounded border border-slate-300 font-bold"
                            >
                              {copiedText === `tel-${c.id}` ? '✅' : '📋'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] block">Sin teléfono</span>
                        )}

                        {c.email ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-600">{c.email}</span>
                            <button
                              onClick={() => handleCopy(c.email!, `mail-${c.id}`)}
                              title="Copiar Email"
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-[10px] rounded border border-slate-300 font-bold"
                            >
                              {copiedText === `mail-${c.id}` ? '✅' : '📋'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] block">Sin email</span>
                        )}
                      </td>

                      {/* NOTAS PRIVADAS */}
                      <td className="p-3 align-top w-64 min-w-[240px]">
                        {c.notasPrivadas ? (
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px]">
                            <p className="text-slate-700 line-clamp-3 whitespace-pre-line">{c.notasPrivadas}</p>
                            {c.notasPrivadas.length > 80 && (
                              <button
                                onClick={() => setExpandedNote(c.notasPrivadas || '')}
                                className="text-[10px] font-bold text-blue-600 hover:underline mt-1 cursor-pointer"
                              >
                                🔍 Ver nota completa
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[11px] italic">Sin notas</span>
                        )}
                      </td>

                      {/* PROPIEDADES */}
                      <td className="p-3 align-top">
                        <div className="flex flex-wrap gap-2 items-center">
                          {c.propiedades && c.propiedades.length > 0 ? (
                            c.propiedades.map((prop) => (
                              <div
                                key={prop.id}
                                className="inline-flex items-center gap-1.5 bg-purple-50/60 border border-purple-200 p-1.5 rounded-xl shadow-2xs"
                              >
                                {showImages && (
                                  <img
                                    src={prop.imagenes?.[0]?.url || '/images/placeholder.jpg'}
                                    alt=""
                                    className="w-8 h-8 object-cover rounded-lg bg-slate-200 border border-slate-300"
                                  />
                                )}
                                <div className="leading-tight">
                                  <Link
                                    href={`/admin/${prop.id}/editar`}
                                    className="font-bold text-slate-800 hover:text-purple-800 block text-[11px]"
                                  >
                                    {prop.codigo} - {prop.titulo.slice(0, 15)}...
                                  </Link>
                                </div>

                                <button
                                  onClick={() => handleUnassign(prop.id)}
                                  title="Desvincular esta propiedad"
                                  className="ml-1 text-red-500 hover:text-red-700 font-extrabold text-xs px-1 hover:bg-red-50 rounded"
                                >
                                  ✕
                                </button>
                              </div>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px] block">Sin propiedades asociadas</span>
                          )}
                        </div>
                      </td>

                      {/* ACCIONES DESPLEGABLES */}
                      <td className="p-3 align-top text-right relative">
                        <div className="inline-block text-left">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold text-sm border border-slate-300 cursor-pointer"
                          >
                            •••
                          </button>

                          {openMenuId === c.id && (
                            <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20 text-xs">
                              <button
                                onClick={() => {
                                  setEditModalColega(c);
                                  setOpenMenuId(null);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2 font-semibold text-slate-700"
                              >
                                ✏️ Editar Datos
                              </button>

                              <button
                                onClick={() => {
                                  setLinkModalColegaId(c.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2 font-semibold text-emerald-700"
                              >
                                🔗 Vincular Propiedad
                              </button>

                              {c.telefono && (
                                <>
                                  <hr className="my-1 border-slate-100" />
                                  <a
                                    href={`tel:${c.telefono}`}
                                    className="block px-3 py-1.5 hover:bg-slate-100 font-semibold text-blue-700"
                                  >
                                    📞 Llamar por teléfono
                                  </a>
                                  <a
                                    href={formatWhatsappUrl(c.telefono)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block px-3 py-1.5 hover:bg-slate-100 font-semibold text-emerald-600"
                                  >
                                    💬 Enviar WhatsApp
                                  </a>
                                </>
                              )}

                              <hr className="my-1 border-slate-100" />

                              <button
                                onClick={async () => {
                                  if (
                                    confirm(
                                      `¿Eliminar a "${c.nombre} ${c.apellido || ''}"?\n\nSus propiedades no se borrarán, pero pasarán a la sección "Sin Asignar / Desconocidas".`
                                    )
                                  ) {
                                    const res = await deleteColegaAction(c.id);
                                    if (res.success) {
                                      setOpenMenuId(null);
                                      cargarDatos();
                                    } else {
                                      alert(res.error);
                                    }
                                  }
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-red-50 font-semibold text-red-600 flex items-center gap-2 cursor-pointer"
                              >
                                🗑️ Eliminar Colega
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PROPIEDADES SIN ASIGNAR / DESCONOCIDAS */}
        <div className="bg-white rounded-2xl border border-amber-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div>
              <h2 className="text-sm font-spartan font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                ⚠️ Propiedades Sin Asignar / Desconocidas ({propiedadesLibres.length})
              </h2>
              <p className="text-xs text-slate-500">
                Propiedades que aún no pertenecen ni a un propietario ni a un colega.
              </p>
            </div>
          </div>

          {propiedadesLibres.length === 0 ? (
            <p className="text-xs text-slate-400 italic">¡Todas las propiedades tienen asignación!</p>
          ) : (
            <div className="">
              {propiedadesLibres.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-slate-200 border border-slate-300 rounded-xl p-3 flex  justify-between  mb-2 text-xs"
                >
                  <div className="flex gap-2">
                    {showImages && (
                      <img
                        src={prop.imagenes?.[0]?.url || '/images/placeholder.jpg'}
                        alt=""
                        className="w-8 h-8 object-cover rounded-lg bg-slate-200 border border-slate-300"
                      />
                    )}
                    <div>
                      <span className="font-mono font-bold text-slate-500 block text-[10px]">{prop.codigo}</span>
                      <Link
                        href={`/admin/${prop.id}/editar`}
                        className="font-bold text-slate-800 hover:text-amber-600"
                      >
                        {prop.titulo}
                      </Link>
                    </div>
                  </div>

                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleLinkProperty(Number(e.target.value), prop.id);
                      }
                    }}
                    defaultValue=""
                    className="px-2 py-1 bg-white border border-gray-700 focus:border-amber-400 rounded-lg text-[11px] font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="" disabled>
                      + Asignar a Colega...
                    </option>
                    {colegas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.inmobiliaria} ({c.nombre})
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL VER NOTA */}
      {expandedNote && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-spartan font-bold text-slate-900 text-sm uppercase tracking-wider">
              📝 Nota Privada Completa
            </h3>
            <p className="text-xs text-slate-700 whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed">
              {expandedNote}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setExpandedNote(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR / CREAR COLEGA */}
      {editModalColega && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-spartan font-bold text-slate-900 text-base">
              {editModalColega.id ? '✏️ Editar Colega' : '🤝 Nuevo Colega Inmobiliario'}
            </h3>

            <form onSubmit={handleSaveColega} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Inmobiliaria (*)</label>
                <input
                  type="text"
                  required
                  value={editModalColega.inmobiliaria || ''}
                  onChange={(e) => setEditModalColega({ ...editModalColega, inmobiliaria: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-brand-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre Contacto (*)</label>
                  <input
                    type="text"
                    required
                    value={editModalColega.nombre || ''}
                    onChange={(e) => setEditModalColega({ ...editModalColega, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-brand-dark"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    value={editModalColega.apellido || ''}
                    onChange={(e) => setEditModalColega({ ...editModalColega, apellido: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-brand-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={editModalColega.telefono || ''}
                  onChange={(e) => setEditModalColega({ ...editModalColega, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-brand-dark"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editModalColega.email || ''}
                  onChange={(e) => setEditModalColega({ ...editModalColega, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-brand-dark"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notas Privadas / Acuerdos</label>
                <textarea
                  rows={4}
                  value={editModalColega.notasPrivadas || ''}
                  onChange={(e) => setEditModalColega({ ...editModalColega, notasPrivadas: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-brand-dark"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalColega(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-dark text-white rounded-xl font-bold hover:bg-slate-800"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VINCULAR PROPIEDAD */}
      {linkModalColegaId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-spartan font-bold text-slate-900 text-base">
              🔗 Vincular Propiedad a Colega #{linkModalColegaId}
            </h3>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-slate-700">
                Seleccioná una propiedad libre:
              </label>

              {propiedadesLibres.length === 0 ? (
                <p className="text-slate-400 italic">No hay propiedades sin asignar disponibles.</p>
              ) : (
                <select
                  value={selectedPropertyToLink}
                  onChange={(e) => setSelectedPropertyToLink(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-brand-dark"
                >
                  <option value="">-- Seleccionar propiedad --</option>
                  {propiedadesLibres.map((prop) => (
                    <option key={prop.id} value={prop.id}>
                      {prop.codigo} - {prop.titulo}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => {
                    setLinkModalColegaId(null);
                    setSelectedPropertyToLink('');
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleLinkProperty()}
                  disabled={!selectedPropertyToLink}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50"
                >
                  Confirmar Vinculación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}