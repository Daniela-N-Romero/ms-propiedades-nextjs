'use client';

import { createPortal } from 'react-dom';
import { useZonaModal } from '../hooks/use-zona-modal';
import type { ZonaModel } from '@/prisma/generated/models/Zona';

interface ZonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: 'region' | 'partido' | 'localidad';
  padreId?: number | null;
  onCreated: (nuevaZona: ZonaModel) => void;
}

export function ZonaModal({ isOpen, onClose, tipo, padreId, onCreated }: ZonaModalProps) {
  const {
    mounted,
    nombre,
    setNombre,
    isSubmitting,
    error,
    handleSubmit,
  } = useZonaModal(isOpen, padreId, onClose, onCreated);

  if (!isOpen || !mounted) return null;

  const tituloTipo =
    tipo === 'region' ? 'Región Principal' : tipo === 'partido' ? 'Partido / Comuna' : 'Localidad';

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 border border-slate-200">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
            📍 Nueva {tituloTipo}
          </h3>
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
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Nombre de la {tituloTipo} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={
                tipo === 'region'
                  ? 'Ej: GBA Sur'
                  : tipo === 'partido'
                  ? 'Ej: Berazategui'
                  : 'Ej: El Pato'
              }
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-orange"
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
              className="px-4 py-2 text-xs font-bold bg-brand-orange text-white rounded-xl hover:bg-orange-600 transition shadow-xs disabled:opacity-50 cursor-pointer"
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