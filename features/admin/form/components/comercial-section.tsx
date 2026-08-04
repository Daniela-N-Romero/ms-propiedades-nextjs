'use client';

import { useState } from 'react';
import { UseFormReturn, Controller, useWatch } from 'react-hook-form';
import { PropertyFormValues } from '@/features/admin/form/schemas/property-schema';
import { formatNumberWithDots, parseRawNumber } from '@/lib/utils-formatting';
import { getInputClass, getSelectClass } from '../utils/form-utils';
import { PropietarioModal } from '../modals/propietario-modal';
import { ColegaModal } from '../modals/colega-modal';
import type { TipoInmueble, Agente, Propietario, Colega } from '@prisma-client';

interface ComercialSectionProps {
  form: UseFormReturn<PropertyFormValues>;
  mercados: TipoInmueble[];
  subtiposDisponibles: TipoInmueble[];
  selectedMercadoId: number;
  setSelectedMercadoId: (id: number) => void;
  agentes: Agente[];
  propietarios: Propietario[];
  colegas: Colega[];
  isPending: boolean;
}

export function ComercialSection({
  form,
  mercados,
  subtiposDisponibles,
  selectedMercadoId,
  setSelectedMercadoId,
  agentes,
  propietarios,
  colegas,
  isPending,
}: ComercialSectionProps) {
  const { register, control, setValue, formState: { errors } } = form;

  const origen = useWatch({
    control,
    name: 'origen',
  });

  const [listaPropietarios, setListaPropietarios] = useState(propietarios);
  const [listaColegas, setListaColegas] = useState(colegas);

  const [isPropietarioModalOpen, setIsPropietarioModalOpen] = useState(false);
  const [isColegaModalOpen, setIsColegaModalOpen] = useState(false);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-brand-orange font-bold text-sm">
          1
        </span>
        <h2 className="text-base font-bold text-slate-900">Información Comercial y Clasificación</h2>
      </div>

      {/* TÍTULO */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
          Título Comercial <span className="text-red-500">*</span>
        </label>
        <input
          {...register('titulo')}
          placeholder="Ej: Nave Industrial 2800m² en Polo Hudson"
          className={getInputClass(!!errors.titulo)}
        />
        {errors.titulo && <span className="text-xs font-semibold text-red-500 mt-1 block">❌ {errors.titulo.message}</span>}
      </div>

      {/* MERCADO Y SUBTIPO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-100/70 p-4 rounded-xl border border-slate-200">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            Mercado Principal <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedMercadoId}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelectedMercadoId(id);
              setValue('tipoInmuebleId', 0);
            }}
            className={getSelectClass(false)}
          >
            <option value={0}>Seleccionar Mercado (Industrial, Comercial...)...</option>
            {mercados.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            Categoría Específica <span className="text-red-500">*</span>
          </label>
          <select
            {...register('tipoInmuebleId', { valueAsNumber: true })}
            disabled={!selectedMercadoId || isPending}
            className={getSelectClass(!!errors.tipoInmuebleId)}
          >
            <option value={0}>
              {!selectedMercadoId ? '👈 Elija primero un Mercado' : isPending ? 'Cargando...' : 'Seleccionar Subtipo...'}
            </option>
            {subtiposDisponibles.map((st) => (
              <option key={st.id} value={st.id}>{st.nombre}</option>
            ))}
          </select>
          {errors.tipoInmuebleId && <span className="text-xs font-semibold text-red-500 mt-1 block">❌ {errors.tipoInmuebleId.message}</span>}
        </div>
      </div>

      {/* PRECIO, OPERACIÓN Y AGENTE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            Operación <span className="text-red-500">*</span>
          </label>
          <select {...register('categoria')} className={getSelectClass(!!errors.categoria)}>
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            Moneda <span className="text-red-500">*</span>
          </label>
          <select {...register('moneda')} className={getSelectClass(!!errors.moneda)}>
            <option value="USD">USD ($)</option>
            <option value="ARS">ARS ($)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            Precio <span className="text-red-500">*</span>
          </label>
          <Controller
            name="precio"
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <input
                type="text"
                placeholder="$ 0"
                value={formatNumberWithDots(value)}
                onChange={(e) => onChange(parseRawNumber(e.target.value))}
                onBlur={onBlur}
                className={getInputClass(!!errors.precio)}
              />
            )}
          />
          {errors.precio && <span className="text-xs font-semibold text-red-500 mt-1 block">❌ {errors.precio.message}</span>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            Agente Responsable <span className="text-red-500">*</span>
          </label>
          <select {...register('agenteId', { valueAsNumber: true })} className={getSelectClass(!!errors.agenteId)}>
            {agentes.map((a) => (
              <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ORIGEN DE CARTERA Y ASIGNACIÓN (PROPIETARIO / COLEGA) */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            Origen de la Cartera <span className="text-red-500">*</span>
          </label>
          <Controller
            name="origen"
            control={control}
            render={({ field }) => (
              <select
                value={field.value}
                onChange={(e) => {
                  const nuevoOrigen = e.target.value as 'own' | 'fromColleague';
                  field.onChange(nuevoOrigen);

                  // Reseteamos de manera limpia el campo contrario para no ensuciar Zod
                  if (nuevoOrigen === 'own') {
                    setValue('colegaId', null);
                  } else {
                    setValue('propietarioId', null);
                  }
                }}
                className={getSelectClass(!!errors.origen)}
              >
                <option value="own">Cartera Propia</option>
                <option value="fromColleague">De Colega</option>
              </select>
            )}
          />
        </div>

        {/* PROPIETARIO DIRECTO */}
        {origen === 'own' && (
          <div className="space-y-1 bg-orange-50/40 p-4 rounded-xl border border-orange-100">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Propietario Asignado
              </label>
              <button
                type="button"
                onClick={() => setIsPropietarioModalOpen(true)}
                className="text-[11px] font-bold text-brand-orange hover:underline flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-orange-200 shadow-sm"
              >
                ➕ Nuevo Propietario
              </button>
            </div>

            <Controller
              name="propietarioId"
              control={control}
              render={({ field }) => (
                <select
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  className={getSelectClass(!!errors.propietarioId)}
                >
                  <option value="">Seleccionar Propietario...</option>
                  {listaPropietarios.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              )}
            />
          </div>
        )}

        {/* INMOBILIARIA COLEGA */}
        {origen === 'fromColleague' && (
          <div className="space-y-1 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Inmobiliaria Colega / Contacto
              </label>
              <button
                type="button"
                onClick={() => setIsColegaModalOpen(true)}
                className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-sm"
              >
                ➕ Nuevo Colega
              </button>
            </div>

            <Controller
              name="colegaId"
              control={control}
              render={({ field }) => (
                <select
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  className={getSelectClass(!!errors.colegaId)}
                >
                  <option value="">Seleccionar Colega...</option>
                  {listaColegas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {c.inmobiliaria ? `(${c.inmobiliaria})` : ''}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
        )}
      </div>

      <PropietarioModal
        isOpen={isPropietarioModalOpen}
        onClose={() => setIsPropietarioModalOpen(false)}
        onCreated={(nuevo) => {
          setListaPropietarios((prev) => [...prev, nuevo as any]);
          setValue('propietarioId', nuevo.id, { shouldValidate: true, shouldDirty: true });
        }}
      />

      <ColegaModal
        isOpen={isColegaModalOpen}
        onClose={() => setIsColegaModalOpen(false)}
        onCreated={(nuevo) => {
          setListaColegas((prev) => [...prev, nuevo as any]);
          setValue('colegaId', nuevo.id, { shouldValidate: true, shouldDirty: true });
        }}
      />
    </div>
  );
}