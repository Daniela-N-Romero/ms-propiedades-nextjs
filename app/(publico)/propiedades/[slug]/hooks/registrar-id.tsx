"use client";
import { useEffect } from "react";
import { useAdminConfig } from "@/providers/config-provider";

export function RegistrarPropiedadId({ id }: { id: string | number }) {
  const { setPropiedadId } = useAdminConfig();
  
  useEffect(() => {
    setPropiedadId(id); // Registra el ID al cargar la vista
    return () => setPropiedadId(null); // Limpia el ID al salir de la propiedad
  }, [id, setPropiedadId]);

  return null;
}