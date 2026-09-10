'use client';

import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PropertyFormValues } from '../schemas/property-schema';

const DRAFT_STORAGE_KEY = 'property_form_draft_v1';

export function useFormAutoSave(
  methods: UseFormReturn<PropertyFormValues>,
  isEditing: boolean = false
) {
  const [draftData, setDraftData] = useState<Partial<PropertyFormValues> | null>(null);
  const { watch, reset, formState: { isDirty } } = methods;

  // 1. Verificar si existe un borrador al montar la pantalla
  useEffect(() => {
    if (isEditing) return;

    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        // Validamos que al menos tenga algo cargado (ej. título o zona)
        if (parsed && (parsed.titulo || parsed.zonaId || parsed.descripcion)) {
          setDraftData(parsed);
        }
      } catch (e) {
        console.error('Error al leer borrador local:', e);
      }
    }
  }, [isEditing]);

  // 2. Guardar automáticamente cambios en localStorage
  useEffect(() => {
    if (isEditing) return;

    const subscription = watch((value) => {
      // Guardamos en localStorage si hay algo relevante escrito
      if (value.titulo || value.descripcion || (value.zonaId && value.zonaId > 0) || value.imagenes?.length) {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(value));
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, isDirty, isEditing]);

  // 3. Advertencia si se cierra la pestaña con cambios
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Restauar datos en el formulario
  const restoreDraft = () => {
    if (draftData) {
      const imagenesRecuperadas = 
      draftData.imagenes && draftData.imagenes.length > 0 
        ? draftData.imagenes 
        : ['/images/placeholder.png'];

    reset({
      ...draftData,
      imagenes: imagenesRecuperadas,
    });
    
    setDraftData(null);
  }
  };

  // Limpiar almacenamiento local
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setDraftData(null);
  };

  return {
    draftData,
    restoreDraft,
    clearDraft,
  };
}