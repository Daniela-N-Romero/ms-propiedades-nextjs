'use client';

import { Agente } from '@prisma-client';
import { useContactLinks } from '@/providers/config-provider';
import { ContactLinks } from '@/config/contact-links';
import { useState } from 'react';
import { formatPrecio } from '@/lib/utils-formatting';
import { trackWhatsAppClick } from '@/lib/analytics';

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

const handleWhatsAppClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault();

    // Llamada unificada pasando el objeto estructurado
    trackWhatsAppClick({ codigo, titulo, precio, moneda, slug }); 

    window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');
};


    return {
        whatsAppUrl,
        handleWhatsAppClick
    };
}