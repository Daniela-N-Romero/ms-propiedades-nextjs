'use client';
import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form';
import { PropertyFormValues } from '@/features/admin/form/schemas/property-schema';
import { getInputClass, getSelectClass } from '../utils/form-utils';
import { LocationPicker } from './location-picker';
import { ZonaModal } from '../modals/zona-modal';
import type { ZonaServer } from '@/types/server-data';

interface LocationSectionProps {
  zonasPadre: ZonaServer[];
  partidosDisponibles: ZonaServer[];
  localidadesDisponibles: ZonaServer[];
  selectedRegionId: number;
  setSelectedRegionId: (id: number) => void;
  selectedPartidoId: number;
  setSelectedPartidoId: (id: number) => void;
  isPending: boolean;
}

export function LocationSection({
  zonasPadre,
  partidosDisponibles,
  localidadesDisponibles,
  selectedRegionId,
  setSelectedRegionId,
  selectedPartidoId,
  setSelectedPartidoId,
  isPending,
}: LocationSectionProps) {
  const { register, watch, setValue, formState: { errors } } = useFormContext<PropertyFormValues>();

  const currentLat = useWatch<PropertyFormValues>({ name: 'latitud' }) ?? -34.78;
  const currentLng = useWatch<PropertyFormValues>({ name: 'longitud' }) ?? -58.28;
  const isMapConfirmed = useWatch<PropertyFormValues>({
    name: 'isMapConfirmed',
  }) ?? false;

  // Estados locales para listas dinámicas e interacción con los Modales
  const [listaRegiones, setListaRegiones] = useState<ZonaServer[]>(zonasPadre);
  const [listaPartidos, setListaPartidos] = useState<ZonaServer[]>(partidosDisponibles);
  const [listaLocalidades, setListaLocalidades] = useState<ZonaServer[]>(localidadesDisponibles);

  const [zonaModalConfig, setZonaModalConfig] = useState<{
    isOpen: boolean;
    tipo: 'region' | 'partido' | 'localidad';
    padreId?: number | null;
  }>({
    isOpen: false,
    tipo: 'region',
  });

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-brand-orange font-bold text-sm">
          2
        </span>
        <h2 className="text-base font-bold text-slate-900">Ubicación y Localización</h2>
      </div>

      {/* PASO 1: PASO OBLIGATORIO DE MAPA */}
      <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
            1. Ajustar Ubicación Exacta en el Mapa (Geolocalización) <span className="text-red-500">*</span>
          </label>
        </div>
        <p className="text-xs text-slate-500">
          Arrastrá el marcador sobre la parcela o dirección correcta antes de seleccionar la localidad.
        </p>

        <LocationPicker
          latitud={currentLat || -34.78}
          longitud={currentLng || -58.28}
          onChangeLocation={(newLat, newLng) => {
            setValue('latitud', newLat, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            });
            setValue('longitud', newLng, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            });
          }}
        />

        {/* CHECKBOX DE CONFIRMACIÓN */}
        <div className="space-y-1 mt-2">
          <label
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${errors.isMapConfirmed
              ? 'bg-red-50 border-red-500 ring-1 ring-red-300'
              : 'bg-white border-slate-300 hover:bg-slate-50'
              }`}
          >
            <input
              type="checkbox"
              // Usamos register directamente para el checkbox
              {...register('isMapConfirmed')}
              checked={Boolean(isMapConfirmed)}
              onChange={(e) => {
                const isChecked = e.target.checked;
                // Forzamos el valor booleano explícito en React Hook Form
                setValue('isMapConfirmed', isChecked, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
              className="w-5 h-5 accent-emerald-600 rounded cursor-pointer shrink-0"
            />
            <span className="text-xs font-bold text-slate-800 select-none">
              📍 Confirmo que el marcador en el mapa está ubicado en la posición correcta <span className="text-red-500">*</span>
            </span>
          </label>

          {/* MENSAJE DE ERROR */}
          {errors.isMapConfirmed && (
            <span className="text-xs font-semibold text-red-500 block pl-1">
              ❌ {errors.isMapConfirmed.message as string}
            </span>
          )}
        </div>
      </div>

      {/* PASO 2: CASCADA DE ZONAS (Bloqueada si no se confirmó el mapa) */}
      <div
        className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border transition-all ${isMapConfirmed
          ? 'bg-slate-100/70 border-slate-200'
          : 'bg-slate-100/40 border-slate-200 opacity-60 pointer-events-none'
          }`}
      >
        <div>
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
              2. Región Principal <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setZonaModalConfig({ isOpen: true, tipo: 'region', padreId: null })}
              className="text-[10px] font-bold text-brand-orange hover:underline bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs"
            >
              ➕ Nueva
            </button>
          </div>
          <select
            value={selectedRegionId}
            disabled={!isMapConfirmed}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelectedRegionId(id);
              setSelectedPartidoId(0);
              setValue('zonaId', 0);
            }}
            className={getSelectClass(false)}
          >
            <option value={0}>Seleccionar Región...</option>
            {zonasPadre.map((z) => (
              <option key={z.id} value={z.id}>
                {z.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
              3. Partido / Comuna <span className="text-red-500">*</span>
            </label>
            {selectedRegionId > 0 && (
              <button
                type="button"
                onClick={() =>
                  setZonaModalConfig({ isOpen: true, tipo: 'partido', padreId: selectedRegionId })
                }
                className="text-[10px] font-bold text-brand-orange hover:underline bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs"
              >
                ➕ Nuevo
              </button>
            )}
          </div>
          <select
            value={selectedPartidoId}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelectedPartidoId(id);
              setValue('zonaId', 0);
            }}
            disabled={!isMapConfirmed || !selectedRegionId || isPending}
            className={getSelectClass(false)}
          >
            <option value={0}>
              {!selectedRegionId ? '👈 Elija Región' : isPending ? 'Cargando...' : 'Seleccionar Partido...'}
            </option>
            {partidosDisponibles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
              4. Localidad Específica <span className="text-red-500">*</span>
            </label>
            {selectedPartidoId > 0 && (
              <button
                type="button"
                onClick={() =>
                  setZonaModalConfig({ isOpen: true, tipo: 'localidad', padreId: selectedPartidoId })
                }
                className="text-[10px] font-bold text-brand-orange hover:underline bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs"
              >
                ➕ Nueva
              </button>
            )}
          </div>
          <select
            {...register('zonaId', { valueAsNumber: true })}
            disabled={!isMapConfirmed || !selectedPartidoId || isPending}
            className={getSelectClass(!!errors.zonaId)}
          >
            <option value={0}>
              {!selectedPartidoId ? '👈 Elija Partido' : isPending ? 'Cargando...' : 'Seleccionar Localidad...'}
            </option>
            {localidadesDisponibles.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.nombre}
              </option>
            ))}
          </select>
          {errors.zonaId && <span className="text-xs font-semibold text-red-500 mt-1 block">❌ {errors.zonaId.message}</span>}
        </div>
      </div>

      {/* DIRECCIÓN DE REFERENCIA */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Dirección / Referencia Comercial
        </label>
        <p className="text-xs text-slate-500 mb-1">
          Esta será la dirección que se mostrará al público.
        </p>
        <input
          {...register('direccionPersonalizada')}
          placeholder="Ej: Colectora Au. Bs As - La Plata Km 38, Parque Industrial Hudson"
          className={getInputClass(!!errors.direccionPersonalizada)}
        />
      </div>

      {/* MODAL DE ZONAS */}
      <ZonaModal
        isOpen={zonaModalConfig.isOpen}
        tipo={zonaModalConfig.tipo}
        padreId={zonaModalConfig.padreId}
        onClose={() => setZonaModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onCreated={(nueva) => {
          if (zonaModalConfig.tipo === 'region') {
            setListaRegiones((prev) => [...prev, nueva as any]);
            setSelectedRegionId(nueva.id);
            // Limpiamos los niveles inferiores para la nueva región
            setListaPartidos([]);
            setListaLocalidades([]);
            setSelectedPartidoId(0);
            setValue('zonaId', 0);
          } else if (zonaModalConfig.tipo === 'partido') {
            setListaPartidos((prev) => [...prev, nueva as any]);
            setSelectedPartidoId(nueva.id);
            // Limpiamos las localidades del partido anterior
            setListaLocalidades([]);
            setValue('zonaId', 0);
          } else if (zonaModalConfig.tipo === 'localidad') {
            setListaLocalidades((prev) => [...prev, nueva as any]);
            setValue('zonaId', nueva.id, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
          }
        }}
      />

    </div>
  );
}