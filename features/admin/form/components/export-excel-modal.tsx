// features/admin/form/components/export-excel-modal.tsx
'use client';

import { useAlertModal } from '@/components/hooks/use-alert-modal';
import { AlertModal } from '@/components/ui/alert-modal';
import { useState, useEffect } from 'react';

interface ExportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'activas' | 'papelera';
  mercados?: { id: string | number; nombre: string }[];
}

const OPCIONES_COLUMNAS = [
  { id: 'codigo', label: 'Código / Referencia' },
  { id: 'titulo', label: 'Título Comercial' },
  { id: 'linkPropiedad', label: 'Enlace Público de Ficha' },
  { id: 'categoria', label: 'Operación (Venta/Alquiler)' },
  { id: 'precio', label: 'Precio' },
  { id: 'moneda', label: 'Moneda (USD/ARS)' },
  { id: 'mercado', label: 'Mercado Principal' },
  { id: 'subtipo', label: 'Subtipo / Categoría' },
  { id: 'superficieTotal', label: 'Superficie Total (m²)' },
  { id: 'superficieCubierta', label: 'Superficie Cubierta (m²)' },
  { id: 'localidad', label: 'Localidad / Zona' },
  { id: 'direccion', label: 'Dirección Personalizada' },
  { id: 'estado', label: 'Estado (Publicada/Borrador)' },
  { id: 'visibilidad', label: 'Visibilidad (Pública/Privada)' },
  { id: 'destacada', label: '¿Es Destacada?' },
  { id: 'origen', label: 'Origen (Propia / Colega)' },
  { id: 'agente', label: 'Agente Responsable' },
  { id: 'imagenPortada', label: 'Link de Imagen de Portada' },
  { id: 'hasImages', label: '¿Tiene Fotos Propias?' },
  { id: 'hasVideo', label: 'Tiene Video (SÍ/NO)' },
  { id: 'hasPdf', label: 'Tiene PDF (SÍ/NO)' },
  { id: 'videoUrl', label: 'URL Directa Video' },
  { id: 'pdfUrl', label: 'URL Directa PDF' },
  { id: 'updatedAt', label: 'Fecha de Modificación' },
];

export function ExportExcelModal({ isOpen, onClose, activeTab, mercados = [] }: ExportExcelModalProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    OPCIONES_COLUMNAS.map((c) => c.id)
  );

  const [publishStateFilter, setPublishStateFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [tipoInmuebleFilter, setTipoInmuebleFilter] = useState<string>('all');

  const [sourceFilter, setSourceFilter] = useState<'all' | 'ms_propia' | 'colega'>('all');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'has_video' | 'no_video' | 'has_pdf' | 'no_pdf'>('all');
  const [sortBy, setSortBy] = useState('updatedAt_desc');
  const [loading, setLoading] = useState(false);
  const { alertState, showAlert, closeAlert } = useAlertModal();


  if (!isOpen) return null;

  const toggleColumn = (id: string) => {
    setSelectedColumns((prev) =>
      prev.includes(id) ? prev.filter((col) => col !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedColumns.length === OPCIONES_COLUMNAS.length) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns(OPCIONES_COLUMNAS.map((c) => c.id));
    }
  };

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      showAlert('Por favor selecciona al menos una columna.', { type: 'warning' });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/properties/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          columns: selectedColumns,
          source: sourceFilter,
          missingMedia: mediaFilter,
          publishState: publishStateFilter,
          tipoInmuebleId: tipoInmuebleFilter, // Envia "all", "industrial", "comercial", etc.
          sortBy,
          tab: activeTab,
        }),
      });

      if (!response.ok) throw new Error('Error al generar Excel');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Propiedades_MS_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (err) {
      showAlert('Ocurrió un error al descargar el reporte Excel.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          {/* ... (sin cambios en header) ... */}
          <div>
            <h3 className="font-spartan font-bold text-base text-slate-900 uppercase tracking-wider flex items-center gap-2">
              📊 Exportar Listado a Excel
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalizá los campos y filtros del reporte descargable.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* CONTENIDO SCROLLEABLE */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">

          {/* 👈 NUEVOS FILTROS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">

            {/* 1. ESTADO */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[9px]">
                Estado:
              </label>
              <select
                value={publishStateFilter}
                onChange={(e) => setPublishStateFilter(e.target.value as any)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-orange text-[11px]"
              >
                <option value="all">Todas</option>
                <option value="published">🌐 Solo Publicadas</option>
                <option value="draft">📝 Solo Borradores</option>
              </select>
            </div>

            {/* 2. TIPO */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[9px]">
                Mercado:
              </label>
              <select
                value={tipoInmuebleFilter}
                onChange={(e) => setTipoInmuebleFilter(e.target.value)} // 👈 Sin Number(), asignación directa como string
                className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-orange text-[11px]"
              >
                <option value="all">Todos los mercados</option>
                {mercados.map((m) => (
                  // 👈 Aseguramos que m.id sea siempre un string válido
                  <option key={String(m.id)} value={String(m.id)}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. ORIGEN */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[9px]">
                Origen:
              </label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as any)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-orange text-[11px]"
              >
                <option value="all">Propia / Colegas</option>
                <option value="ms_propia">Propia MS</option>
                <option value="colega">De Colegas</option>
              </select>
            </div>

            {/* 4. MULTIMEDIA */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[9px]">
                Multimedia:
              </label>
              <select
                value={mediaFilter}
                onChange={(e) => setMediaFilter(e.target.value as any)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-orange text-[11px]"
              >
                <option value="all">Sin restricción</option>
                <option value="has_video">Con Video</option>
                <option value="no_video">Sin Video</option>
                <option value="has_pdf">Con PDF</option>
                <option value="no_pdf">Sin PDF</option>
              </select>
            </div>

            {/* 5. ORDEN */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[9px]">
                Ordenamiento:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-orange text-[11px]"
              >
                <option value="updatedAt_desc">Recientes</option>
                <option value="precio_asc">Precio (↑)</option>
                <option value="precio_desc">Precio (↓)</option>
                <option value="titulo_asc">Nombre (A-Z)</option>
              </select>
            </div>
          </div>

          {/* SELECCIÓN DE COLUMNAS */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                Columnas a exportar ({selectedColumns.length}/{OPCIONES_COLUMNAS.length}):
              </span>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-brand-orange font-bold hover:underline text-[11px]"
              >
                {selectedColumns.length === OPCIONES_COLUMNAS.length
                  ? 'Deseleccionar Todas'
                  : 'Seleccionar Todas'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[35vh] overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
              {OPCIONES_COLUMNAS.map((col) => {
                const isSelected = selectedColumns.includes(col.id);
                return (
                  <label
                    key={col.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${isSelected
                      ? 'bg-white/60 border-brand-orange font-bold shadow-2xs'
                      : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleColumn(col.id)}
                      className="accent-brand-orange w-4 h-4 shrink-0"
                    />
                    <span className="leading-tight text-[11px]">{col.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleExport}
            className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Generando Excel...' : '📥 Descargar Excel (.xlsx)'}
          </button>
        </div>
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