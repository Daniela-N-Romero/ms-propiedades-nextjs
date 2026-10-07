'use client';

import { FormProvider } from 'react-hook-form';
import { usePropertyForm } from './hooks/use-property-form';
import { usePropertyCascades } from './hooks/use-property-cascades';

import { ComercialSection } from './components/comercial-section';
import { LocationSection } from './components/location-section';
import { MultimediaSection } from './components/multimedia-section';
import { StatusSection } from './components/status-section';

import type { ZonaServer, PropertyFullData } from '@/types/server-data';
import type { TipoInmueble, Agente, Propietario, Colega } from '@prisma-client';
import { useRef } from 'react';

interface PropertyFormProps {
  initialData?: PropertyFullData | null;
  mercados: TipoInmueble[];
  subtiposIniciales?: TipoInmueble[];
  zonasPadre: ZonaServer[];
  localidadesIniciales?: ZonaServer[];
  agentes: Agente[];
  propietarios: Propietario[];
  colegas: Colega[];
}

export default function PropertyForm({
  initialData,
  mercados,
  subtiposIniciales = [],
  zonasPadre,
  localidadesIniciales = [],
  agentes,
  propietarios,
  colegas,
}: PropertyFormProps) {
  const {
    form,
    isSubmitting,
    actionType,
    errorMsg,
    handleSaveAsDraft,
    handlePublishSubmit,
    onError,
  } = usePropertyForm(initialData);

  const mercadoPadreInicialId = initialData?.tipoInmueble?.padreId || initialData?.tipoInmuebleId || 0;
  const localidadActual = initialData?.zona;
  const regionInicialId = localidadActual?.padre?.padreId
    ? localidadActual.padre.padreId
    : (localidadActual?.padreId || 0);

  const partidoInicialId = localidadActual?.padre?.padreId
    ? localidadActual.padreId
    : (localidadActual?.id || 0);

  const cascades = usePropertyCascades({
    subtiposIniciales,
    localidadesIniciales,
    mercadoPadreInicialId,
    regionInicialId,
    partidoInicialId,
  });

  const totalErrors = Object.keys(form.formState.errors).length;

  const folderIdRef = useRef<string>(
    initialData?.id ? initialData.id.toString() : `propiedad-${crypto.randomUUID().slice(0, 8)}`
  );

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handlePublishSubmit as any, onError)} className="space-y-6 max-w-5xl mx-auto p-4 sm:p-8">
        {/* HEADER PRINCIPAL */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              {initialData?.id ? '✏️ Editar Propiedad' : '➕ Cargar Nueva Propiedad'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Complete las secciones. Puede guardar un borrador para continuar luego o publicar cuando esté lista.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:min-w-80 sm:w-auto">
            {/* BOTÓN 1: GUARDAR COMO BORRADOR */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveAsDraft}
              className="px-2 py-2.5 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl transition disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : '💾 Guardar Borrador'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-2 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Publicando...' : '🌐 Publicar Propiedad'}
            </button>
          </div>
        </div>

        {/* BANNER ERRORES */}
        {(totalErrors > 0 || errorMsg) && (
          <div id="form-error-banner" className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-2xl flex items-start gap-3 shadow-sm">
            <span className="text-xl">⚠️</span>
            <div>
              <h4 className="font-bold text-sm">Hay campos pendientes o con errores</h4>
              <p className="text-xs mt-0.5">
                Por favor revise las secciones observadas ({totalErrors} {totalErrors === 1 ? 'campo observado' : 'campos observados'}).
              </p>
              {errorMsg && <p className="text-xs font-semibold mt-1">{errorMsg}</p>}
            </div>
          </div>
        )}

        {/* BLOQUE 1: COMERCIAL */}
        <ComercialSection
          mercados={mercados}
          subtiposDisponibles={cascades.subtiposDisponibles}
          selectedMercadoId={cascades.selectedMercadoId}
          setSelectedMercadoId={cascades.setSelectedMercadoId}
          agentes={agentes}
          propietarios={propietarios}
          colegas={colegas}
          isPending={cascades.isPending}
        />


        {/* BLOQUE 2: UBICACIÓN */}
        <LocationSection
          zonasPadre={zonasPadre}
          partidosDisponibles={cascades.partidosDisponibles}
          localidadesDisponibles={cascades.localidadesDisponibles}
          selectedRegionId={cascades.selectedRegionId}
          setSelectedRegionId={cascades.setSelectedRegionId}
          selectedPartidoId={cascades.selectedPartidoId}
          setSelectedPartidoId={cascades.setSelectedPartidoId}
          isPending={cascades.isPending}
        />

        {/* BLOQUE 3: MULTIMEDIA */}
        <MultimediaSection propertyId={folderIdRef.current} />

        {/* NUEVO BLOQUE 4: ESTADO Y NOTAS PRIVADAS */}
        <StatusSection />

        {/* FOOTER */}
        <div className="flex justify-end gap-4 pt-2">
          <button
            type="button"
            disabled={isSubmitting || actionType !== null}
            onClick={handleSaveAsDraft}
            className="px-6 py-2.5 text-sm font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl transition"
          >
            {actionType === 'draft' ? '💾 Guardando Borrador...' : '💾 Guardar Borrador'}
          </button>

          <button
            type="submit"
            disabled={isSubmitting || actionType !== null}
            className="px-8 py-2.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-md"
          >
            {actionType === 'publish' ? '🌐 Publicando...' : '🌐 Publicar Propiedad'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}