'use client';

import { Agente } from '@prisma-client';
import { useContactLinks } from '@/providers/config-provider';
import { ContactLinks } from '@/config/contact-links';
import { useState } from 'react';
import { formatPrecio } from '@/lib/utils-formatting';

interface useWhatsAppButtonsProps {
    propiedadId?: number;
    codigo: string;
    slug: string;
    titulo: string;
    precio: number;
    moneda: string;
    agente: Agente;
}

export function useWhatsAppButtons({
    codigo,
    slug,
    titulo,
    precio,
    moneda,
    agente
}: useWhatsAppButtonsProps) {

    // Estado para guardar la URL absoluta de la propiedad
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const links = useContactLinks() as ContactLinks;

    // Armamos el enlace de WhatsApp con el mensaje codificado para la URL
    const whatsappNumber = agente.telefono || links.telefono;
    const textoMensaje = `Hola ${agente.nombre}! Quisiera consultar por la propiedad REF: ${codigo} (${titulo}). Valor: ${formatPrecio(precio, moneda)}.
${baseUrl}/propiedades/${slug}`;

    const whatsappText = encodeURIComponent(textoMensaje);

    let whatsAppUrl = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;
    if (!whatsappNumber) {
        whatsAppUrl = `${links.whatsapp}?text=${whatsappText}`;
    }

    const handleWhatsAppClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        // Evento Analytics (Meta Pixel / GA)
        // Enviamos los datos directamente a Google Tag Manager
       if (typeof window !== 'undefined' && (window as any).dataLayer) {
            (window as any).dataLayer.push({
                event: 'contact', // Capturado automáticamente por tu GTM actual
                custom_data: {
                    currency: moneda === 'USD' ? 'USD' : 'ARS',
                    value: precio,
                    content_ids: [codigo],
                    content_category: 'Propiedad',
                    content_name: titulo
                }
            });
        }
        window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');
    };


    return {
        whatsAppUrl,
        handleWhatsAppClick
    };
}