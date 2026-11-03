"use client";

import { Agente } from "@prisma-client";
import { useContactLinks } from "@/providers/config-provider";
import { ContactLinks } from "@/config/contact-links";
import { useState } from "react";
import { formatPrecio } from "@/lib/utils-formatting";
import { trackWhatsAppClick } from "@/lib/analytics";

interface useWhatsAppButtonsProps {
	propiedadId?: number;
	codigo: string;
	slug: string;
	titulo: string;
	precio: number;
	moneda: string;
	agente?: {
		nombre?: string;
		telefono?: string;
	} | null;
}

export function useWhatsAppButtons({
	codigo,
	slug,
	titulo,
	precio,
	moneda,
	agente,
}: useWhatsAppButtonsProps) {
	// Estado para guardar la URL absoluta de la propiedad
	const baseUrl =
		process.env.NEXT_PUBLIC_SITE_URL ||
		(typeof window !== "undefined" ? window.location.origin : "");
	const links = useContactLinks() as ContactLinks;

	// Destinatario: teléfono del agente asignado o el general de la inmobiliaria
	const whatsappNumber = agente?.telefono || links?.telefono;
	const numeroLimpio = whatsappNumber ? whatsappNumber.replace(/\D/g, "") : "";

	// Saludo condicional limpio: Si existe nombre saluda por su nombre; sino, saludo cordial
	const saludo = agente?.nombre ? `Hola ${agente.nombre}!` : "Hola!";

	const textoMensaje = `${saludo} Quisiera consultar por la propiedad REF: ${codigo} (${titulo}). Valor: ${formatPrecio(precio, moneda)}.
${baseUrl}/propiedades/${slug}`;

	const whatsappText = encodeURIComponent(textoMensaje);

	let whatsAppUrl = `https://wa.me/${numeroLimpio}?text=${whatsappText}`;
	if (!numeroLimpio) {
		whatsAppUrl = `${links?.whatsapp || ""}?text=${whatsappText}`;
	}
	const handleWhatsAppClick = (
		e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
	) => {
		e.preventDefault();

		// Llamada unificada pasando el objeto estructurado
		trackWhatsAppClick({ codigo, titulo, precio, moneda, slug });

		window.open(whatsAppUrl, "_blank", "noopener,noreferrer");
	};

	return {
		whatsAppUrl,
		handleWhatsAppClick,
	};
}
