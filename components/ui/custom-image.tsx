'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

export function CustomImage(props: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
<div className="relative w-full h-full overflow-hidden bg-slate-100 flex items-center justify-center">
      {/* CAPA DE LOADING: SPINNER + ÍCONO */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-200/80 animate-pulse gap-2">
          {/* Spinner giratorio */}
          <div className="w-7 h-7 border-3 border-slate-300 border-t-brand-dark rounded-full animate-spin" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            📷 Cargando foto...
          </span>
        </div>
      )}

      {/* IMAGEN PRINCIPAL */}
      <Image
        {...props}
        onLoad={(e) => {
          // Si la imagen ya completó su descarga o vino de caché
          const imgElement = e.currentTarget as HTMLImageElement;
          if (imgElement.complete) {
            setIsLoaded(true);
          }
        }}
        className={`${props.className || ''} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}