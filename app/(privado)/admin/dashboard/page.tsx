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
  propertySource?: string | null;
  colegaId?: number | null;
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

  // Filtros de estado
  const [activeTab, setActiveTab] = useState<'activas' | 'papelera'>('activas');
  const [currentSourceFilter, setCurrentSourceFilter] = useState<'ms_propia' | 'colega'>('ms_propia');
  const [missingMedia, setMissingMedia] = useState<'all' | 'no_images' | 'no_video' | 'no_pdf'>('all');
  const [search, setSearch] = useState('');
  const [groupBy, setGroupBy] = useState<'none' | 'tipo' | 'categoria' | 'zona'>('tipo');
  const [sortBy, setSortBy] = useState('updatedAt_desc');
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Cargar propiedades de la API
  const fetchPropiedades = async () => {
    try {
      setLoading(true);
      // Agregamos no-store para forzar a la API a traer datos frescos
      const res = await fetch(`/api/properties?tab=${activeTab}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        console.log('📦 Propiedades recibidas de la API:', data); // <--- Inspecciona las fechas aquí
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

    const onFocus = () => fetchPropiedades();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [activeTab]);

  // Resetear filtros al cambiar entre 'activas' y 'papelera'
  useEffect(() => {
    setSearch('');
    setMissingMedia('all');
  }, [activeTab]);


  const getZonaJerarquia = (prop: PropiedadAdmin) => {

    const styles = `font-bold ${prop.zona?.padre?.padreId ? '' : 'bg-yellow-500 px-2 py-1 rounded-lg text-[10px] font-spartan uppercase tracking-wider'}`;
    // Imprimimos la zona como texto puro para ver qué llega exactamente
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
        // 🚨 Muestra la modal explicativa si el backend rechaza la publicación (Status 400)
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

  // Lógica unificada de filtrado, faltantes y ordenamiento en el cliente
  const filteredAndSorted = useMemo(() => {
    return propiedades
      .filter((prop) => {
        // 1. Origen (Cartera Propia vs Colega)
        const isColega = prop.propertySource === 'colega' || Boolean(prop.colegaId);

        if (currentSourceFilter === 'colega' && !isColega) return false;
        if (currentSourceFilter === 'ms_propia' && isColega) return false;

        // 2. Filtro de Búsqueda
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitulo = prop.titulo.toLowerCase().includes(q);
          const matchCodigo = prop.codigo.toLowerCase().includes(q);
          const matchZona = prop.zona?.nombre.toLowerCase().includes(q);
          if (!matchTitulo && !matchCodigo && !matchZona) return false;
        }

        // 3. Filtros de Faltantes / Calidad
        const hasCustomVideo = Boolean(prop.videoUrl && prop.videoUrl !== links.videoIndustrialDefault);
        const hasImages = Boolean(prop.imagenes && prop.imagenes.length > 0 && prop.imagenes[0].url !== '/images/placeholder.jpg' && prop.imagenes[0].url !== '/images/placeholder.png');
        const hasPdf = Boolean(prop.pdfUrl);

        if (missingMedia === 'no_images' && hasImages) return false;
        if (missingMedia === 'no_video' && hasCustomVideo) return false;
        if (missingMedia === 'no_pdf' && hasPdf) return false;

        return true;
      })
      .sort((a, b) => {
        const [field, direction] = sortBy.split('_');

        if (field === 'updatedAt') {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        if (field === 'precio') {
          return direction === 'asc' ? a.precio - b.precio : b.precio - a.precio;
        }

        if (field === 'titulo') {
          return direction === 'asc' ? a.titulo.localeCompare(b.titulo) : b.titulo.localeCompare(a.titulo);
        }

        return 0;
      });
  }, [propiedades, currentSourceFilter, search, missingMedia, sortBy, links.videoIndustrialDefault]);

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

const mercadosDisponibles = useMemo(() => {
  const map = new Map<string, { id: string | number; nombre: string }>();

  propiedades.forEach((prop) => {
    // Si la propiedad tiene un mercado padre (ej: Industrial, Comercial)
    const padre = prop.tipoInmueble?.padre;
    if (padre) {
      const nombre = padre.slug.toUpperCase(); // O el nombre si lo tenés
      if (!map.has(nombre)) {
        map.set(nombre, {
          id: padre.slug, // Usamos el slug como ID único
          nombre: padre.slug.charAt(0).toUpperCase() + padre.slug.slice(1),
        });
      }
    } else if (prop.tipoInmueble?.nombre) {
      // Fallback con el tipo directo
      const nombre = prop.tipoInmueble.nombre;
      if (!map.has(nombre)) {
        map.set(nombre, { id: nombre, nombre });
      }
    }
  });

  return Array.from(map.values());
}, [propiedades]);

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
          {/* BOTÓN PARA EXPORTAR EXCEL */}
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

          <div className="flex gap-1 bg-brand-dark/20 rounded-xl w-full md:w-auto shadow-lg">
            <button
              onClick={() => setCurrentSourceFilter('ms_propia')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-spartan font-bold text-[11px] uppercase tracking-wider transition-all ${currentSourceFilter === 'ms_propia' ? 'bg-green-900 text-white shadow-xs' : 'text-slate-600'}`}
            >
              🏢 Cartera Propia
            </button>
            <button
              onClick={() => setCurrentSourceFilter('colega')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-spartan font-bold text-[11px] uppercase tracking-wider transition-all ${currentSourceFilter === 'colega' ? 'bg-green-900 text-white shadow-xs' : 'text-slate-600 '}`}
            >
              🤝 De Colegas
            </button>
          </div>
        </div>

        {/* BARRA DE CONTROLES (BÚSQUEDA, FALTANTES, AGRUPAR, ORDENAR) */}
        <div className="bg-slate-300 p-4 rounded-2xl border border-slate-300 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-brand-dark">
          <div>
            <label className="block text-[10px] font-bold font-spartan uppercase mb-1">
              Buscar por Nombre / Código:
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
              Faltantes / Calidad:
            </label>
            <select
              value={missingMedia}
              onChange={(e) => setMissingMedia(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-400 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none focus:border-brand-dark"
            >
              <option value="all">Todas las propiedades</option>
              <option value="no_images">⚠️ Sin Fotos (Placeholder)</option>
              <option value="no_video">🎥 Sin Video Propio</option>
              <option value="no_pdf">📄 Sin PDF Adjunto</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold font-spartan uppercase mb-1">
              Agrupar por:
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-400 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none focus:border-brand-dark"
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
              className="w-full px-3 py-2 border border-slate-400 rounded-xl text-xs bg-slate-50 focus:bg-white outline-none focus:border-brand-dark"
            >
              <option value="updatedAt_desc">Última modificación (Recientes)</option>
              <option value="updatedAt_asc">Última modificación (Antiguos)</option>
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
              {activeTab === 'papelera' ? 'La papelera de reciclaje está vacía.' : 'No se encontraron propiedades registradas con estos filtros.'}
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
                    <th className="p-3 text-center min-w-25">Acciones</th>
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
                            {/* Verificación de Video Propio contra el default */}
                            {prop.videoUrl && prop.videoUrl !== links.videoIndustrialDefault ? '✔️' : '❌'}
                          </td>
                          <td className="p-3 text-center">
                            {prop.pdfUrl ? '✔️' : '❌'}
                          </td>
                          {/* 1. COLUMNA DE ESTADO (Publicada / Borrador) */}
                          <td className="p-3 text-center">
                            <button
                              onClick={() => togglePublishStatus(prop.id, prop.isPublished)}
                              disabled={activeTab === 'papelera'}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold font-spartan uppercase tracking-wider text-white transition-all disabled:opacity-50 ${prop.isPublished
                                ? 'bg-emerald-500 hover:bg-emerald-600'
                                : 'bg-amber-500 hover:bg-amber-600'
                                }`}
                            >
                              {prop.isPublished ? 'Publicada' : 'Borrador'}
                            </button>
                          </td>

                          {/* 2. NUEVA COLUMNA DE VISIBILIDAD / PRIVACIDAD CON CANDADOS */}
                          <td className="p-3 text-center">
                            <button
                              onClick={() => toggleUnlistedStatus(prop.id, Boolean(prop.isUnlisted))}
                              disabled={activeTab === 'papelera'}
                              title={
                                prop.isUnlisted
                                  ? 'Propiedad Privada (Solo accesible por link)'
                                  : 'Propiedad Pública (Visible en buscador y Google)'
                              }
                              className={`p-1.5 rounded-lg text-base transition-all border ${prop.isUnlisted
                                ? 'bg-indigo-100 border-indigo-300 text-indigo-700 hover:bg-indigo-200' // Candado activo (Privada)
                                : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
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
                                  title={prop.isPublished ? 'Copiar enlace de la ficha' : 'Propiedad en Borrador (Link no disponible)'}
                                  className={`px-2 py-1.5 text-[13px] font-bold rounded-lg transition-all inline-block ${prop.isPublished
                                    ? copiedId === prop.id
                                      ? 'bg-emerald-600 text-white' // Feedback al copiar
                                      : 'bg-emerald-300 hover:bg-emerald-400 text-slate-800'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                  {copiedId === prop.id ? '✅' : prop.isPublished ? '🔗' : '🚫'}
                                </button>
                                <Link
                                  href={`/admin/${prop.id}/editar`}
                                  className="px-2 py-1.5 bg-cyan-300 hover:bg-cyan-500 text-slate-800 text-[15px] font-bold rounded-lg transition-colors inline-block"
                                >
                                  ✏️
                                </Link>
                                <button
                                  onClick={() => handleSoftDelete(prop.id)}
                                  title="Mover a Papelera"
                                  className="px-2 py-1.5 bg-amber-200 hover:bg-amber-400 text-amber-800 text-[15px] font-bold rounded-lg transition-colors inline-block"
                                >
                                  🗑️
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleRestore(prop.id)}
                                  title="Restaurar Propiedad"
                                  className="px-2 py-1.5 bg-emerald-300 hover:bg-emerald-500 text-emerald-900 text-[15px] font-bold rounded-lg transition-colors inline-block"
                                >
                                  ♻️
                                </button>
                                <button
                                  onClick={() => handleDeleteProperty(prop.id, prop.titulo)}
                                  title="Eliminar Definitivamente"
                                  className="px-2 py-1.5 bg-red-400 hover:bg-red-600 text-white text-[15px] font-bold rounded-lg transition-colors inline-block"
                                >
                                  ❌
                                </button>

                              </>
                            )}
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
      {/* MODAL DE EXPORTACIÓN */}
      <ExportExcelModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        activeTab={activeTab}
        mercados={mercadosDisponibles}
      />

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />

      {/* COMPONENTE MODAL DE CONFIRMACIÓN */}
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