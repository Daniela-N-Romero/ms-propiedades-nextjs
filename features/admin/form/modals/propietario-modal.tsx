'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createPropietarioAction } from '@/features/admin/form/actions/catalogos-actions';

interface PropietarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (nuevoPropietario: { id: number; nombre: string; apellido?: string; telefono?: string; email?: string; notasPrivadas?: string }) => void;
}

export function PropietarioModal({ isOpen, onClose, onCreated }: PropietarioModalProps) {
  const [mounted, setMounted] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [notasPrivadas, setNotas] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Evitar que el submit se propague hacia arriba
    setError(null);
    setIsSubmitting(true);

    const result = await createPropietarioAction({ nombre, apellido, telefono, email, notasPrivadas });

    setIsSubmitting(false);

    if (result.success && result.propietario) {
      onCreated({ 
        id: result.propietario.id, 
        nombre: result.propietario.nombre, 
        apellido: result.propietario.apellido,
        telefono: result.propietario.telefono,
        email: result.propietario.email,
        notasPrivadas: result.propietario.notasPrivadas,
      });
      setNombre('');
      setApellido('');
      setTelefono('');
      setEmail('');
      setNotas('');
      onClose();
    } else {
      setError(result.error || 'Ocurrió un error inesperado.');
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-base">👤 Nuevo Propietario Rápido</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
            ✕
          </button>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
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
                required
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
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
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="11 ..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@ejemplo.com"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>
          </div>


          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Notas Privadas</label>
            <textarea
              value={notasPrivadas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Notas adicionales que no se mostraran al público."
              className="w-full h-20 p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold bg-brand-orange text-white rounded-xl hover:bg-orange-600 transition shadow disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar y Seleccionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Renderiza el modal fuera del <form> principal mediante un Portal
  return createPortal(modalContent, document.body);
}