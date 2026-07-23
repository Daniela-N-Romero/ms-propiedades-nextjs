'use client';

import { useState, useId } from 'react';

interface ContactoFormProps {
  motivoInicial?: string;
}

export function useContactoForm({ motivoInicial = 'Quiero vender / alquilar mi propiedad' }: ContactoFormProps) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [motivo, setMotivo] = useState(motivoInicial);
  const [mensaje, setMensaje] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const motivoSelectId = useId();

  const handleSubmit = async (e: React.SubmitEvent) => {
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
          motivo,
          mensaje,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'Lead', { motivo });
        }
      } else {
        alert('Ocurrió un error al enviar el formulario.');
      }
    } catch (error) {
      console.error(error);
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
      motivo,
      mensaje,
      isSubmitting,
      submitted,
      motivoSelectId,
    },
    setters: {
      setNombre,
      setApellido,
      setEmail,
      setTelefono,
      setMotivo,
      setMensaje,
    },
    handleSubmit,
  };
}