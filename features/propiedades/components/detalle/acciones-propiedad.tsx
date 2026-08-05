'use client';

import { useState } from 'react';

interface AccionesPropiedadProps {
  titulo: string;
  codigo: string;
  variant?: 'icons' | 'full'; // 'icons' para el título, 'full' para el sidebar
}

export function AccionesPropiedad({ titulo, codigo, variant = 'icons' }: AccionesPropiedadProps) {
  const [copiado, setCopiado] = useState(false);

  // 1. Lógica para Copiar Enlace
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch (err) {
      console.error('Error al copiar enlace:', err);
    }
  };

  // 2. Lógica para Compartir Nativo
  const handleShare = async () => {
    const shareData = {
      title: `${titulo} | MS Propiedades`,
      text: `Mira esta propiedad en MS Propiedades (Ref: ${codigo}): ${titulo}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    } else {
      // Fallback si el navegador no soporta Web Share API
      handleCopy();
    }
  };

  // 🔹 MODO ÍCONOS (Ideal para poner al lado del título)
  if (variant === 'icons') {
    return (
      <div className="flex items-center gap-2">
        {/* BOTÓN 1: COPIAR ENLACE */}
        <button
          type="button"
          onClick={handleCopy}
          title="Copiar enlace"
          className="relative group p-2.5 rounded-full bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-brand-orange transition-all cursor-pointer border border-slate-200"
        >
          {copiado ? (
            <span className="text-xs font-bold text-green-600">✓</span>
          ) : (
            /* Ícono de Clip / Copiar */
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
          )}

          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-10">
            {copiado ? '¡Copiado!' : 'Copiar link'}
          </span>
        </button>

        {/* BOTÓN 2: COMPARTIR NATIVO */}
        <button
          type="button"
          onClick={handleShare}
          title="Compartir"
          className="relative group p-2.5 rounded-full bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-brand-orange transition-all cursor-pointer border border-slate-200"
        >
          {/* Ícono de Compartir (3 nodos) */}
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
          </svg>

          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-10">
            Compartir
          </span>
        </button>
      </div>
    );
  }

  // 🔹 MODO FULL (Para la barra lateral)
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-spartan font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-[11px] border border-slate-200 cursor-pointer"
      >
        {copiado ? '✅ Copiado' : '🔗 Copiar Link'}
      </button>

      <button
        type="button"
        onClick={handleShare}
        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-spartan font-bold uppercase tracking-wider py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-[11px] border border-slate-200 cursor-pointer"
      >
        📲 Compartir
      </button>
    </div>
  );
}