'use client';
import NextImage from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAlertModal } from '@/components/hooks/use-alert-modal';
import { AlertModal } from '@/components/ui/alert-modal';

interface PropiedadMeta {
  id: number;
  codigo: string;
  titulo: string;
  origen: 'own' | 'fromColleague';
  slug: string;
  permitMetaAd: boolean;
  precio: number;
  moneda: string;
  isPublished: boolean;
  imagenMetaUrl?: string | null;
  tipoInmueble?: { nombre: string; padre?: { nombre: string } };
  imagenes: { url: string }[];
}

export default function PublicidadAdminPage() {
  const [propiedades, setPropiedades] = useState<PropiedadMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // 👈 Estado de vista (Grid/Lista)

  const [feedUrl, setFeedUrl] = useState('https://mspropiedadesindustrial.com.ar/api/meta/feed');
  const { alertState, showAlert, closeAlert } = useAlertModal();

  useEffect(() => {
    // Sincronizamos la URL con el origen real del cliente (localhost o producción)
    if (typeof window !== 'undefined') {
      setFeedUrl(`${window.location.origin}/api/meta/feed`);
    }
    fetchPropiedades();
  }, []);

  const fetchPropiedades = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/properties?tab=activas', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPropiedades(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropiedades();
  }, []);

  // Toggle rápido de activación en Meta
  const toggleMetaAd = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/meta/${id}/toggle-meta-ad`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permitMetaAd: !currentStatus }),
      });

      if (res.ok) {
        setPropiedades((prev) =>
          prev.map((p) => (p.id === id ? { ...p, permitMetaAd: !currentStatus } : p))
        );
      } else {
        showAlert('No se pudo actualizar el estado para Meta Ads.', { type: 'error' });
      }
    } catch (err) {
      showAlert('Error de conexión.', { type: 'error' });
    }
  };

  const copyFeedUrl = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtro por búsqueda (Título, Código REF o Moneda/Precio)
  const propiedadesFiltradas = propiedades.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      p.titulo.toLowerCase().includes(q) ||
      (p.codigo && p.codigo.toLowerCase().includes(q));

    const mercadoNombre = (p.tipoInmueble?.padre?.nombre || p.tipoInmueble?.nombre || '').toLowerCase();
    
    let matchCategory = true;
    if (categoryFilter !== 'all') {
      matchCategory = mercadoNombre.includes(categoryFilter.toLowerCase());
    }

    return matchSearch && matchCategory;
  });

  // ORDENAMIENTO (Incluidas primero, sin foto 1:1 primero dentro de incluidas, excluidas al final)
  const propiedadesOrdenadas = [...propiedadesFiltradas].sort((a, b) => {
    if (a.permitMetaAd && !b.permitMetaAd) return -1;
    if (!a.permitMetaAd && b.permitMetaAd) return 1;

    const aNeedOpt = a.permitMetaAd && !a.imagenMetaUrl;
    const bNeedOpt = b.permitMetaAd && !b.imagenMetaUrl;
    if (aNeedOpt && !bNeedOpt) return -1;
    if (!aNeedOpt && bNeedOpt) return 1;

    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      {/* HEADER */}
      <div className="bg-slate-900 text-white py-4 px-6 mb-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-xs font-spartan font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
            >
              ← Menú
            </Link>
            <h1 className="text-lg font-spartan font-bold">📢 Gestión de Publicidad & Meta Feed</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* TARJETA DE INFORMACIÓN Y URL DEL FEED */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex w-full justify-between align-baseline">
              <h2 className="text-base font-bold text-slate-900 font-spartan uppercase tracking-wider">
                🌐 Enlace de Sincronización Automática (Data Feed)
              </h2>
              <a
                href={feedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 min-w-20 py-2 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
              >
                🔍 Ver Feed en Vivo
              </a>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 w-full">
              Pega este enlace en Meta Commerce Manager en la opción "Scheduled Feed" para sincronización diaria.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={feedUrl}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-slate-700 outline-none select-all"
            />
            <button
              onClick={copyFeedUrl}
              className={`min-w-30 px-2 py-3 rounded-xl font-spartan font-bold text-xs uppercase tracking-wider text-white transition-all ${copied ? 'bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'
                }`}
            >
              {copied ? '✅ Copiado' : '📋 Copiar Link'}
            </button>
          </div>
        </div>

        {/* BARRA DE HERRAMIENTAS: BÚSQUEDA Y CAMBIO DE VISTA */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">

{/* BUSCADOR Y FILTROS */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* BUSCADOR */}
            <div className="relative w-full sm:w-72">
              <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Buscar por Título o REF..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* FILTRO POR TIPO / MERCADO */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">📂 Todos los Mercados</option>
              <option value="industrial">🏭 Industrial / Galpones</option>
              <option value="comercial">🏢 Comercial / Locales</option>
              <option value="terreno">📐 Terrenos / Lotes</option>
              <option value="residencial">🏡 Residencial</option>
            </select>
          </div>

          {/* TOGGLES DE VISTA LISTA / GRILLA */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs text-slate-500 font-medium">
              Mostrando <strong className="text-slate-800">{propiedadesOrdenadas.length}</strong> inmuebles
            </span>

            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>🔲</span> Grilla 1:1
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>☰</span> Lista
              </button>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs font-semibold animate-pulse">
            Cargando catálogo...
          </div>
        ) : propiedadesOrdenadas.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs font-medium">
            No se encontraron propiedades que coincidan con la búsqueda "{searchQuery}".
          </div>
        ) : viewMode === 'grid' ? (

          /* 1️⃣ VISTA EN GRILLA (1:1 INSTAGRAM) */
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {propiedadesOrdenadas.map((prop) => {
              // Si tiene foto de meta la usa, sino toma la portada normal
              const displayImage = prop.imagenMetaUrl || prop.imagenes?.[0]?.url || '/images/placeholder.jpg';
              const hasCustomMetaImage = Boolean(prop.imagenMetaUrl)

              return (
                <div
                  key={prop.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md ${prop.permitMetaAd
                    ? 'border-blue-200 ring-2 ring-blue-500/10'
                    : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                >
                  <div>
                    {/* CONTENEDOR 1:1 SQUARISH */}
                    <div className="relative aspect-square w-full bg-slate-100 overflow-hidden group">
                      <img
                        src={displayImage}
                        alt={prop.titulo}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* BADGES SUPERIORES */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start gap-1">
                        <span
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase shadow-sm ${prop.origen === 'own' ? 'bg-emerald-500 text-white' : 'bg-yellow-600/80 text-white'
                            }`}
                        >
                          {prop.origen === 'own' ? 'Propia' : 'Colega'}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm ${prop.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                        >
                          {prop.isPublished ? '🌐 Activa' : '📝 Borrador'}
                        </span>
                      </div>

                      {/* BADGES INFERIORES DE ESTADO DE IMAGEN META */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                        {!hasCustomMetaImage && (
                          <span className="bg-amber-700/80 backdrop-blur-xs text-amber-200 text-[9px] font-bold px-3 py-1 rounded-md flex items-center gap-1 shadow-sm">
                            ⚠️ Falta Foto 1:1 Meta
                          </span>
                          )
                         }
                      </div>
                    </div>

                    {/* CONTENIDO TARJETA */}
                    <div className="p-4 space-y-2">
                      <span className="text-[10px] font-mono text-slate-400 block font-semibold">
                        REF: {prop.codigo}
                      </span>
                      <h4 className="font-spartan font-bold text-xs text-slate-900 line-clamp-2 leading-tight">
                        <Link
                          href={`/propiedades/${prop.slug}`}
                          target="_blank"
                          className="text-blue-800">
                          {prop.titulo}
                        </Link>
                      </h4>
                    </div>
                  </div>

                  {/* BOTÓN INCLUIR / EXCLUIR */}
                  <div className="p-4 pt-0 space-y-2">
                    <button
                      onClick={() => toggleMetaAd(prop.id, prop.permitMetaAd)}
                      className={`w-full py-2 rounded-xl text-[11px] font-bold font-spartan uppercase transition-all shadow-2xs ${prop.permitMetaAd
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                    >
                      {prop.permitMetaAd ? '✅ Incluida en Feed' : '🚫 Excluida de Feed'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (

          /* 2️⃣ VISTA EN LISTA (TABLA CLÁSICA) */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-spartan font-bold uppercase text-slate-700">
                    <th className="p-3">Portada 1:1</th>
                    <th className="p-3">Ref / Título</th>
                    <th className="p-3 min-w-35">Estado Foto Meta</th>
                    <th className="p-3">Origen</th>
                    <th className="p-3 min-w-35 text-center">Estado Web</th>
                    <th className="p-3 text-center">Anunciar en Meta Ads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {propiedadesOrdenadas.map((prop) => (
                    <tr key={prop.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 w-16">
                        <img
                          src={prop.imagenMetaUrl || prop.imagenes?.[0]?.url || '/images/placeholder.jpg'}
                          alt=""
                          className="w-12 h-12 object-contain rounded-xl bg-slate-100 border border-slate-200"
                        />
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        <span className="text-[10px] font-mono text-slate-400 block">REF: {prop.codigo}</span>
                        <Link
                          href={`/propiedades/${prop.slug}`}
                          target="_blank"
                          className="text-blue-600">
                          {prop.titulo}
                        </Link>
                      </td>
                      <td className="p-3">
                          {!prop.imagenMetaUrl &&(
                            <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-800">
                              ⚠️ Falta Foto 1:1
                            </span>
                            )
                          }
                        </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${prop.origen === 'own' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                          {prop.origen === 'own' ? 'Propia' : 'Colega'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-center ${prop.isPublished ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                          {prop.isPublished ? '🌐 Publicada' : '📝 Borrador'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleMetaAd(prop.id, prop.permitMetaAd)}
                          className={`px-4 py-1.5 rounded-xl text-[11px] font-bold font-spartan uppercase transition-all shadow-2xs ${prop.permitMetaAd
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-600'
                            }`}
                        >
                          {prop.permitMetaAd ? '✅ Incluida' : '🚫 Excluida'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
    </div>
  );
}