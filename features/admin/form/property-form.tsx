'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormProvider } from 'react-hook-form';
import { PropertyFormValues, basePublishPropertySchema, draftPropertySchema } from '@/features/admin/form/schemas/property-schema';
import { savePropertyAction } from './actions/save-property';
import { useRouter } from 'next/navigation';
import { usePropertyCascades } from './hooks/use-property-cascades';

import { ComercialSection } from './components/comercial-section';
import { LocationSection } from './components/location-section';
import { MultimediaSection } from './components/multimedia-section';
import { StatusSection } from './components/status-section';

import type { ZonaServer, PropertyFullData } from '@/types/server-data';
import type { TipoInmueble, Agente, Propietario, Colega } from '@prisma-client';
import { zodResolver } from '@hookform/resolvers/zod';

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
    resolver: zodResolver(basePublishPropertySchema) as any,
    defaultValues: initialData
      ? {
        titulo: initialData.titulo,
        categoria: initialData.categoria,
        origen: initialData.origen,
        precio: initialData.precio,
        moneda: initialData.moneda,
        financiacion: initialData.financiacion,
        descripcion: initialData.descripcion || '',
        zonaId: initialData.zonaId,
        direccionPersonalizada: initialData.direccionPersonalizada || '',
        latitud: initialData.latitud || -34.78,
        longitud: initialData.longitud || -58.28,
        isMapConfirmed: (initialData.zonaId || 0) > 0,
        superficieTotal: initialData.superficieTotal,
        superficieCubierta: initialData.superficieCubierta,
        tipoInmuebleId: initialData.tipoInmuebleId,
        agenteId: initialData.agenteId,
        propietarioId: initialData.propietarioId,
        colegaId: initialData.colegaId,
        videoUrl: initialData.videoUrl || '',
        pdfUrl: initialData.pdfUrl || '',
        isPublished: initialData.isPublished,
        isUnlisted: initialData.isUnlisted,
        isDestacada: initialData.isDestacada,
        permitMetaAd: initialData.permitMetaAd,
        imagenMetaUrl: initialData.imagenMetaUrl,
        notasPrivadas: initialData.notasPrivadas || '',
        caracteristicas: (initialData.caracteristicas as Record<string, any>) || {},
        imagenes: initialData.imagenes.length > 0 ? initialData.imagenes.map((i) => i.url) : ['/images/placeholder.png'],
      }
      : {
        titulo: '',
        categoria: '' as any,
        origen: '' as any,
        precio: '' as any,
        moneda: '' as any,
        financiacion: '',
        descripcion: '',
        zonaId: 0,
        direccionPersonalizada: '',
        latitud: -34.78,
        longitud: -58.28,
        isMapConfirmed: false,
        superficieTotal: '' as any,
        superficieCubierta: '' as any,
        tipoInmuebleId: 0,
        agenteId: null,
        propietarioId: null,
        colegaId: null,
        videoUrl: '',
        pdfUrl: '',
        isPublished: false,
        isUnlisted: false,
        isDestacada: false,
        permitMetaAd: false,
        notasPrivadas: '',
        caracteristicas: {},
        imagenes: ['/images/placeholder.png'],
      },
  });


  const { errors } = form.formState;
  const errorCount = Object.keys(errors).length;

  // para capturar todos los errores incluyendo sub-objetos o arrays:
  const flattenedErrors = Object.values(errors).flatMap(err =>
    err?.message ? [err.message] : Object.values(err || {})
  );
  const totalErrors = flattenedErrors.length;

  // 1. GUARDAR COMO BORRADOR (Solo requiere título)
  const handleSaveAsDraft = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    form.clearErrors();

    const values = form.getValues();
    values.isPublished = false;

    // Validamos contra el schema de Borrador (Título, TipoInmueble, Zona, Agente)
    const validation = draftPropertySchema.safeParse(values);

    if (!validation.success) {
      // Sincronizamos los errores específicos del borrador
      Object.entries(validation.error.flatten().fieldErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          form.setError(field as any, {
            type: 'manual',
            message: messages[0],
          });
        }
      });

      setErrorMsg('Para guardar un borrador debe completar al menos Título, Tipo de Inmueble, Agente y Localidad.');
      setIsSubmitting(false);

      setTimeout(() => {
        const firstErrorInput = document.querySelector(
          'input.border-red-500, select.border-red-500, .border-red-500'
        );
        if (firstErrorInput) {
          firstErrorInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      return;
    }

    const result = await savePropertyAction(validation.data as any, initialData?.id);

    if (result.success) {
      router.push('/admin/dashboard');
      router.refresh();
    } else {
      setErrorMsg(result.error || 'Ocurrió un error al guardar el borrador.');
      setIsSubmitting(false);
    }
  };

  // 2. PROCESAR PUBLICACIÓN EN SERVIDOR (Llamado tras pasar la validación)
  const handlePublishSubmit = async (values: PropertyFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    values.isPublished = true;
    const result = await savePropertyAction(values, initialData?.id);

    if (result.success) {
      router.push('/admin/dashboard');
      router.refresh();
    } else {
      setErrorMsg(result.error || 'Ocurrió un error al publicar.');
      setIsSubmitting(false);
    }
  };

  // 3. CAPTURA Y SCROLL EN CASO DE ERRORES AL PUBLICAR
  const onError = (errors: any) => {
    setErrorMsg('Faltan datos obligatorios para poder publicar la propiedad en la web.');

    setTimeout(() => {
      // Busca el primer input en rojo o mensaje de error
      const firstErrorInput = document.querySelector(
        'input.border-red-500, select.border-red-500, textarea.border-red-500, .border-red-500'
      );

      if (firstErrorInput) {
        firstErrorInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const banner = document.querySelector('#form-error-banner');
        if (banner) banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };


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
        <MultimediaSection />

        {/* NUEVO BLOQUE 4: ESTADO Y NOTAS PRIVADAS */}
        <StatusSection />

        {/* FOOTER */}
        <div className="flex justify-end gap-4 pt-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSaveAsDraft}
            className="px-6 py-2.5 text-sm font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl transition"
          >
            {isSubmitting ? 'Guardando...' : '💾 Guardar Borrador'}
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-md"
          >
            {isSubmitting ? 'Publicando...' : '🌐 Publicar Propiedad'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}