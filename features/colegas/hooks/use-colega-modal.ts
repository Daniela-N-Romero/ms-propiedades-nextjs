'use client';

import { useState, useEffect } from 'react';
import { saveColegaAction, ColegaFormValues } from '@/actions/colegas-actions';
import type { ColegaModel } from '@/prisma/generated/models/Colega';

const INITIAL_FORM: ColegaFormValues = {
  nombre: '',
  apellido: '',
  inmobiliaria: '',
  telefono: '',
  email: '',
  notasPrivadas: '',
};

export function useColegaModal(
  isOpen: boolean,
  onClose: () => void,
  onCreated: (colega: ColegaModel) => void
) {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<ColegaFormValues>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (field: keyof ColegaFormValues, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setIsSubmitting(true);

    const result = await saveColegaAction(formData);

    setIsSubmitting(false);

    if (result.success && result.colega) {
      onCreated(result.colega as unknown as ColegaModel);
      setFormData(INITIAL_FORM);
      onClose();
    } else {
      setError(result.error || 'Ocurrió un error inesperado.');
    }
  };

  return {
    mounted,
    formData,
    isSubmitting,
    error,
    handleChange,
    handleSubmit,
  };
}