'use client';

import { useState } from 'react';
import { styles } from './contacto-card.styles';
import { formatPrecio } from '@/lib/utils';
import type { Agente } from '@prisma-client';
import { useContactLinks } from '@/providers/config-provider';
import { ContactLinks } from '@/types/contact-links';

//TO DO: separar logica de vista

interface ContactoCardProps {
    propiedadId?: number;
    codigo: string;
    slug: string;
    titulo: string;
    precio: number;
    moneda: string;
    pdfUrl?: string | null;
    agente: Agente;
}

export default function ContactoCard({
    propiedadId,
    codigo,
    slug,
    titulo,
    precio,
    moneda,
    pdfUrl,
    agente
}: ContactoCardProps) {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [mensaje, setMensaje] = useState(`Hola! Quisiera recibir información sobre la propiedad Ref: ${codigo}.`);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Estado para guardar la URL absoluta de la propiedad
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const links = useContactLinks() as ContactLinks;
    
    // Armamos el enlace de WhatsApp con el mensaje codificado para la URL
    const whatsappNumber = agente.telefono || links.telefono;
    const textoMensaje = `Hola ${agente.nombre}! Quisiera consultar por la propiedad REF: ${codigo} (${titulo}).
Valor: ${formatPrecio(precio, moneda)}.
https://${window.location.host}/propiedades/${slug}`;

    const whatsappText = encodeURIComponent(textoMensaje);

    let whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;
    if (!whatsappNumber) {
        whatsappUrl = `${links.whatsapp}?text=${whatsappText}`;
    }

    const handleWhatsAppClick = () => {
        // Evento Analytics (Meta Pixel / GA)
        if (typeof window !== 'undefined' && (window as any).fbq) {
            (window as any).fbq('track', 'Contact', { property_code: codigo, channel: 'whatsapp' });
        }
    };

    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    apellido,
                    email,
                    telefono,
                    mensaje,
                    propiedadId,
                    propiedadCodigo: codigo,
                    propiedadTitulo: titulo,
                }),
            });

            if (res.ok) {
                setSubmitted(true);
                if (typeof window !== 'undefined' && (window as any).fbq) {
                    (window as any).fbq('track', 'Lead', { property_code: codigo });
                }
            } else {
                alert('Ocurrió un error al enviar la consulta. Intente nuevamente.');
            }
        } catch (err) {
            console.error(err);
            alert('Error de conexión.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    href={whatsappUrl}
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
                <div className="pt-2 border-t border-slate-100">
                    <h5 className={styles.formTitle}>Enviar Mensaje Directo</h5>

                    {submitted ? (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl text-center space-y-1">
                            <p className="font-bold">¡Mensaje Enviado!</p>
                            <p>Un asesor se pondrá en contacto a la brevedad.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitForm} className="space-y-3">
                            <input
                                type="text"
                                placeholder="Nombre *"
                                required
                                className={styles.input}
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Apellido *"
                                required
                                className={styles.input}
                                value={apellido}
                                onChange={(e) => setApellido(e.target.value)}
                            />
                            <input
                                type="email"
                                placeholder="Email *"
                                required
                                className={styles.input}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <input
                                type="tel"
                                placeholder="Teléfono / WhatsApp *"
                                required
                                className={styles.input}
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                            />
                            <textarea
                                className={styles.textarea}
                                value={mensaje}
                                onChange={(e) => setMensaje(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={styles.btnSubmit}
                            >
                                {isSubmitting ? 'Enviando...' : 'Enviar Consulta'}
                            </button>
                        </form>
                    )}
                </div>

            </div>

            {/* 📱 BARRA FLOTANTE FIJA INFERIOR (SOLO MOBILE) */}
            <div className={styles.mobileBottomBar}>
                <div>
                    <span className={styles.mobileCode}>Código: {codigo}</span>
                    <span className={styles.mobilePrice}>{formatPrecio(precio, moneda)}</span>
                </div>

                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleWhatsAppClick}
                    className="bg-[#25D366] text-white font-spartan font-bold text-xs uppercase px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-transform"
                >
                    <span>💬 WhatsApp</span>
                </a>
            </div>
        </>
    );
}