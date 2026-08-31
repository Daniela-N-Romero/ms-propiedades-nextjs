"use client";
import { useEffect } from "react";
import { PropertyFullData } from '@/types/server-data';

export function RegistrarGTMEvent({propiedad }: { propiedad: PropertyFullData }) {
    useEffect(() => {
          if (typeof window !== 'undefined' && (window as any).dataLayer) {
              (window as any).dataLayer.push({
                  event: 'view_item', // Evento para simular cambio de página en SPAs
                  page_path: `/propiedades/${propiedad.slug}`,
                  page_title: propiedad.titulo,
                  // Parámetros comerciales para que Meta optimice anuncios
                   custom_data: {
                    currency: propiedad.moneda === 'USD' ? 'USD' : 'ARS',
                    value: propiedad.precio,
                    content_ids: [propiedad.codigo],
                    content_type: 'product',
                    content_name: propiedad.titulo
                }
              });
          }
      }, [propiedad]);
    
      return null;
}

