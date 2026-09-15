'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { formatPrecio } from '@/lib/utils-formatting';
import { Fragment } from 'react';
import StarButton from '@/features/admin/form/components/star-button';
import { useContactLinks } from '@/providers/config-provider';
import { ExportExcelModal } from '@/features/admin/form/components/export-excel-modal';
import { useAlertModal } from '@/components/hooks/use-alert-modal';
import { useConfirmModal } from '@/components/hooks/use-confirm-modal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { AlertModal } from '@/components/ui/alert-modal';

interface ZonaNodo {
  id: number;
  nombre: string;
  padreId?: number | null;
  padre?: ZonaNodo | null;
}

interface PropiedadAdmin {
  id: number;
  codigo: string;
  titulo: string;
  slug: string;
  precio: number;
  moneda: string;
  isPublished: boolean;
  isUnlisted: boolean;
  isDestacada: boolean;
  videoUrl?: string | null;
  pdfUrl?: string | null;
  origen?: string | null;
  propietarioId?: number | null;
  colegaId?: number | null;
  propietario?: { id: number; nombre: string; apellido?: string | null } | null;
  colega?: { id: number; inmobiliaria: string; nombre: string } | null;
  updatedAt: string;
  deletedAt?: string | null;
  zonaId?: number | null;
  zona: ZonaNodo;
  tipoInmueble: { nombre: string; padre?: { slug: string } };
  imagenes: { url: string }[];
  direccionPersonalizada?: string | null;
  categoria: string;

}

export default function DashboardPage() {
  const links = useContactLinks();

  const [propiedades, setPropiedades] = useState<PropiedadAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Estados de Paginación Servidor
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filtros de estado
  const [activeTab, setActiveTab] = useState<'activas' | 'papelera'>('activas');
  const [currentSourceFilter, setCurrentSourceFilter] = useState<'all' | 'ms_propia' | 'colega'>('ms_propia');
  const [mercadoFilter, setMercadoFilter] = useState<string>('industrial'); // 'industrial' | 'comercial' | 'residencial'
  const [missingMedia, setMissingMedia] = useState<'all' | 'no_images' | 'no_video' | 'no_pdf'>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [groupBy, setGroupBy] = useState<'none' | 'tipo' | 'categoria' | 'zona'>('tipo');
  const [sortBy, setSortBy] = useState('updatedAt_desc');
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Debounce para el input de búsqueda (espera 400ms tras dejar de tipear)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Resetea a la página 1 al buscar
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Cargar propiedades de la API con Filtros + Paginación Server-Side
  const fetchPropiedades = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        tab: activeTab,
        page: page.toString(),
        limit: '25',
        source: currentSourceFilter,
        search: debouncedSearch,
        mercado: mercadoFilter,
        missingMedia: missingMedia,
        sortBy: sortBy,
      });

      const res = await fetch(`/api/properties?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPropiedades(data.propiedades || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Error cargando propiedades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropiedades();
  }, [activeTab, page, currentSourceFilter, mercadoFilter, debouncedSearch, missingMedia, sortBy]);

  // Resetear filtros y página al cambiar entre 'activas' y 'papelera'
  useEffect(() => {
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
  }, [activeTab, currentSourceFilter]);

  const getZonaJerarquia = (prop: PropiedadAdmin) => {
    const styles = `font-bold ${prop.zona?.padre?.padreId ? '' : 'bg-yellow-500 px-2 py-1 rounded-lg text-[10px] font-spartan uppercase tracking-wider'}`;
    return (
      <p className={styles}>{prop.zona?.padre?.padreId ? `📍 ${prop.zona.nombre}` : '⚠️ INCOMPLETA'}</p>
    );
  };

  // Cambiar estado de publicación (Borrador / Publicada)
  const { alertState, showAlert, closeAlert } = useAlertModal();
  const togglePublishStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/properties/${id}/toggle-published`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      const data = await res.json();

      if (res.ok) {
        // Actualizamos el estado local para reflejar el cambio en el switch/botón
        setPropiedades((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isPublished: !currentStatus } : p))
        );
      } else {
        showAlert(
          data.error || 'No se pudo cambiar el estado de la propiedad.',
          {
            title: 'Propiedad Incompleta',
            type: 'error',
          }
        );
      }
    } catch (err) {
      showAlert('Error de conexión al intentar actualizar el estado.', {
        title: 'Error de Red',
        type: 'error',
      });
    }
  };

  // Toggle rápido de propiedad Privada / Pública
  const toggleUnlistedStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/properties/${id}/toggle-unlisted`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isUnlisted: !currentStatus }),
      });
      if (res.ok) {
        setPropiedades((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isUnlisted: !currentStatus } : p))
        );
      }
    } catch (err) {
      showAlert('Error al cambiar la privacidad.', { type: 'error' });
    }
  };

  // Cambiar estado de listado (Listada / No Listada)
  const copyToClipboard = async (e: React.MouseEvent, prop: PropiedadAdmin) => {
    e.preventDefault();
    e.stopPropagation();

    if (!prop.isPublished) return;

    const url = `${window.location.origin}/propiedades/${prop.slug}`;

    try {
      await navigator.clipboard.writeText(url);
      // Feedback visual temporal en el mismo botón
      setCopiedId(prop.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Error al copiar el enlace:', err);
    }
  };

  const { confirmState, showConfirm, closeConfirm, handleConfirm } = useConfirmModal();
  // Soft Delete (Mover a Papelera)
  const handleSoftDelete = (id: number) => {
    showConfirm({
      title: '🗑️ Mover a la papelera',
      message: '¿Está seguro de que desea mover esta propiedad a la papelera de reciclaje?',
      confirmText: 'Mover a papelera',
      cancelText: 'Cancelar',
      type: 'warning',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
          if (res.ok) {
            setPropiedades((prev) => prev.filter((p) => p.id !== id));
          } else {
            showAlert('Error al mover a la papelera.', { type: 'error' });
          }
        } catch (err) {
          showAlert('Error de conexión al mover a la papelera.', { type: 'error' });
        }
      },
    });
  };

  // Restaurar desde Papelera
  const handleRestore = async (id: number) => {
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'PATCH' });
      if (res.ok) {
        setPropiedades((prev) => prev.filter((p) => p.id !== id));
        showAlert('Propiedad restaurada exitosamente.', { type: 'success' });
      }
    } catch (err) {
      showAlert('Error al restaurar la propiedad.', { type: 'error' });
    }
  };

  // Borrado Definitivo

  const handleDeleteProperty = (id: number, titulo: string) => {
    showConfirm({
      title: '¿Eliminar definitivamente?',
      message: `Vas a eliminar "${titulo}". Esta acción NO se podrá deshacer y quitará la propiedad del sitio web.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      type: 'danger',
      onConfirm: async () => {
        const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setPropiedades((prev) => prev.filter((p) => p.id !== id));
        } else {
          showAlert('Error al borrar la propiedad', { type: 'error' })
        }
      },
    });
  };

  const handleDuplicate = async (id: number) => {
    showConfirm({
      title: 'Crear una copia',
      message: '¿Deseas crear una copia exacta de esta propiedad?',
      confirmText: 'Duplicar',
      cancelText: 'Cancelar',
      type: 'warning',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/properties/${id}/duplicate`, {
            method: 'POST',
          });

          if (res.ok) {
            const data = await res.json();
            // Recargamos el listado para mostrar la nueva propiedad duplicada
            fetchPropiedades();
            // Opcional: redirigir directamente a editar la copia:
            // router.push(`/admin/${data.duplicatedId}/editar`);
          } else {
            alert('Error al duplicar la propiedad');
          }
        } catch (err) {
          console.error('Error duplicando:', err);
        }
      },
    });
  };

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
          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="ml-auto mr-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-spartan font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            📊 Exportar Excel
          </button>
          <Link
            href="/admin/crear"
            className="px-4 py-2 bg-brand-orange hover:bg-amber-600 text-brand-dark font-spartan font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
          >
            + Crear Nueva Propiedad
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* PESTAÑAS ACTIVAS VS PAPELERA & ORIGEN */}
        <div className="flex flex-col md:flex-row border-b border-slate-300 bg-white rounded-2xl p-2 shadow-sm justify-between items-center gap-2">
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('activas')}
              className={`flex-1 md:flex-none py-2.5 px-6 rounded-xl font-spartan font-bold text-xs uppercase tracking-wider transition-all ${activeTab === 'activas' ? 'bg-brand-dark text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              🏢 Propiedades Activas
            </button>
            <button
              onClick={() => setActiveTab('papelera')}
              className={`flex-1 md:flex-none py-2.5 px-6 rounded-xl font-spartan font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'papelera' ? 'bg-red-700 text-white shadow-sm' : 'text-slate-500 hover:bg-red-50'}`}
            >
              🗑️ Papelera de Reciclaje
            </button>
          </div>

          <div className="flex gap-1 bg-slate-200 p-1 rounded-xl w-full md:w-auto shadow-inner">
            <button
              onClick={() => { setCurrentSourceFilter('all'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-spartan font-bold text-[11px] uppercase tracking-wider transition-all ${currentSourceFilter === 'all' ? 'bg-brand-dark text-white shadow-xs' : 'text-slate-600'}`}
            >
              Todas
            </button>
            <button
              onClick={() => { setCurrentSourceFilter('ms_propia'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-spartan font-bold text-[11px] uppercase tracking-wider transition-all ${currentSourceFilter === 'ms_propia' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600'}`}
            >
              🏢 Cartera Propia
            </button>
            <button
              onClick={() => { setCurrentSourceFilter('colega'); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg font-spartan font-bold text-[11px] uppercase tracking-wider transition-all ${currentSourceFilter === 'colega' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600'}`}
            >
              🤝 De Colegas
            </button>
          </div>
        </div>

        {/* BARRA DE FILTROS RÁPIDOS */}
        <div className="bg-slate-300 p-4 rounded-2xl border border-slate-300 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-brand-dark">
          <div>
            <label className="block text-[10px] font-bold font-spartan uppercase mb-1">
              Buscar por Nombre / Código / Zona:
            </label>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Escriba para filtrar..."
              className="w-full px-3 py-2 border border-slate-400 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none focus:border-brand-dark placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold font-spartan uppercase mb-1">
              Mercado:
            </label>
            <select
              value={mercadoFilter}
              onChange={(e) => { setMercadoFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-slate-400 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none focus:border-brand-dark"
            >
              <option value="">Todos los mercados</option>
              <option value="industrial">🏭 Industrial</option>
              <option value="comercial">🏢 Comercial</option>
              <option value="residencial">🏡 Residencial</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold font-spartan uppercase mb-1">
              Faltantes / Calidad:
            </label>
            <select
              value={missingMedia}
              onChange={(e) => setMissingMedia(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-400 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none focus:border-brand-dark"
            >
              <option value="all">Todas las propiedades</option>
              <option value="no_images">⚠️ Sin Fotos</option>
              <option value="no_video">🎥 Sin Video</option>
              <option value="no_pdf">📄 Sin PDF</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold font-spartan uppercase mb-1">
              Ordenar por:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-slate-400 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none focus:border-brand-dark"
            >
              <option value="updatedAt_desc">Última modificación (Recientes)</option>
              <option value="updatedAt_asc">Última modificación (Antiguos)</option>
            </select>
          </div>
        </div>

        {/* TABLA DE PROPIEDADES */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold animate-pulse">
              📍 Cargando listado de propiedades...
            </div>
          ) : propiedades.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
              {activeTab === 'papelera' ? 'La papelera de reciclaje está vacía.' : 'No se encontraron propiedades registadas.'}
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
                    {activeTab === 'activas' && <th className="p-3 text-center">Destacada</th>}
                    <th className="p-3 text-center">Video</th>
                    <th className="p-3 text-center">PDF</th>
                    <th className="p-3 text-center">Estado</th>
                    <th className="p-3 text-center">Visibilidad</th>
                    <th className="p-3 text-center min-w-45">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {propiedades.map((prop) => (
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
                            <span className="font-extrabold text-[18px]">👆</span>
                          </Link>
                        ) : (
                          <span className="text-slate-700 font-extrabold leading-tight block">{prop.titulo}</span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">REF: {prop.codigo}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">
                        {getZonaJerarquia(prop)}
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
                      {activeTab === 'activas' && (
                        <td className="px-4 py-3 text-center">
                          <StarButton propiedadId={prop.id} initialIsFeatured={prop.isDestacada} />
                        </td>
                      )}
                      <td className="p-3 text-center">
                        {prop.videoUrl && prop.videoUrl !== links.videoIndustrialDefault ? '✔️' : '❌'}
                      </td>
                      <td className="p-3 text-center">
                        {prop.pdfUrl ? '✔️' : '❌'}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => togglePublishStatus(prop.id, prop.isPublished)}
                          disabled={activeTab === 'papelera'}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold font-spartan uppercase tracking-wider text-white transition-all disabled:opacity-50 ${prop.isPublished ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'
                            }`}
                        >
                          {prop.isPublished ? 'Publicada' : 'Borrador'}
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleUnlistedStatus(prop.id, Boolean(prop.isUnlisted))}
                          disabled={activeTab === 'papelera'}
                          className={`p-1.5 rounded-lg text-base transition-all border ${prop.isUnlisted ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-400'
                            }`}
                        >
                          {prop.isUnlisted ? '🔒' : '🌎'}
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-1 min-w-35">
                        {activeTab === 'activas' ? (
                          <>
                            <button
                              type="button"
                              onClick={(e) => copyToClipboard(e, prop)}
                              disabled={!prop.isPublished}
                              className={`px-1 py-1 text-[15px] font-bold rounded-lg transition-all inline-block ${prop.isPublished ? (copiedId === prop.id ? 'bg-emerald-600 text-white' : 'bg-slate-200 hover:bg-blue-400') : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                              {copiedId === prop.id ? '✅' : prop.isPublished ? '🔗' : '🚫'}
                            </button>
                            <Link
                              href={`/admin/${prop.id}/editar`}
                              className="px-1 border border-slate-300 bg-slate-200 hover:bg-blue-400 py-1 text-[15px] font-bold rounded-lg transition-colors inline-block"
                            >
                              ✏️
                            </Link>
                            <button
                              onClick={() => handleSoftDelete(prop.id)}
                              className="px-1 border border-slate-300 bg-slate-200 hover:bg-blue-400 py-1 text-[15px] font-bold rounded-lg transition-colors inline-block"
                            >
                              🗑️
                            </button>
                            <button
                              onClick={() => handleDuplicate(prop.id)}
                              className="px-1 border border-slate-300 bg-slate-200 hover:bg-blue-400 py-1 text-[15px] font-bold rounded-lg transition-colors inline-block"
                            >
                              📋
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRestore(prop.id)}
                              className="px-2 py-1.5 bg-emerald-300 hover:bg-emerald-500 text-emerald-900 text-[15px] font-bold rounded-lg transition-colors inline-block"
                            >
                              ♻️
                            </button>
                            <button
                              onClick={() => handleDeleteProperty(prop.id, prop.titulo)}
                              className="px-2 py-1.5 bg-red-400 hover:bg-red-600 text-white text-[15px] font-bold rounded-lg transition-colors inline-block"
                            >
                              ❌
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* CONTROLES DE PAGINACIÓN */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-200">
              <span className="text-xs font-spartan font-bold text-slate-600">
                Mostrando página {page} de {totalPages} ({total} propiedades en total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-spartan font-bold text-brand-dark uppercase tracking-wider hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-spartan font-bold text-brand-dark uppercase tracking-wider hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ExportExcelModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        activeTab={activeTab}
        mercados={[]}
      />

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
        isLoading={confirmState.isLoading}
      />
    </div>
  );
}