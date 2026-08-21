'use client';

import { useState, useEffect, useCallback } from 'react';
import { CustomImage } from '@/components/ui/custom-image';
import { styles } from './galeria.styles';
import type { Imagen } from '@prisma-client';
import { AccionesPropiedad } from './acciones-propiedad';

interface GaleriaHeroProps {
  titulo: string;
  codigo: string;
  categoria: string; // 'venta' | 'alquiler'
  zonaNombre: string;
  padreZonaNombre?: string;
  imagenes: Imagen[];
  pdfUrl?: string | null;
  propiedadId?: number;
}

export default function GaleriaHero({
  titulo,
  codigo,
  categoria,
  zonaNombre,
  padreZonaNombre,
  imagenes,
  pdfUrl,
  propiedadId,
}: GaleriaHeroProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Si no hay fotos cargadas en el array, usamos un placeholder elegante
  const fotosDisplay = imagenes && imagenes.length > 0
    ? imagenes
    : [
      { id: 0, url: '/images/placeholder.png', orden: 0, propiedadId: 0 }
    ];



  const openLightboxAt = (index: number) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
  };

  const nextPhoto = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % fotosDisplay.length);
  }, [fotosDisplay.length]);

  const prevPhoto = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + fotosDisplay.length) % fotosDisplay.length);
  }, [fotosDisplay.length]);

  // Manejo de teclas (Esc para cerrar, Flechas para navegar)
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Bloquear el scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen, nextPhoto, prevPhoto]);

  const getWatermarkUrl = (originalUrl: string) => {
    if (!originalUrl || originalUrl.startsWith('/images/placeholder')) {
      return originalUrl;
    }

    return `/api/properties/imagenes/watermark?url=${encodeURIComponent(originalUrl)}`;
  };

  return (
    <div className="space-y-4">
      {/* 🏷️ ENCABEZADO / TITULAR */}
      <div className={styles.headerContainer}>
        <div>
          <span className={styles.badgeOperacion}>En {categoria}</span>
          <span className={styles.codigoBadge}>CÓDIGO: {codigo}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <h1 className={styles.titulo}>{titulo}</h1>

          {/* 🚀 Botón ícono de compartir */}
          <div className="shrink-0 pt-1">
            <AccionesPropiedad titulo={titulo} codigo={codigo} variant="icons" />
          </div>
        </div>

        <p className={styles.ubicacion}>
          📍 {padreZonaNombre ? `${padreZonaNombre} > ` : ''}{zonaNombre}

        </p>
         {pdfUrl && (
          
          <p className="mr-3 max-w-50">
              <a
              href={pdfUrl ? pdfUrl : `/api/properties/${propiedadId}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnPdf}
            >
              📄 Descargar Ficha PDF
            </a>
          </p>
          
        )}

      </div>

      {/* 🖼️ GRID MOSAICO DE FOTOS (HERO) */}
      <div className={styles.galleryGrid}>

        {/* Foto Principal Grande (Izquierda o Completa en Mobile) */}
        <div
          className={styles.mainImageContainer}
          onClick={() => openLightboxAt(0)}
        >
          <CustomImage
            src={getWatermarkUrl(fotosDisplay[0].url)}
            alt={titulo}
            fill
            preload={true}
            unoptimized
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Grilla Secundaria (Derecha - Solo visible en Desktop para 4 fotos adicionales) */}
        <div className={styles.secondaryGrid}>
          {fotosDisplay.slice(1, 5).map((img, idx) => (
            <div
              key={img.id || idx}
              className={styles.smallImageContainer}
              onClick={() => openLightboxAt(idx + 1)}
            >
              <CustomImage
                src={getWatermarkUrl(img.url)}
                alt={`${titulo} - foto ${idx + 2}`}
                fill
                unoptimized
                sizes="25vw"
                className="object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
          ))}
        </div>

        {/* Botón flotante para abrir todas las fotos */}
        <button
          type="button"
          onClick={() => openLightboxAt(0)}
          className={styles.btnVerTodas}
        >
          📸 Ver todas las fotos ({fotosDisplay.length})
        </button>
      </div>

      {/* 🌌 LIGHTBOX / MODAL FULLSCREEN */}
      {isLightboxOpen && (
        <div className={styles.lightboxOverlay} onClick={() => setIsLightboxOpen(false)}>

          {/* Header del Lightbox */}
          <div id="lightboxHeader" className={styles.lightboxHeader}>
            <span className={styles.lightboxCounter}>
              Foto {currentIndex + 1} de {fotosDisplay.length} — REF: {codigo}
            </span>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className={styles.lightboxCloseBtn}
            >
              ✕
            </button>
          </div>

          {/* Área Principal con Foto Activa y Botones de Navegación */}
          <div id="lightboxMainArea" className={styles.lightboxMainArea} >
            {fotosDisplay.length > 1 && (
              <button type="button" onClick={(e) => { e.stopPropagation(); prevPhoto(); }} className={styles.lightboxNavBtnLeft}>
                ‹
              </button>
            )}

            <div className="relative w-full h-full max-w-5xl max-h-[80vh]">
              <CustomImage
                src={getWatermarkUrl(fotosDisplay[currentIndex].url)}
                alt={titulo}
                fill
                priority
                unoptimized
                className="object-contain"
                onClick={(e) => { e.stopPropagation() }}
              />
            </div>

            {fotosDisplay.length > 1 && (
              <button type="button" onClick={(e) => { e.stopPropagation(); nextPhoto(); }} className={styles.lightboxNavBtnRight}>
                ›
              </button>
            )}
          </div>

          {/* Footer del Lightbox con Thumbnails pequeños */}
          <div className="flex gap-2 justify-center overflow-x-auto py-2 z-20" onClick={(e) => e.stopPropagation()}>
            {fotosDisplay.map((img, idx) => (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${currentIndex === idx ? 'border-brand-orange scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
              >
                <CustomImage
                  src={getWatermarkUrl(img.url)}
                  alt="thumb"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </button>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}