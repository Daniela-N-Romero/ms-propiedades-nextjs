'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { EstadoBadge } from './estado-badge';
import type { EstadoPropiedadEnum } from '@/prisma/generated/client'

interface CustomImageProps extends ImageProps {
  propiedadStatus?: EstadoPropiedadEnum | string;
}

export function CustomImage({
  propiedadStatus,
  className = '',
  onLoad,
  ...imageProps
}: CustomImageProps) {

  console.log(propiedadStatus)
  const [isLoaded, setIsLoaded] = useState(false);

return (
<div className={`relative w-full h-full overflow-hidden flex items-center justify-center ${!isLoaded ? 'bg-slate-100' : ''} `}>
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
        {...imageProps}
        onLoad={(e) => {
          // Si la imagen ya completó su descarga o vino de caché
          const imgElement = e.currentTarget as HTMLImageElement;
          if (imgElement.complete) {
            setIsLoaded(true);
          }
        }}
        className={`${className || ''} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <EstadoBadge status={propiedadStatus}/>
      
    </div>
  );
}