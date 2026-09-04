'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
    savePropietarioAction,
    unassignPropietarioAction,
    assignPropietarioAction,
    deletePropietarioAction,
} from './actions';

interface PropiedadMini {
    id: number;
    codigo: string;
    titulo: string;
    slug: string;
    imagenes?: { url: string }[];
}

interface Propietario {
    id: number;
    nombre: string;
    apellido?: string | null;
    telefono?: string | null;
    email?: string | null;
    notasPrivadas?: string | null;
    propiedades: PropiedadMini[];
}

export default function PropietariosManagerPage() {
    const [propietarios, setPropietarios] = useState<Propietario[]>([]);
    const [propiedadesLibres, setPropiedadesLibres] = useState<PropiedadMini[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtro de búsqueda y utilidades
    const [searchQuery, setSearchQuery] = useState('');
    const [showImages, setShowImages] = useState(false);
    const [expandedNote, setExpandedNote] = useState<string | null>(null);
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    // Modales
    const [editModalOwner, setEditModalOwner] = useState<Partial<Propietario> | null>(null);
    const [linkModalOwnerId, setLinkModalOwnerId] = useState<number | null>(null);
    const [selectedPropertyToLink, setSelectedPropertyToLink] = useState<string>('');

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/propietarios', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setPropietarios(data.propietarios || []);
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

    // Filtrado dinámico de propietarios
    const propietariosFiltrados = useMemo(() => {
        if (!searchQuery.trim()) return propietarios;
        const q = searchQuery.toLowerCase();
        return propietarios.filter(
            (p) =>
                p.nombre.toLowerCase().includes(q) ||
                (p.apellido && p.apellido.toLowerCase().includes(q)) ||
                (p.telefono && p.telefono.includes(q)) ||
                (p.email && p.email.toLowerCase().includes(q))
        );
    }, [propietarios, searchQuery]);

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

    const handleSaveOwner = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editModalOwner?.nombre) return;

        const res = await savePropietarioAction({
            id: editModalOwner.id,
            nombre: editModalOwner.nombre,
            apellido: editModalOwner.apellido || undefined,
            telefono: editModalOwner.telefono || undefined,
            email: editModalOwner.email || undefined,
            notasPrivadas: editModalOwner.notasPrivadas || undefined,
        });

        if (res.success) {
            setEditModalOwner(null);
            cargarDatos();
        }
    };

    const handleUnassign = async (propertyId: number) => {
        if (confirm('¿Desvincular esta propiedad del propietario? Pasará a estar "Sin Asignar".')) {
            const res = await unassignPropietarioAction(propertyId);
            if (res.success) cargarDatos();
        }
    };

    const handleLinkProperty = async (targetOwnerId?: number, targetPropertyId?: number) => {
        const ownerId = targetOwnerId || linkModalOwnerId;
        const propId = targetPropertyId || Number(selectedPropertyToLink);

        if (!ownerId || !propId) return;

        const res = await assignPropietarioAction(propId, ownerId);
        if (res.success) {
            setLinkModalOwnerId(null);
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
                        <h1 className="text-lg font-spartan font-bold">Gestión de Propietarios</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowImages(!showImages)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            {showImages ? '🖼️ Ocultar Fotos' : '📷 Mostrar Fotos'}
                        </button>

                        <button
                            onClick={() => setEditModalOwner({ nombre: '', apellido: '', telefono: '', email: '', notasPrivadas: '' })}
                            className="px-4 py-1.5 bg-brand-orange hover:bg-amber-600 text-brand-dark font-spartan font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                        >
                            + Nuevo Propietario
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                {/* BARRA DE BÚSQUEDA DE PROPIETARIO */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="🔍 Buscar por nombre, teléfono o email..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none focus:border-brand-dark"
                        />
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">
                        Mostrando {propietariosFiltrados.length} de {propietarios.length} propietarios
                    </span>
                </div>

                {/* TABLA PRINCIPAL DE PROPIETARIOS */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 text-xs font-semibold animate-pulse">
                            📍 Cargando datos...
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-200 border-b border-slate-200 text-[11px] font-spartan font-bold uppercase text-slate-800">
                                        <th className="p-3">Propietario</th>
                                        <th className="p-3">Contacto</th>
                                        <th className="p-3 w-64 min-w-[240px]">Notas Privadas</th>
                                        <th className="p-3">Propiedades Asignadas</th>
                                        <th className="p-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {propietariosFiltrados.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                            {/* PROPIETARIO */}
                                            <td className="p-3 font-bold text-slate-900 align-top">
                                                <div>
                                                    {p.nombre} {p.apellido || ''}
                                                    <span className="block text-[10px] text-slate-400 font-mono font-normal">
                                                        ID: #{p.id}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* CONTACTO */}
                                            <td className="p-3 align-top space-y-1.5">
                                                {p.telefono ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-semibold text-slate-700">{p.telefono}</span>
                                                        <button
                                                            onClick={() => handleCopy(p.telefono!, `tel-${p.id}`)}
                                                            title="Copiar Teléfono"
                                                            className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-[10px] rounded border border-slate-300 font-bold"
                                                        >
                                                            {copiedText === `tel-${p.id}` ? '✅' : '📋'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-[11px] block">Sin teléfono</span>
                                                )}

                                                {p.email ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[11px] text-slate-600">{p.email}</span>
                                                        <button
                                                            onClick={() => handleCopy(p.email!, `mail-${p.id}`)}
                                                            title="Copiar Email"
                                                            className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-[10px] rounded border border-slate-300 font-bold"
                                                        >
                                                            {copiedText === `mail-${p.id}` ? '✅' : '📋'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-[11px] block">Sin email</span>
                                                )}
                                            </td>

                                            {/* NOTAS PRIVADAS (COLUMNA AMPLIADA) */}
                                            <td className="p-3 align-top w-64 min-w-[240px]">
                                                {p.notasPrivadas ? (
                                                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px]">
                                                        <p className="text-slate-700 line-clamp-3 whitespace-pre-line">{p.notasPrivadas}</p>
                                                        {p.notasPrivadas.length > 80 && (
                                                            <button
                                                                onClick={() => setExpandedNote(p.notasPrivadas || '')}
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

                                            {/* PROPIEDADES ASIGNADAS */}
                                            <td className="p-3 align-top">
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    {p.propiedades && p.propiedades.length > 0 ? (
                                                        p.propiedades.map((prop) => (
                                                            <div
                                                                key={prop.id}
                                                                className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1.5 rounded-xl shadow-2xs"
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
                                                                        className="font-bold text-slate-800 hover:text-blue-700 block text-[11px]"
                                                                    >
                                                                        {prop.codigo} - {prop.titulo.slice(0, 18)}...
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

                                            {/* ACCIONES (MENÚ DESPLEGABLE) */}
                                            <td className="p-3 align-top text-right relative">
                                                <div className="inline-block text-left">
                                                    <button
                                                        onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                                                        className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold text-sm border border-slate-300 cursor-pointer"
                                                    >
                                                        •••
                                                    </button>

                                                    {openMenuId === p.id && (
                                                        <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20 text-xs">
                                                            <button
                                                                onClick={() => {
                                                                    setEditModalOwner(p);
                                                                    setOpenMenuId(null);
                                                                }}
                                                                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2 font-semibold text-slate-700"
                                                            >
                                                                ✏️ Editar Datos
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setLinkModalOwnerId(p.id);
                                                                    setOpenMenuId(null);
                                                                }}
                                                                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center gap-2 font-semibold text-emerald-700"
                                                            >
                                                                🔗 Vincular Propiedad
                                                            </button>

                                                            {p.telefono && (
                                                                <>
                                                                    <hr className="my-1 border-slate-100" />
                                                                    <a
                                                                        href={`tel:${p.telefono}`}
                                                                        className="block px-3 py-1.5 hover:bg-slate-100 font-semibold text-blue-700"
                                                                    >
                                                                        📞 Llamar por teléfono
                                                                    </a>
                                                                    <a
                                                                        href={formatWhatsappUrl(p.telefono)}
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
                                                                            `¿Eliminar a "${p.nombre} ${p.apellido || ''}"?\n\nSus propiedades no se borrarán, pero pasarán a la sección "Sin Asignar / Desconocidas".`
                                                                        )
                                                                    ) {
                                                                        const res = await deletePropietarioAction(p.id);
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
                                                                🗑️ Eliminar Propietario
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

                {/* SECCIÓN INFERIOR: PROPIEDADES SIN ASIGNAR / DESCONOCIDAS */}
                <div className="bg-white rounded-2xl border border-amber-200 shadow-xs p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                        <div>
                            <h2 className="text-sm font-spartan font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                                ⚠️ Propiedades Sin Asignar / Desconocidas ({propiedadesLibres.length})
                            </h2>
                            <p className="text-xs text-slate-500">
                                Estas propiedades no tienen un propietario ni un colega asignado en la base de datos.
                            </p>
                        </div>
                    </div>

                    {propiedadesLibres.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">¡Excelente! Todas las propiedades tienen un contacto asignado.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {propiedadesLibres.map((prop) => (
                                <div
                                    key={prop.id}
                                    className="bg-slate-50/50 border border-slate-300 rounded-xl p-3 flex flex-col justify-between gap-3 text-xs"
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
                                                className="font-bold text-slate-800 hover:text-amber-800"
                                            >
                                                {prop.titulo}
                                            </Link>
                                        </div>
                                    </div>

                                    {/* SELECT RÁPIDO PARA ASIGNAR PROPIETARIO */}
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleLinkProperty(Number(e.target.value), prop.id);
                                            }
                                        }}
                                        defaultValue=""
                                        className="px-2 py-1 bg-white border border-amber-400 rounded-lg text-[11px] font-bold text-slate-700 outline-none cursor-pointer"
                                    >
                                        <option value="" disabled>
                                            + Asignar a...
                                        </option>
                                        {propietarios.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.nombre} {p.apellido || ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL VER NOTA COMPLETA */}
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

            {/* MODAL CREAR / EDITAR PROPIETARIO */}
            {editModalOwner && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                        <h3 className="font-spartan font-bold text-slate-900 text-base">
                            {editModalOwner.id ? '✏️ Editar Propietario' : '👤 Nuevo Propietario'}
                        </h3>

                        <form onSubmit={handleSaveOwner} className="space-y-3 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Nombre (*)</label>
                                <input
                                    type="text"
                                    required
                                    value={editModalOwner.nombre || ''}
                                    onChange={(e) => setEditModalOwner({ ...editModalOwner, nombre: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-brand-dark"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Apellido</label>
                                <input
                                    type="text"
                                    value={editModalOwner.apellido || ''}
                                    onChange={(e) => setEditModalOwner({ ...editModalOwner, apellido: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-brand-dark"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    value={editModalOwner.telefono || ''}
                                    onChange={(e) => setEditModalOwner({ ...editModalOwner, telefono: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-brand-dark"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editModalOwner.email || ''}
                                    onChange={(e) => setEditModalOwner({ ...editModalOwner, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-brand-dark"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Notas Privadas</label>
                                <textarea
                                    rows={4}
                                    value={editModalOwner.notasPrivadas || ''}
                                    onChange={(e) => setEditModalOwner({ ...editModalOwner, notasPrivadas: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-brand-dark"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditModalOwner(null)}
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

            {/* MODAL VINCULAR PROPIEDAD DESDE BOTÓN ... */}
            {linkModalOwnerId && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                        <h3 className="font-spartan font-bold text-slate-900 text-base">
                            🔗 Vincular Propiedad a Propietario #{linkModalOwnerId}
                        </h3>

                        <div className="space-y-3 text-xs">
                            <label className="block font-bold text-slate-700">
                                Seleccioná una propiedad libre (Sin Propietario / Colega):
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
                                        setLinkModalOwnerId(null);
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