'use client';

import { createPortal } from 'react-dom';
import { usePropietarioModal } from '../hooks/use-propietario-modal';
import type { PropietarioModel } from '@/prisma/generated/models/Propietario';

interface PropietarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (nuevoPropietario: PropietarioModel) => void;
}

export function PropietarioModal({ isOpen, onClose, onCreated }: PropietarioModalProps) {
  const {
    mounted,
    formData,
    isSubmitting,
    error,
    handleChange,
    handleSubmit,
  } = usePropietarioModal(isOpen, onClose, onCreated);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-base">👤 Nuevo Propietario Rápido</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Ej: Juan Carlos"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Apellido
              </label>
              <input
                type="text"
                value={formData.apellido || ''}
                onChange={(e) => handleChange('apellido', e.target.value)}
                placeholder="Ej: Pérez"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Teléfono</label>
              <input
                type="text"
                value={formData.telefono || ''}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="11 ..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="juan@ejemplo.com"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Notas Privadas</label>
            <textarea
              value={formData.notasPrivadas || ''}
              onChange={(e) => handleChange('notasPrivadas', e.target.value)}
              placeholder="Notas adicionales que no se mostrarán al público."
              className="w-full h-20 p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-orange resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold bg-brand-orange text-white rounded-xl hover:bg-orange-600 transition shadow disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar y Seleccionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}