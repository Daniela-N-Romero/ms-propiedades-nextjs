'use client';

import { useState, useEffect } from 'react';
import { savePropietarioAction, PropietarioFormInput } from '@/actions/propietarios-actions';
import type { PropietarioModel } from '@/prisma/generated/models/Propietario';

const INITIAL_FORM: PropietarioFormInput = {
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  notasPrivadas: '',
};

export function usePropietarioModal(
  isOpen: boolean,
  onClose: () => void,
  onCreated: (propietario: PropietarioModel) => void
) {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<PropietarioFormInput>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (field: keyof PropietarioFormInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setIsSubmitting(true);

    const result = await savePropietarioAction(formData);

    setIsSubmitting(false);

    if (result.success && result.propietario) {
      onCreated(result.propietario as unknown as PropietarioModel);
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