'use client';

import { Agente } from '@prisma-client';
import { useContactLinks } from '@/providers/config-provider';
import { ContactLinks } from '@/types/contact-links';
import { useState } from 'react';
import { formatPrecio } from '@/lib/utils';

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

    const handleWhatsAppClick = () => {
        // Evento Analytics (Meta Pixel / GA)
        if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('track', 'Contact', { property_code: codigo, channel: 'whatsapp' });
        }
    };


    return {
    whatsAppUrl,
    handleWhatsAppClick
  };
}