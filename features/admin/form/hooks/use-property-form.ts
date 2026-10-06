'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { savePropertyAction } from '@/actions/propiedades-actions';
import {
  PropertyFormValues,
  basePublishPropertySchema,
  draftPropertySchema,
} from '../schemas/property-schema';
import type { PropertyFullData } from '@/types/server-data';

export function usePropertyForm(initialData?: PropertyFullData | null) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'draft' | 'publish' | null>(null);

  const rawCaracteristicas = (initialData?.caracteristicas as Record<string, any>) || {};

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(basePublishPropertySchema) as any,
    defaultValues: initialData
      ? {
          titulo: initialData.titulo,
          slug: initialData.slug,
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
          caracteristicas: rawCaracteristicas,
          imagenes:
            initialData?.imagenes && initialData.imagenes.length > 0
              ? initialData.imagenes.map((i) => ({
                  url: i.url,
                  urlWatermark: i.urlWatermark || null,
                }))
              : ['/images/placeholder.png'],
        }
      : {
          titulo: '',
          slug: '',
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

  const handleSaveAsDraft = async () => {
    setIsSubmitting(true);
    setActionType('draft');
    setErrorMsg(null);
    form.clearErrors();

    const values = form.getValues();
    values.isPublished = false;

    const validation = draftPropertySchema.safeParse(values);
    if (!validation.success) {
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
      return;
    }

    const result = await savePropertyAction(validation.data as any, initialData?.id);
    setActionType(null)
    if (result.success) {
      router.push('/admin/dashboard');
      router.refresh();
    } else {
      setErrorMsg(result.error || 'Ocurrió un error al guardar el borrador.');
      setIsSubmitting(false);
    }
  };

  const handlePublishSubmit = async (values: PropertyFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setActionType('publish');

    values.isPublished = true;
    const result = await savePropertyAction(values, initialData?.id);
    setActionType(null)
    if (result.success) {
      router.push('/admin/dashboard');
      router.refresh();
    } else {
      setErrorMsg(result.error || 'Ocurrió un error al publicar.');
      setIsSubmitting(false);
    }
  };

  const onError = () => {
    setErrorMsg('Faltan datos obligatorios para poder publicar la propiedad en la web.');
  };

  return {
    form,
    isSubmitting,
    actionType,
    errorMsg,
    handleSaveAsDraft,
    handlePublishSubmit,
    onError,
  };
}