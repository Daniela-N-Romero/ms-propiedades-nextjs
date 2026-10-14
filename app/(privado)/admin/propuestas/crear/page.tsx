"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PropuestaForm from "@/features/propuestas/components/propuesta-form";

function CrearPropuestaContent() {
  const searchParams = useSearchParams();
  const tipo = (searchParams.get("tipo") as any) || "LOGISTICA_RUTAS";

  return <PropuestaForm defaultTipo={tipo} />;
}

export default function CrearPropuestaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Cargando formulario de propuesta...</div>}>
      <CrearPropuestaContent />
    </Suspense>
  );
}