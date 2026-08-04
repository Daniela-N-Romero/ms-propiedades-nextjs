'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createColegaAction } from '@/features/admin/actions/catalogos-actions';

interface ColegaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (nuevoColega: { id: number; nombre?: string; inmobiliaria?: string | null; apellido?: string; telefono?: string; email?: string; notasPrivadas?: string  }) => void;
}

export function ColegaModal({ isOpen, onClose, onCreated }: ColegaModalProps) {
  const [mounted, setMounted] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [inmobiliaria, setInmobiliaria] = useState('');
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
    e.stopPropagation();
    setError(null);
    setIsSubmitting(true);

    const result = await createColegaAction({ nombre, apellido, inmobiliaria, telefono, email, notasPrivadas });

    setIsSubmitting(false);

    if (result.success && result.colega) {
      onCreated({
        id: result.colega.id,
        nombre: result.colega.nombre,
        apellido: result.colega.apellido,
        inmobiliaria: result.colega.inmobiliaria,
        telefono: result.colega.telefono,
        email: result.colega.email,
        notasPrivadas: result.colega.notasPrivadas,
      });
      setNombre('');
      setApellido('');
      setInmobiliaria('');
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
          <h3 className="font-bold text-slate-800 text-base">🤝 Nuevo Colega / Inmobiliaria</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
            ✕
          </button>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Nombre
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

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Inmobiliaria / Firma <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={inmobiliaria}
              onChange={(e) => setInmobiliaria(e.target.value)}
              placeholder="Ej: Gómez Propiedades"
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
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

  return createPortal(modalContent, document.body);
}