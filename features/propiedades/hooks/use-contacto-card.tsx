'use client';

import { useState } from 'react';

interface UseContactoCardProps {
    propiedadId?: number;
    codigo: string;
    titulo: string;
}

export function useContactoCard({
    propiedadId,
    codigo,
    titulo,
}: UseContactoCardProps) {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [mensaje, setMensaje] = useState(`Hola! Quisiera recibir información sobre la propiedad Ref: ${codigo}.`);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmitCard = async (e: React.SubmitEvent) => {
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

    return {
    formState: {
      nombre,
      apellido,
      email,
      telefono,
      mensaje,
      isSubmitting,
      submitted
    },
    setters: {
      setNombre,
      setApellido,
      setEmail,
      setTelefono,
      setMensaje,
    },
    handleSubmitCard
  };
}