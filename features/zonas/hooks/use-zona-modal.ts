'use client';

import { useState, useEffect } from 'react';
import { saveZonaAction } from '@/actions/zonas-actions';
import type { ZonaModel } from '@/prisma/generated/models/Zona';

export function useZonaModal(
  isOpen: boolean,
  padreId: number | null | undefined,
  onClose: () => void,
  onCreated: (zona: ZonaModel) => void
) {
  const [mounted, setMounted] = useState(false);
  const [nombre, setNombre] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setIsSubmitting(true);

    const result = await saveZonaAction({ nombre, padreId });

    setIsSubmitting(false);

    if (result.success && result.zona) {
      onCreated(result.zona as unknown as ZonaModel);
      setNombre('');
      onClose();
    } else {
      setError(result.error || 'Error al guardar la ubicación.');
    }
  };

  return {
    mounted,
    nombre,
    setNombre,
    isSubmitting,
    error,
    handleSubmit,
  };
}