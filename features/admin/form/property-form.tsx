'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertyFormSchema, PropertyFormValues } from '@/features/admin/form/schemas/property-schema';
import { savePropertyAction } from './actions/save-property';
import { useRouter } from 'next/navigation';
import { usePropertyCascades } from './hooks/use-property-cascades';

import { ComercialSection } from './components/comercial-section';
import { LocationSection } from './components/location-section';
import { MultimediaSection } from './components/multimedia-section';

import type { ZonaServer, PropertyFullData } from '@/types/server-data';
import type { TipoInmueble, Agente, Propietario, Colega } from '@prisma-client';
import { StatusSection } from './components/status-section';

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
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inicialización de IDs para zonas y tipos
  const mercadoPadreInicialId = initialData?.tipoInmueble?.padreId || initialData?.tipoInmuebleId || 0;
  const localidadActual = initialData?.zona;
  const regionInicialId = localidadActual?.padre?.padreId 
    ? localidadActual.padre.padreId 
    : (localidadActual?.padreId || 0);

  const partidoInicialId = localidadActual?.padre?.padreId 
    ? localidadActual.padreId 
    : (localidadActual?.id || 0)

  // Custom Hook para Cascadas
  const cascades = usePropertyCascades({
    subtiposIniciales,
    localidadesIniciales,
    mercadoPadreInicialId,
    regionInicialId,
    partidoInicialId,
  });

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema) as any,
    defaultValues: initialData
      ? {
          titulo: initialData.titulo,
          categoria: initialData.categoria,
          origen: initialData.origen,
          precio: initialData.precio,
          moneda: initialData.moneda,
          descripcion: initialData.descripcion || '',
          zonaId: initialData.zonaId,
          direccionPersonalizada: initialData.direccionPersonalizada || '',
          latitud: initialData.latitud || -34.78,
          longitud: initialData.longitud || -58.28,
          superficieTotal: initialData.superficieTotal,
          superficieCubierta: initialData.superficieCubierta,
          tipoInmuebleId: initialData.tipoInmuebleId,
          agenteId: initialData.agenteId,
          propietarioId: initialData.propietarioId,
          colegaId: initialData.colegaId,
          videoUrl: initialData.videoUrl || '',
          pdfUrl: initialData.pdfUrl || '',
          isPublished: initialData.isPublished,
          isDestacada: initialData.isDestacada,
          notasPrivadas: initialData.notasPrivadas || '',
          caracteristicas: (initialData.caracteristicas as Record<string, any>) || {},
          imagenes: initialData.imagenes.length > 0 ? initialData.imagenes.map((i) => i.url) : ['/images/placeholder.png'],
        }
      : {
          titulo: '',
          categoria: 'venta',
          origen: 'own',
          precio: 0,
          moneda: 'USD',
          descripcion: '',
          zonaId: 0,
          direccionPersonalizada: '',
          latitud: -34.78,
          longitud: -58.28,
          superficieTotal: null,
          superficieCubierta: null,
          tipoInmuebleId: 0,
          agenteId: agentes[0]?.id || 0,
          propietarioId: null,
          colegaId: null,
          videoUrl: '',
          pdfUrl: '',
          isPublished: false,
          isDestacada: false,
          notasPrivadas: '',
          caracteristicas: {},
          imagenes: ['/images/placeholder.png'],
        },
  });

  const cantErrores = Object.keys(form.formState.errors).length;

  const onSubmit = async (values: PropertyFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    const result = await savePropertyAction(values, initialData?.id);

    if (result.success) {
      router.push('/admin/dashboard');
      router.refresh();
    } else {
      setErrorMsg(result.error || 'Ocurrió un error al guardar la propiedad.');
      setIsSubmitting(false);
    }
  };
  console.log(initialData)

  return (
    <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6 max-w-5xl mx-auto p-4 sm:p-8">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            {initialData?.id ? '✏️ Editar Propiedad' : '➕ Cargar Nueva Propiedad'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete los bloques a continuación. Los campos marcados con <span className="text-red-500 font-bold">*</span> son obligatorios.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 text-sm font-semibold border border-slate-300 text-slate-800 rounded-xl hover:bg-slate-100 transition w-1/2 sm:w-auto text-center"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-bold bg-brand-orange text-white rounded-xl hover:bg-orange-600 transition shadow-md disabled:opacity-50 w-1/2 sm:w-auto"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Propiedad'}
          </button>
        </div>
      </div>

      {/* BANNER ERRORES */}
      {(cantErrores > 0 || errorMsg) && (
        <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-2xl flex items-start gap-3 shadow-sm">
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="font-bold text-sm">Hay campos pendientes o con errores</h4>
            <p className="text-xs mt-0.5">
              Por favor revise las secciones marcadas en rojo ({cantErrores} {cantErrores === 1 ? 'campo observado' : 'campos observados'}).
            </p>
            {errorMsg && <p className="text-xs font-semibold mt-1">{errorMsg}</p>}
          </div>
        </div>
      )}

      {/* BLOQUE 1: COMERCIAL */}
      <ComercialSection
        form={form}
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
        form={form}
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
      <MultimediaSection form={form} />

      {/* NUEVO BLOQUE 4: ESTADO Y NOTAS PRIVADAS */}
      <StatusSection form={form} />

      {/* FOOTER */}
      <div className="flex justify-end gap-4 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 text-sm font-semibold border border-slate-300 text-slate-800 rounded-xl hover:bg-slate-100 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-2.5 text-sm font-bold bg-brand-orange text-white rounded-xl hover:bg-orange-600 transition shadow-md disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Propiedad'}
        </button>
      </div>
    </form>
  );
}