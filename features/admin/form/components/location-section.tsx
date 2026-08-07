'use client';

import { UseFormReturn } from 'react-hook-form';
import { PropertyFormValues } from '@/features/admin/form/schemas/property-schema';
import { getInputClass, getSelectClass } from '../utils/form-utils';
import { LocationPicker } from './location-picker';
import type { ZonaServer } from '@/types/server-data';

interface LocationSectionProps {
    form: UseFormReturn<PropertyFormValues>;
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
    form,
    zonasPadre,
    partidosDisponibles,
    localidadesDisponibles,
    selectedRegionId,
    setSelectedRegionId,
    selectedPartidoId,
    setSelectedPartidoId,
    isPending,
}: LocationSectionProps) {
    const { register, watch, setValue, formState: { errors } } = form;

    const currentLat = watch('latitud');
    const currentLng = watch('longitud');

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-brand-orange font-bold text-sm">
                    2
                </span>
                <h2 className="text-base font-bold text-slate-900">Ubicación y Localización</h2>
            </div>

            {/* CASCADA 3 NIVELES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-100/70 p-4 rounded-xl border border-slate-200">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                        1. Región Principal <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={selectedRegionId}
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
                            <option key={z.id} value={z.id}>{z.nombre}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                        2. Partido / Comuna <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={selectedPartidoId}
                        onChange={(e) => {
                            const id = Number(e.target.value);
                            setSelectedPartidoId(id);
                            setValue('zonaId', 0);
                        }}
                        disabled={!selectedRegionId || isPending}
                        className={getSelectClass(false)}
                    >
                        <option value={0}>
                            {!selectedRegionId ? '👈 Elija Región' : isPending ? 'Cargando...' : 'Seleccionar Partido...'}
                        </option>
                        {partidosDisponibles.map((p) => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                        3. Localidad Específica <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register('zonaId', { valueAsNumber: true })}
                        disabled={!selectedPartidoId || isPending}
                        className={getSelectClass(!!errors.zonaId)}
                    >
                        <option value={0}>
                            {!selectedPartidoId ? '👈 Elija Partido' : isPending ? 'Cargando...' : 'Seleccionar Localidad...'}
                        </option>
                        {localidadesDisponibles.map((loc) => (
                            <option key={loc.id} value={loc.id}>{loc.nombre}</option>
                        ))}
                    </select>
                    {errors.zonaId && <span className="text-xs font-semibold text-red-500 mt-1 block">❌ {errors.zonaId.message}</span>}
                </div>
            </div>

            {/* MAPA LEAFLET */}
            <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Ubicación Exacta en Mapa (Geolocalización)
                </label>
                <LocationPicker
                    latitud={currentLat || -34.78}
                    longitud={currentLng || -58.28}
                    onChangeLocation={(newLat, newLng) => {
                        setValue('latitud', newLat, {
                            shouldValidate: true,
                            shouldDirty: true,
                            shouldTouch: true
                        });
                        setValue('longitud', newLng, {
                            shouldValidate: true,
                            shouldDirty: true,
                            shouldTouch: true
                        });
                    }}
                />
            </div>

            {/* DIRECCIÓN DE REFERENCIA */}
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Dirección / Referencia Comercial
                </label>
                <p className="text-xs text-slate-500">
                    Esta será la dirección que se mostrara al público.
                </p>
                <input
                    {...register('direccionPersonalizada')}
                    placeholder="Ej: Colectora Au. Bs As - La Plata Km 38, Parque Industrial Hudson"
                    className={getInputClass(!!errors.direccionPersonalizada)}
                />
            </div>
        </div>
    );
}