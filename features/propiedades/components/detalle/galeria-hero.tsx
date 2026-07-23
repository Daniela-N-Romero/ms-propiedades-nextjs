'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { styles } from './galeria.styles';
import type { Imagen } from '@prisma-client';

interface GaleriaHeroProps {
  titulo: string;
  codigo: string;
  categoria: string; // 'venta' | 'alquiler'
  zonaNombre: string;
  padreZonaNombre?: string;
  imagenes: Imagen[];
}

export default function GaleriaHero({
  titulo,
  codigo,
  categoria,
  zonaNombre,
  padreZonaNombre,
  imagenes
}: GaleriaHeroProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Si no hay fotos cargadas en el array, usamos un placeholder elegante
  const fotosDisplay = imagenes.length > 0 
    ? imagenes 
    : [
      { id: 0, url: '/images/fotos_pitec/1.webp', altText: titulo, orden: 0 },
      { id: 0, url: '/images/fotos_pitec/2.webp', altText: titulo, orden: 0 },
      { id: 0, url: '/images/fotos_pitec/3.webp', altText: titulo, orden: 0 },
      { id: 0, url: '/images/fotos_pitec/4.webp', altText: titulo, orden: 0 },
      { id: 0, url: '/images/fotos_pitec/5.webp', altText: titulo, orden: 0 },
      { id: 0, url: '/images/fotos_pitec/6.webp', altText: titulo, orden: 0 },
      { id: 0, url: '/images/fotos_pitec/7.webp', altText: titulo, orden: 0 },
      { id: 0, url: '/images/fotos_pitec/8.webp', altText: titulo, orden: 0 },
      { id: 0, url: '/images/fotos_pitec/9.webp', altText: titulo, orden: 0 },
      { id: 0, url: '/images/fotos_pitec/10.webp', altText: titulo, orden: 0 },
      { id: 0, url: '/images/fotos_pitec/11.webp', altText: titulo, orden: 0 },
      { id: 0, url: '/images/fotos_pitec/12.webp', altText: titulo, orden: 0 },
      { id: 0, url: '/images/fotos_pitec/13.webp', altText: titulo, orden: 0 }
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

  return (
    <div className="space-y-4">
      {/* 🏷️ ENCABEZADO / TITULAR */}
      <div className={styles.headerContainer}>
        <div>
          <span className={styles.badgeOperacion}>En {categoria}</span>
          <span className={styles.codigoBadge}>CÓDIGO: {codigo}</span>
        </div>
        
        <h1 className={styles.titulo}>{titulo}</h1>
        
        <p className={styles.ubicacion}>
          📍 {padreZonaNombre ? `${padreZonaNombre} > ` : ''}{zonaNombre}
        </p>
      </div>

      {/* 🖼️ GRID MOSAICO DE FOTOS (HERO) */}
      <div className={styles.galleryGrid}>
        
        {/* Foto Principal Grande (Izquierda o Completa en Mobile) */}
        <div 
          className={styles.mainImageContainer} 
          onClick={() => openLightboxAt(0)}
        >
          <Image
            src={fotosDisplay[0].url}
            alt={titulo}
            fill
            priority
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
              <Image
                src={img.url}
                alt={`${titulo} - foto ${idx + 2}`}
                fill
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
        <div className={styles.lightboxOverlay}>
          
          {/* Header del Lightbox */}
          <div className={styles.lightboxHeader}>
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
          <div className={styles.lightboxMainArea}>
            {fotosDisplay.length > 1 && (
              <button type="button" onClick={prevPhoto} className={styles.lightboxNavBtnLeft}>
                ‹
              </button>
            )}

            <div className="relative w-full h-full max-w-5xl max-h-[80vh]">
              <Image
                src={fotosDisplay[currentIndex].url}
                alt={titulo}
                fill
                priority
                className="object-contain"
              />
            </div>

            {fotosDisplay.length > 1 && (
              <button type="button" onClick={nextPhoto} className={styles.lightboxNavBtnRight}>
                ›
              </button>
            )}
          </div>

          {/* Footer del Lightbox con Thumbnails pequeños */}
          <div className="flex gap-2 justify-center overflow-x-auto py-2 z-20">
            {fotosDisplay.map((img, idx) => (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                  currentIndex === idx ? 'border-brand-orange scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <Image 
                  src={img.url} 
                  alt="thumb" 
                  fill 
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