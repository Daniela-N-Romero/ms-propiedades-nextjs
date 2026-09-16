'use client';

import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { CARACTERISTICAS_CATALOGO } from '@/types/caracteristicas';
import type { PropertyFormValues } from '../schemas/property-schema';

// Catálogo organizado de emojis para propiedades
const CATEGORIAS_EMOJIS = [
  {
    nombre: 'Estructura e Industria',
    emojis: ['🏗️', '🏭', '🚛', '🚚', '⚙️', '📐', '🧱', '📦', '🚪', '🔒', '🗝️'],
  },
  {
    nombre: 'Servicios e Instalaciones',
    emojis: ['⚡', '💧', '🔥', '🧯', '🌊', '🌧️', '❄️', '🌡️', '💡', '🚿', '🍽️'],
  },
  {
    nombre: 'Inmueble y Espacios',
    emojis: ['🏢', '🏬', '🏠', '🌳', '🛡️', '👥', '🚗', '🏊', '🍖', '🧺', '🔔', '✨'],
  },
];

interface CustomFeatureItem {
  label: string;
  icon: string;
  custom: boolean;
}

export function DynamicFeaturesSection({ mercadoSlugActual }: { mercadoSlugActual: string }) {
  const { getValues, setValue } = useFormContext<PropertyFormValues>();
  
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoEmoji, setNuevoEmoji] = useState('✨');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const caracteristicas = useWatch<PropertyFormValues>({
    name: 'caracteristicas',
  }) || {};

  const caracteristicasFiltradas = CARACTERISTICAS_CATALOGO.filter((item) =>
    item.mercados.includes(mercadoSlugActual as any)
  );

  // Módulos de cambio
  const handleToggleBoolean = (e: React.MouseEvent, key: string) => {
    e.preventDefault();
    const current = { ...(getValues('caracteristicas') || {}) };
    if (current[key]) {
      delete current[key];
    } else {
      current[key] = true;
    }
    setValue('caracteristicas', current, { shouldDirty: true });
  };

  const handleValueChange = (key: string, val: any) => {
    const current = { ...(getValues('caracteristicas') || {}) };
    if (val === '' || val === null || val === undefined) {
      delete current[key];
    } else {
      current[key] = val;
    }
    setValue('caracteristicas', current, { shouldDirty: true });
  };

  const handleHybridChange = (key: string, field: 'activo' | 'modo' | 'valor', val: any, defaultUnit = 'cant') => {
    const current = { ...(getValues('caracteristicas') || {}) };
    const prev = current[key] && typeof current[key] === 'object' ? current[key] : {};

    if (field === 'activo') {
      if (!val) {
        delete current[key];
      } else {
        current[key] = { modo: prev.modo || defaultUnit, valor: prev.valor || '' };
      }
    } else {
      current[key] = { ...prev, [field]: val };
    }
    setValue('caracteristicas', current, { shouldDirty: true });
  };

  // ➕ AGREGAR CARACTERÍSTICA PERSONALIZADA
  const handleAgregarCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    const current = { ...(getValues('caracteristicas') || {}) };
    const customKey = `custom_${Date.now()}`;

    current[customKey] = {
      label: nuevoNombre.trim(),
      icon: nuevoEmoji || '✨',
      custom: true,
    };

    setValue('caracteristicas', current, { shouldDirty: true });
    setNuevoNombre('');
    setShowEmojiPicker(false);
  };

  const handleEliminarCustom = (key: string) => {
    const current = { ...(getValues('caracteristicas') || {}) };
    delete current[key];
    setValue('caracteristicas', current, { shouldDirty: true });
  };

  const customItems = Object.entries(caracteristicas).filter(
    ([_, val]) => typeof val === 'object' && val !== null && (val as CustomFeatureItem).custom === true
  ) as [string, CustomFeatureItem][];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
        <span>✨ Especificaciones de {mercadoSlugActual.toUpperCase()}</span>
        <span className="text-xs font-normal text-slate-500">
          ({caracteristicasFiltradas.length} opciones disponibles)
        </span>
      </h2>

      {/* GRILLA CATÁLOGO PRINCIPAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {caracteristicasFiltradas.map((item) => {
          const rawVal = caracteristicas[item.key];

          // SELECT
          if (item.tipoInput === 'select') {
            return (
              <div key={item.key} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 truncate">
                  <span>{item.icon}</span> {item.label}
                </label>
                <select
                  value={typeof rawVal === 'string' ? rawVal : ''}
                  onChange={(e) => handleValueChange(item.key, e.target.value)}
                  className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-brand-orange"
                >
                  <option value="">-- No especifica --</option>
                  {item.opcionesSelect?.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          // HÍBRIDO (BOLEANO + CANTIDAD O M2)
          if (item.tipoInput === 'boolean_or_value') {
            const isChecked = Boolean(rawVal);
            const defaultUnit = item.unidadesDisponibles?.[0]?.value || 'cant';
            const modoActual = typeof rawVal === 'object' ? rawVal?.modo || defaultUnit : defaultUnit;
            const valorActual = typeof rawVal === 'object' ? rawVal?.valor ?? '' : (typeof rawVal === 'number' ? rawVal : '');

            return (
              <div
                key={item.key}
                className={`p-3 rounded-xl border transition-all ${
                  isChecked
                    ? 'bg-orange-50/70 border-brand-orange shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleHybridChange(item.key, 'activo', e.target.checked, defaultUnit)}
                      className="accent-brand-orange rounded cursor-pointer"
                    />
                    <span>{item.icon}</span> {item.label}
                  </label>
                </div>

                {isChecked && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="number"
                      placeholder="Valor"
                      value={valorActual}
                      onChange={(e) => handleHybridChange(item.key, 'valor', e.target.value, defaultUnit)}
                      className="w-1/2 text-xs p-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 outline-none focus:ring-2 focus:ring-brand-orange"
                    />
                    <select
                      value={modoActual}
                      onChange={(e) => handleHybridChange(item.key, 'modo', e.target.value, defaultUnit)}
                      className="w-1/2 text-[11px] p-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-brand-orange"
                    >
                      {item.unidadesDisponibles?.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          }

          // NUMÉRICO
          if (item.tipoInput === 'number') {
            return (
              <div key={item.key} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1 truncate">
                  <span>{item.icon}</span> {item.label}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={typeof rawVal === 'number' || typeof rawVal === 'string' ? rawVal : ''}
                  onChange={(e) => handleValueChange(item.key, e.target.value)}
                  className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>
            );
          }

          // TOGGLE BOOLEANO
          const isSelected = Boolean(rawVal);
          return (
            <button
              key={item.key}
              type="button"
              onClick={(e) => handleToggleBoolean(e, item.key)}
              className={`flex items-center gap-2 p-3 text-xs font-semibold rounded-xl border transition-all text-left cursor-pointer ${
                isSelected
                  ? 'bg-orange-50 border-brand-orange text-brand-orange shadow-xs font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 🛠️ SECCIÓN: CARACTERÍSTICA PERSONALIZADA CON MINI TECLADO DE EMOJIS */}
      <div className="pt-4 border-t border-slate-100 bg-slate-50/50 p-4 rounded-xl border border-slate-200 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <span>➕</span> ¿Falta alguna característica específica?
        </h3>

        <div className="flex flex-col sm:flex-row gap-2 items-center relative">
          {/* BOTÓN + POPOVER DEL SELECTOR DE EMOJI */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-11 h-10 flex items-center justify-center text-lg bg-white border border-slate-300 rounded-xl hover:border-brand-orange shadow-2xs cursor-pointer transition-colors"
              title="Seleccionar emoji"
            >
              {nuevoEmoji}
            </button>

            {/* MINI KEYBOARD DE EMOJIS */}
            {showEmojiPicker && (
              <div className="absolute top-12 left-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 w-64 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                  <span className="text-[11px] font-bold text-slate-700">Elegí un ícono</span>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {CATEGORIAS_EMOJIS.map((cat) => (
                    <div key={cat.nombre}>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 block mb-1">
                        {cat.nombre}
                      </span>
                      <div className="grid grid-cols-6 gap-1">
                        {cat.emojis.map((emo) => (
                          <button
                            key={emo}
                            type="button"
                            onClick={() => {
                              setNuevoEmoji(emo);
                              setShowEmojiPicker(false);
                            }}
                            className={`p-1 text-base hover:bg-orange-50 rounded-lg text-center transition-transform hover:scale-110 cursor-pointer ${
                              nuevoEmoji === emo ? 'bg-orange-100 ring-1 ring-brand-orange' : ''
                            }`}
                          >
                            {emo}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="Ej: Piso de Hormigón H30, Entrada de camión, Desagües pluviales..."
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            className="flex-1 text-xs p-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-orange"
          />

          <button
            type="button"
            onClick={handleAgregarCustom}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap"
          >
            + Agregar
          </button>
        </div>

        {/* LISTADO DE PERSONALIZADAS AGREGADAS */}
        {customItems.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {customItems.map(([key, item]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-lg shadow-2xs"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                <button
                  type="button"
                  onClick={() => handleEliminarCustom(key)}
                  className="text-red-500 hover:text-red-700 ml-1 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}