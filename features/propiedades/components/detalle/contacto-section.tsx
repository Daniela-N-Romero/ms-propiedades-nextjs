'use client';

import { Agente } from "@/prisma/generated/client";
import ContactoCard from "./propiedad-contacto-form/contacto-card";
import { styles } from "./contacto-section.styles";
import { useWhatsAppButtons } from "../../hooks/use-whatsapp-buttons";
import WhatsAppFloatingButton from "./propiedad-wpp-buttons/whatsapp-floating-button";

interface ContactoSectionProps {
    codigo: string,
    titulo: string,
    slug: string,
    precio: number,
    moneda: string,
    pdfUrl: string,
    agente: Agente,
    propiedadId: number
}


export default function ContactoSection({
    codigo,
    titulo,
    slug,
    precio,
    moneda,
    pdfUrl,
    agente,
    propiedadId,
}: ContactoSectionProps) {

    const { whatsAppUrl, handleWhatsAppClick } = useWhatsAppButtons({ codigo, slug, titulo, precio, moneda, agente });

    return (
        <>
            {/* 🖥️ CARD FIJA PARA DESKTOP */}
            <div className={styles.stickyContainer}>

                {/* AGENTE ASIGNADO */}
                <div className={styles.agentHeader}>
                    <div className={styles.agentAvatar}>
                        {agente.nombre[0]}{agente.apellido[0]}
                    </div>
                    <div>
                        <h4 className={styles.agentName}>{agente.nombre} {agente.apellido}</h4>
                        <p className={styles.agentRole}>Asesor Comercial — MS Propiedades</p>
                    </div>
                </div>

                {/* BOTÓN WHATSAPP DIRECTO */}
                <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleWhatsAppClick}
                    className={styles.btnWhatsApp}
                >
                    <span>💬 Consultar por WhatsApp</span>
                </a>

                {/* DESCARGA DE FICHA PDF (Si existe en la DB) */}
                {pdfUrl && (
                    <a
                        href={pdfUrl}
                        target="_blank"
                        download
                        className={styles.btnPdf}
                    >
                        <span>📄 Descargar Ficha en PDF</span>
                    </a>
                )}

                {/* FORMULARIO DE CONSULTA */}
                <ContactoCard
                    propiedadId={propiedadId}
                    codigo={codigo}
                    titulo={titulo} />

            </div>

            {/* 📱 BARRA FLOTANTE FIJA INFERIOR (SOLO MOBILE) */}
            <WhatsAppFloatingButton
                codigo={codigo}
                slug={slug}
                titulo={titulo}
                precio={precio}
                moneda={moneda}
                agente={agente}

            />
        </>
    );
}