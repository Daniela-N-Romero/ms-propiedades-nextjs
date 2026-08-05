'use client';

import { useState, useTransition } from 'react';
import { toggleDestacadaAction } from '../actions/toggle-destacada';

interface StarButtonProps {
  propiedadId: number;
  initialIsFeatured: boolean;
}

export default function StarButton({ propiedadId, initialIsFeatured }: StarButtonProps) {
  const [isFeatured, setIsFeatured] = useState(initialIsFeatured);
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se dispare el click de la fila si es un enlace

    // Cambiamos el estado visual inmediatamente (UI optimista)
    const newStatus = !isFeatured;
    setIsFeatured(newStatus);

    startTransition(async () => {
      const res = await toggleDestacadaAction(propiedadId, isFeatured);
      if (!res.success) {
        // Si falló en la BD, revertimos el cambio visual
        setIsFeatured(isFeatured);
        alert('Hubo un error al guardar el cambio.');
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={isFeatured ? 'Quitar de Destacados' : 'Marcar como Destacada'}
      className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
        isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isFeatured ? '#F59E0B' : 'none'} // Amarillo/Dorado si está destacada
        stroke={isFeatured ? '#D97706' : '#9CA3AF'} // Borde amarillo o gris
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 transition-colors duration-200"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  );
}