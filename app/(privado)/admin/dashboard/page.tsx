'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { formatPrecio } from '@/lib/utils-formatting';

interface PropiedadAdmin {
  id: number;
  codigo: string;
  titulo: string;
  slug: string;
  precio: number;
  moneda: string;
  isPublished: boolean;
  isDestacada: boolean;
  videoUrl?: string | null;
  pdfUrl?: string | null;
  propertySource?: string | null; // 'ms_propia' | 'colega'
  colegaId?: number | null;
  updatedAt: string;
  zona: { nombre: string };
  tipoInmueble: { nombre: string; padre?: { slug: string } };
  imagenes: { url: string }[];
  direccionPersonalizada?: string | null;
  categoria: string; // 'venta' | 'alquiler'
}

export default function DashboardPage() {
  const [propiedades, setPropiedades] = useState<PropiedadAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros de estado
  const [currentSourceFilter, setCurrentSourceFilter] = useState<'ms_propia' | 'colega'>('ms_propia');
  const [search, setSearch] = useState('');
  const [groupBy, setGroupBy] = useState<'none' | 'tipo' | 'categoria' | 'zona'>('tipo');
  const [sortBy, setSortBy] = useState('updatedAt_desc');

  // Cargar propiedades de la API
  const fetchPropiedades = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/properties');
      if (res.ok) {
        const data = await res.json();
        setPropiedades(data);
      }
    } catch (err) {
      console.error('Error cargando propiedades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropiedades();
  }, []);

  // Cambiar estado de publicación (Borrador / Publicada)
  const togglePublishStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/properties/${id}/toggle-published`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });
      if (res.ok) {
        setPropiedades((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isPublished: !currentStatus } : p))
        );
      }
    } catch (err) {
      alert('Error al cambiar el estado de publicación');
    }
  };

  // Eliminar propiedad
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta propiedad? Esta acción no se puede deshacer.')) return;

    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPropiedades((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      alert('Error al eliminar la propiedad');
    }
  };

  // Lógica de filtrado, búsqueda y orden
  const filteredAndSorted = useMemo(() => {
    return propiedades
      .filter((prop) => {
        // 1. Filtro por origen (Cartera Propia vs Colega)
        const isColega = prop.propertySource === 'colega' || !!prop.colegaId;
        if (currentSourceFilter === 'colega' && !isColega) return false;
        if (currentSourceFilter === 'ms_propia' && isColega) return false;

        // 2. Filtro de Búsqueda
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitulo = prop.titulo.toLowerCase().includes(q);
          const matchCodigo = prop.codigo.toLowerCase().includes(q);
          const matchZona = prop.zona?.nombre.toLowerCase().includes(q);
          return matchTitulo || matchCodigo || matchZona;
        }

        return true;
      })
      .sort((a, b) => {
        const [field, direction] = sortBy.split('_');
        let valA: any = a[field as keyof PropiedadAdmin];
        let valB: any = b[field as keyof PropiedadAdmin];

        if (field === 'price') {
          valA = a.precio;
          valB = b.precio;
        }

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [propiedades, currentSourceFilter, search, sortBy]);

  // Agrupamiento dinámico
  const groupedProperties = useMemo(() => {
    if (groupBy === 'none') return { 'Todas las Propiedades': filteredAndSorted };

    return filteredAndSorted.reduce((acc, prop) => {
      let key = 'Sin Categoría';
      if (groupBy === 'tipo') key = prop.tipoInmueble?.nombre || 'General';
      if (groupBy === 'categoria') key = prop.categoria.toUpperCase();
      if (groupBy === 'zona') key = prop.zona?.nombre || 'Sin Zona';

      if (!acc[key]) acc[key] = [];
      acc[key].push(prop);
      return acc;
    }, {} as Record<string, PropiedadAdmin[]>);
  }, [filteredAndSorted, groupBy]);

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      {/* HEADER SUPERIOR */}
      <div className="bg-slate-900 text-white py-4 px-6 mb-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-xs font-spartan font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors">
              ← Menú
            </Link>
            <h1 className="text-lg font-spartan font-bold">Dashboard de Propiedades</h1>
          </div>
          <Link
            href="/admin/crear"
            className="px-4 py-2 bg-brand-orange hover:bg-amber-600 text-white font-spartan font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
          >
            + Crear Nueva Propiedad
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* PESTAÑAS DE ORIGEN (CARTERA PROPIA VS COLEGAS) */}
        <div className="flex border-b border-slate-200 bg-white rounded-2xl p-2 shadow-sm gap-2">
          <button
            onClick={() => setCurrentSourceFilter('ms_propia')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-spartan font-bold text-xs uppercase tracking-wider transition-all ${currentSourceFilter === 'ms_propia'
                ? 'bg-brand-dark text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-100'
              }`}
          >
            🏢 Cartera Propia
          </button>
          <button
            onClick={() => setCurrentSourceFilter('colega')}
            className={`flex-1 py-2.5 px-4 rounded-xl font-spartan font-bold text-xs uppercase tracking-wider transition-all ${currentSourceFilter === 'colega'
                ? 'bg-brand-dark text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-100'
              }`}
          >
            🤝 Propiedades de Colegas
          </button>
        </div>

        {/* BARRA DE CONTROLES (BÚSQUEDA, AGRUPAR, ORDENAR) */}
        <div className=" text-brand-dark bg-slate-300 p-4 rounded-2xl border border-slate-300 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold font-spartan uppercase mb-1">
              Buscar por Nombre / Código:
            </label>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Escriba para filtrar..."
              className="w-full px-3 py-2 border border-slate-400 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none focus:border-brand-dark  placeholder:text-brand-dark"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold font-spartan uppercase mb-1">
              Agrupar por:
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="w-full px-3 py-2 border  border-slate-400  rounded-xl text-xs bg-slate-50 focus:bg-white outline-none focus:border-brand-dark"
            >
              <option value="none">Sin agrupar</option>
              <option value="tipo">Tipo de Inmueble</option>
              <option value="categoria">Categoría (Venta/Alquiler)</option>
              <option value="zona">Localidad / Zona</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold font-spartan uppercase mb-1">
              Ordenar por:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border  border-slate-400  rounded-xl text-xs bg-slate-50 focus:bg-white outline-none focus:border-brand-dark"
            >
              <option value="updatedAt_desc">Más recientes</option>
              <option value="precio_asc">Precio (menor a mayor)</option>
              <option value="precio_desc">Precio (mayor a menor)</option>
              <option value="titulo_asc">Nombre (A-Z)</option>
            </select>
          </div>
        </div>

        {/* TABLA DE PROPIEDADES */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold animate-pulse">
              📍 Cargando listado de propiedades...
            </div>
          ) : Object.keys(groupedProperties).length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
              No se encontraron propiedades registradas en este apartado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-200 text-[12px] font-spartan font-bold uppercase text-brand-dark">
                    <th className="p-3">Portada</th>
                    <th className="p-3">Título / Ref</th>
                    <th className="p-3">Ubicación</th>
                    <th className="p-3">Precio</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3 text-center">Video</th>
                    <th className="p-3 text-center">PDF</th>
                    <th className="p-3 text-center">Estado</th>
                    <th className="p-3 text-center">Destacada</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {Object.entries(groupedProperties).map(([groupName, props]) => (
                    <Fragment key={groupName}>
                      {groupBy !== 'none' && (
                        <tr className="bg-slate-100/70 border-y border-slate-200">
                          <td colSpan={10} className="p-2.5 px-4 font-spartan font-bold text-slate-700 uppercase tracking-wider text-[13px]">
                            {groupName} ({props.length})
                          </td>
                        </tr>
                      )}
                      {props.map((prop) => (
                        <tr key={prop.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 w-16">
                            <img
                              src={prop.imagenes?.[0]?.url || '/images/placeholder.jpg'}
                              alt=""
                              className="w-12 h-12 object-cover rounded-lg bg-slate-100 border border-slate-200"
                            />
                          </td>
                          <td className="p-3 font-semibold max-w-2xs">
                            {prop.isPublished ? (
                              <Link
                                href={`/propiedades/${prop.slug}`}
                                target="_blank"
                                className="text-blue-700 hover:text-amber-600 font-bold flex items-center gap-1 leading-tight"
                              >
                                {prop.titulo}
                                <span className=" font-extrabold text-[18px]">👆</span>

                              </Link>
                            ) : (
                              <span className="text-slate-700 font-extrabold leading-tight block">{prop.titulo}</span>
                            )}
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">REF: {prop.codigo}</span>
                          </td>
                          <td className="p-3 font-semibold text-slate-800">
                            {prop.zona?.nombre || 'N/A'}
                          </td>
                          <td className="p-3 font-extrabold text-slate-900">
                            {formatPrecio(prop.precio, prop.moneda)}
                          </td>
                          <td className="p-3 font-semibold text-slate-600">
                            <p className="capitalize">{prop.tipoInmueble?.nombre}</p>
                            <span className={`text-[10px] uppercase text-slate-800 p-1 rounded-lg ${prop.categoria === 'venta' ? 'bg-cyan-300/50' : 'bg-brand-orange/50'}`}>
                              {prop.categoria}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {prop.videoUrl ? '✔️' : '❌'}
                          </td>
                          <td className="p-3 text-center">
                            {prop.pdfUrl ? '✔️' : '❌'}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => togglePublishStatus(prop.id, prop.isPublished)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold font-spartan uppercase tracking-wider text-white transition-all ${prop.isPublished ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'
                                }`}
                            >
                              {prop.isPublished ? 'Publicada' : 'Borrador'}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <StarButton
                              propiedadId={prop.id}
                              initialIsFeatured={prop.isDestacada}
                            />
                          </td>
                          <td className="p-3 text-right space-x-1">
                            <Link
                              href={`/admin/${prop.id}/editar`}
                              className="px-2 py-1.5 bg-cyan-300 hover:bg-cyan-500 text-slate-800 text-[15px] font-bold rounded-lg transition-colors inline-block"
                            >
                              ✏️
                            </Link>
                            <button
                              onClick={() => handleDelete(prop.id)}
                              className="px-2 py-1.5 bg-red-300 hover:bg-red-500 text-red-700 text-[15px] font-bold rounded-lg transition-colors inline-block"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { Fragment } from 'react';
import StarButton from '@/features/admin/form/components/star-button';
