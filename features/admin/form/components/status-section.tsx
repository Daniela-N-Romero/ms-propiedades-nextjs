'use client';

import { UseFormReturn } from 'react-hook-form';
import type { PropertyFormValues } from '../schemas/property-schema';

interface StatusSectionProps {
  form: UseFormReturn<PropertyFormValues>;
}

export function StatusSection({ form }: StatusSectionProps) {
  const { register, watch, formState: { errors } } = form;

  const isPublished = watch('isPublished');
  const isDestacada = watch('isDestacada');

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
        ⚙️ Estado y Notas Privadas
      </h2>

      {/* CONTROLES DE SWITCH / CHECKBOX */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* SWITCH: PUBLICADA (Ahora es un <label>) */}
        <label
          className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between ${
            isPublished
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div>
            <h4 className="font-bold text-sm flex items-center gap-2">
              {isPublished ? '🌐 Publicada en la Web' : '📝 Guardada como Borrador'}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {isPublished
                ? 'La propiedad es visible para el público en general.'
                : 'Solo es visible dentro del panel de administración.'}
            </p>
          </div>
          <input
            type="checkbox"
            {...register('isPublished')}
            className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
          />
        </label>

        {/* SWITCH: DESTACADA (Ahora es un <label>) */}
        <label
          className={`cursor-pointer p-4 rounded-xl border transition-all flex items-center justify-between ${
            isDestacada
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div>
            <h4 className="font-bold text-sm flex items-center gap-2">
              ⭐ Propiedad Destacada
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Aparecerá en el carrusel principal y en primeros resultados.
            </p>
          </div>
          <input
            type="checkbox"
            {...register('isDestacada')}
            className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
          />
        </label>
      </div>

      {/* NOTAS PRIVADAS DE LA INMOBILIARIA */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
          🔒 Notas Privadas (Uso interno exclusivo)
        </label>
        <textarea
          {...register('notasPrivadas')}
          rows={3}
          placeholder="Ej: Acepta vehículo en parte de pago. Llaves en la oficina de Berazategui. Propietario disponible por la tarde..."
          className="w-full text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-orange outline-none transition"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          Esta información NUNCA se mostrará en el sitio público.
        </p>
      </div>
    </div>
  );
}