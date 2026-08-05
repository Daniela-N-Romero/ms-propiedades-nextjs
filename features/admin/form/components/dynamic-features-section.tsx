'use client';

import { UseFormReturn } from 'react-hook-form';
import { CARACTERISTICAS_CATALOGO } from '@/types/caracteristicas';
import type { PropertyFormValues } from '../schemas/property-schema';

interface DynamicFeaturesSectionProps {
  form: UseFormReturn<PropertyFormValues>;
  mercadoSlugActual: string; // ej: 'industrial', 'residencial', 'comercial', 'terrenos'
}

export function DynamicFeaturesSection({ form, mercadoSlugActual }: DynamicFeaturesSectionProps) {
  const caracteristicas = form.watch('caracteristicas') || {};

  // 🔍 Filtramos el catálogo según el mercado activo
  const caracteristicasFiltradas = CARACTERISTICAS_CATALOGO.filter((item) =>
    item.mercados.includes(mercadoSlugActual as any)
  );

  const toggleFeature = (key: string) => {
    const current = { ...caracteristicas };
    if (current[key]) {
      delete current[key];
    } else {
      current[key] = true;
    }
    form.setValue('caracteristicas', current, { shouldDirty: true });
  };

  const handleValueChange = (key: string, val: string | number) => {
    const current = { ...caracteristicas };
    if (val === '' || val === null) {
      delete current[key];
    } else {
      current[key] = val;
    }
    form.setValue('caracteristicas', current, { shouldDirty: true });
  };

  if (caracteristicasFiltradas.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
        <span>✨ Especificaciones de {mercadoSlugActual.toUpperCase()}</span>
        <span className="text-xs font-normal text-slate-500">
          ({caracteristicasFiltradas.length} opciones disponibles)
        </span>
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {caracteristicasFiltradas.map((item) => {
          const isSelected = Boolean(caracteristicas[item.key]);

          // Si es tipo número (ej: Dormitorios, Cocheras, Altura)
          if (item.tipoInput === 'number') {
            return (
              <div key={item.key} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 truncate">
                  <span>{item.icon}</span> {item.label}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={caracteristicas[item.key] || ''}
                  onChange={(e) => handleValueChange(item.key, e.target.value)}
                  className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>
            );
          }

          // Si es tipo Toggle / Checkbox
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => toggleFeature(item.key)}
              className={`flex items-center gap-2 p-3 text-xs font-semibold rounded-xl border transition-all text-left ${
                isSelected
                  ? 'bg-orange-50 border-brand-orange text-brand-orange shadow-sm font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}