"use client";

import { useEffect, useState, use } from "react";
import PropuestaForm from "@/features/propuestas/components/propuesta-form";

export default function EditarPropuestaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [propuesta, setPropuesta] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/propuestas/${id}`)
      .then((res) => res.json())
      .then((data) => setPropuesta(data));
  }, [id]);

  if (!propuesta) return <div className="p-8 text-center text-xs">Cargando propuesta...</div>;

  return <PropuestaForm initialData={propuesta} propuestaId={id} />;
}