'use client';

import { useState } from 'react';
import { UseFormReturn, Controller, useWatch } from 'react-hook-form';
import { PropertyFormValues } from '@/features/admin/form/schemas/property-schema';
import { formatNumberWithDots, parseRawNumber } from '@/lib/utils-formatting';
import { getInputClass, getSelectClass } from '../utils/form-utils';
import { PropietarioModal } from '../modals/propietario-modal';
import { ColegaModal } from '../modals/colega-modal';
import type { TipoInmueble, Agente, Propietario, Colega } from '@prisma-client';
import { DynamicFeaturesSection } from './dynamic-features-section';

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

  const mercadoSeleccionado = mercados.find((m) => m.id === selectedMercadoId);
  const mercadoSlugActual = mercadoSeleccionado?.slug?.toLowerCase() || '';

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
              setSelectedMercadoId(id); // Dispara el useEffect en usePropertyCascades
              // ✅ Reseteamos tipoInmuebleId notificando a React Hook Form
              setValue('tipoInmuebleId', 0, { shouldValidate: true, shouldDirty: true });
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
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

        <div className="col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1">
            💳 Financiación / Facilidades de Pago (Opcional)
          </label>
          <input
            type="text"
            {...register('financiacion')}
            placeholder="Ej: Anticipo USD 182.000 + 20 cuotas"
            className="w-full text-sm p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-orange outline-none transition"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Si la propiedad cuenta con plan de pago, completá este campo para mostrar un banner promocional destacado.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            Superficie Total (m²)
          </label>
          <Controller
            name="superficieTotal"
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <input
                type="text"
                placeholder="Ej: 5.000"
                value={value ? formatNumberWithDots(value) : ''}
                onChange={(e) => onChange(e.target.value ? parseRawNumber(e.target.value) : null)}
                onBlur={onBlur}
                className={getInputClass(!!errors.superficieTotal)}
              />
            )}
          />
          {errors.superficieTotal && <span className="text-xs font-semibold text-red-500 mt-1 block">❌ {errors.superficieTotal.message}</span>}
        </div>

        {/* SUPERFICIE CUBIERTA */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            Sup. Cubierta (m²)
          </label>
          <Controller
            name="superficieCubierta"
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <input
                type="text"
                placeholder="Ej: 2.800"
                value={value ? formatNumberWithDots(value) : ''}
                onChange={(e) => onChange(e.target.value ? parseRawNumber(e.target.value) : null)}
                onBlur={onBlur}
                className={getInputClass(!!errors.superficieCubierta)}
              />
            )}
          />
          {errors.superficieCubierta && <span className="text-xs font-semibold text-red-500 mt-1 block">❌ {errors.superficieCubierta.message}</span>}
        </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
              Agente Responsable<span className="text-red-500">*</span>
            </label>
            <select {...register('agenteId', { valueAsNumber: true })} className={getSelectClass(!!errors.agenteId)}>
              {agentes.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre} {a.apellido}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
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
      </div>

      {/* ORIGEN DE CARTERA Y ASIGNACIÓN (PROPIETARIO / COLEGA) */}
      <div>

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

      {/* DESCRIPCIÓN PÚBLICA DE LA PROPIEDAD */}
      <div className="col-span-full">
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Descripción de la Publicación <span className="text-red-500">*</span>
        </label>
        <textarea
          {...form.register('descripcion')}
          rows={9}
          placeholder="Redactá una descripción detallada de la propiedad, accesos, ventajas industriales, estado de los techos, etc..."
          className="w-full text-sm p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-orange outline-none transition"
        />
        {form.formState.errors.descripcion && (
          <p className="text-xs text-red-500 mt-1 font-semibold">
            {form.formState.errors.descripcion.message as string}
          </p>
        )}
      </div>

      {/* ESPECIFICACIONES TÉCNICAS / CARACTERÍSTICAS DINÁMICAS */}
      {mercadoSlugActual && (
        <DynamicFeaturesSection
          form={form}
          mercadoSlugActual={mercadoSlugActual}
        />
      )}


    </div>
  );
}