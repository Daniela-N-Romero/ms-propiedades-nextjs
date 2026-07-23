'use client';

import { useContactoForm } from '../../hooks/use-contacto-form';
import FormContactoView from './contacto-form-view';

interface ContactoFormProps {
  motivoInicial?: string;
}

export default function ContactoForm({ motivoInicial }: ContactoFormProps) {
  const { formState, setters, handleSubmit } = useContactoForm({ motivoInicial });

  return (
    <FormContactoView 
      formState={formState}
      setters={setters}
      handleSubmit={handleSubmit}
    />
  );
}