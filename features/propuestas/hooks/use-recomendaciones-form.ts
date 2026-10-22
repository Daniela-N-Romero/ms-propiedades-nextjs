/**
 * use-recomendaciones-form: Administra la lista de tarjetas y conclusiones estratégicas.
 */

import { useState } from 'react';
import { TarjetaRecomendacion } from '../types/propuesta.types';

const plantillasPorDefecto: TarjetaRecomendacion[] = [
  { id: "card-1", activa: true, titulo: "🏆 Máximo Rendimiento", opcionAsociadaId: "", texto: "Ideal para inversores enfocados en la máxima rentabilidad bruta por alquiler." },
  { id: "card-2", activa: true, titulo: "⚖️ Eficiencia de Capital y Liquidez", opcionAsociadaId: "", texto: "El valor del anticipo evita invertir el total al inicio, optimizando tu capital y aportando mayor liquidez." },
  { id: "card-3", activa: true, titulo: "📍 Ubicación Consolidada", opcionAsociadaId: "", texto: "Ubicaciones estratégicas sobre autopistas de rápida colocación locativa." },
];

export function useRecomendacionesForm(initialPayload?: any) {
  const [recomMostrar, setRecomMostrar] = useState<boolean>(initialPayload?.recomendaciones?.mostrarSeccion ?? true);
  const [recomTituloGeneral, setRecomTituloGeneral] = useState<string>(
    initialPayload?.recomendaciones?.tituloGeneral || "🎯 Conclusiones Estratégicas & Recomendaciones"
  );
  const [tarjetasRecom, setTarjetasRecom] = useState<TarjetaRecomendacion[]>(
    initialPayload?.recomendaciones?.tarjetas || plantillasPorDefecto
  );

  const agregarTarjetaRecom = () => {
    setTarjetasRecom([
      ...tarjetasRecom,
      {
        id: `card-${Date.now()}`,
        activa: true,
        titulo: "✨ Nueva Recomendación Personalizada",
        opcionAsociadaId: "",
        texto: "Escribe aquí la recomendación o análisis específico para esta propuesta.",
      },
    ]);
  };

  const eliminarTarjetaRecom = (id: string) => setTarjetasRecom(tarjetasRecom.filter((t) => t.id !== id));

  const actualizarTarjetaRecom = (id: string, campo: Partial<TarjetaRecomendacion>) => {
    setTarjetasRecom(tarjetasRecom.map((t) => (t.id === id ? { ...t, ...campo } : t)));
  };

  return {
    recomMostrar,
    setRecomMostrar,
    recomTituloGeneral,
    setRecomTituloGeneral,
    tarjetasRecom,
    agregarTarjetaRecom,
    eliminarTarjetaRecom,
    actualizarTarjetaRecom,
  };
}