'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void; // Función para intentar recargar la página
}

export default function ErrorGlobal({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Error del servidor detectado:", error);
  }, [error]);

  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Ups! Algo salió mal en el servidor</h2>
      <p className="text-gray-600 mb-6">Tuvimos un problema temporal al cargar los datos de la inmobiliaria.</p>
      
      <div className="flex gap-4">
        <button 
          onClick={() => reset()} 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"
        >
          Intentar de nuevo
        </button>
        <a href="/" className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition">
          Ir al Inicio
        </a>
      </div>
    </main>
  );
}