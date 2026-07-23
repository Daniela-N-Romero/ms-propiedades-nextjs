'use client';
import { useContactoCard } from '../../../hooks/use-contacto-card'
import ContactoCardView from "./contacto-card-view";

interface ContactoCardProps {
    propiedadId?: number;
    codigo: string;
    titulo: string;
}

export default function ContactoCard({ propiedadId, codigo, titulo }: ContactoCardProps) {

  const { formState, setters, handleSubmitCard } = useContactoCard({ propiedadId, codigo, titulo });


  return (
    <ContactoCardView
      formState={formState}
      setters={setters}
      handleSubmitCard={handleSubmitCard}
      />
  );
}