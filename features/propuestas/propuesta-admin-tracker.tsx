'use client';

import { useEffect } from 'react';
import { useAdminConfig } from '@/providers/config-provider';

export default function PropuestaAdminTracker({ id }: { id: string | number }) {
  const { setPropuestaId } = useAdminConfig();

  useEffect(() => {
    if (id) {
      setPropuestaId(id);
    }
    return () => setPropuestaId(null);
  }, [id, setPropuestaId]);

  return null; // No renderiza nada en HTML, solo ejecuta el efecto
}