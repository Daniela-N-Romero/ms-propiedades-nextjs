/**
 * @file use-filter-draft.ts
 * @description Hook de React que administra el estado en borrador (Draft State).
 * Permite que el usuario seleccione y deseleccione filtros localmente sin generar
 * peticiones de red ni bloquear el renderizado, ejecutando la consulta únicamente
 * al presionar "Aplicar Filtros".
 */


"use client";

import { useState, useTransition, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { FiltrosState } from '../types/filtrado.types';
import { parseSearchParamsToFilters, buildFilterQueryString } from '../utils/url-query-builder';

export function useFilterDraft() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
   // useTransition permite marcar la navegación como una transición de baja prioridad,
  // evitando que la pantalla se congele mientras el Server Component procesa los datos
  const [isPending, startTransition] = useTransition();


    /**
   * ESTADO LOCAL EN MEMORIA (DRAFT):
   * Se inicializa mediante una función lazy `() => parseSearchParamsToFilters(searchParams)`
   * para que solo lea la URL en el primer montaje del componente y no en cada re-render.
   */
  const [draftFilters, setDraftFilters] = useState<FiltrosState>(() =>
    parseSearchParamsToFilters(searchParams)
  );

  /**
   * Actualiza campos atómicos del borrador (como 'moneda', 'categoria', o rangos numéricos).
   * Utiliza la forma funcional `(prev) => ({ ...prev, ...nuevosCampos })` para garantizar
   * que nunca se pierdan datos por cierres asíncronos (stale closures).
   */
  const updateDraft = (campos: Partial<FiltrosState>) => {
    setDraftFilters((prev) => ({ ...prev, ...campos }));
  };

  /**
   * Agrega o quita un valor dentro de un array de selección múltiple (para checkboxes).
   * 
   * @param key - Clave del array a mutar ('subtipo' o 'localidad')
   * @param val - Valor a alternar (slug string o ID numérico)
   * 
   * Ejemplo de comportamiento:
   * Si 'localidad' tiene [20, 21] y llamamos con 20 -> nuevo estado: [21]
   * Si 'localidad' tiene [21] y llamamos con 20 -> nuevo estado: [21, 20]
   */
  const toggleArrayDraft = (key: 'subtipo' | 'localidad', val: string | number) => {
    setDraftFilters((prev) => {
      const actual = (prev[key] || []) as any[];
      const existe = actual.includes(val);
        const nuevoArray = existe
        ? actual.filter((item) => item !== val) // Remover si ya estaba
        : [...actual, val];                    // Agregar si no estaba
      return { ...prev, [key]: nuevoArray };
    });
  };

  /**
 * Agrega o quita múltiples IDs de una vez (ideal para tildar/destildar todo un partido)
 */
const setMultipleInArrayDraft = (
  key: 'subtipo' | 'localidad',
  items: (string | number)[],
  agregar: boolean
) => {
  setDraftFilters((prev) => {
    const actual = (prev[key] || []) as any[];
    let nuevo: any[];

    if (agregar) {
      // Une los existentes con los nuevos evitando duplicados
      nuevo = Array.from(new Set([...actual, ...items]));
    } else {
      // Quita todos los items especificados
      nuevo = actual.filter((item) => !items.includes(item));
    }

    return { ...prev, [key]: nuevo };
  });
};

   /**
   * Restablece el borrador a un estado completamente vacío (acción "Limpiar Filtros")
   */
  const resetDraft = () => {
    setDraftFilters({});
  };

   /**
   * CONTADOR INTELIGENTE DE FILTROS ACTIVOS:
   * Se recalcula eficientemente solo cuando `draftFilters` cambia (`useMemo`).
   * Sirve para renderizar en la interfaz: "Aplicar Filtros (3)", indicándole
   * al usuario cuántos criterios va a aplicar antes de presionar el botón.
   */
  const activeCount = useMemo(() => {
    let count = 0;
    if (draftFilters.categoria) count++;
    if (draftFilters.moneda) count++;
    if (draftFilters.subtipo && draftFilters.subtipo.length > 0) count += draftFilters.subtipo.length;
    if (draftFilters.localidad && draftFilters.localidad.length > 0) count += draftFilters.localidad.length;
    if (draftFilters.precioMin || draftFilters.precioMax) count++;
    if (draftFilters.supMin || draftFilters.supMax) count++;
    if (draftFilters.supCubMin || draftFilters.supCubMax) count++;
    return count;
  }, [draftFilters]);


  /**
   * DISPARADOR PRINCIPAL (APPLY):
   * Toma todo el estado provisional acumulado en `draftFilters`, lo procesa
   * con el serializador puro `buildFilterQueryString` y ejecuta UNA ÚNICA
   * navegación con `router.push`.
   * 
   * @param onApplied - Callback opcional para ejecutar acciones de UI
   *                    (por ejemplo: cerrar el Drawer móvil tras aplicar).
   */
  const applyFilters = (onApplied?: () => void) => {
    const queryString = buildFilterQueryString(draftFilters, {
      currentSearchParams: searchParams,
      preserveKeys: ['mercado'], // Mantiene el mercado industrial/comercial activo
    });

    startTransition(() => {
      router.push(`${pathname}${queryString}`);
      if (onApplied) onApplied();
    });
  };


  return {
    draftFilters,              // Estado local actual de los filtros
    updateDraft,              // Función para actualizar campos individuales (rangos, categoría)
    toggleArrayDraft,         // Función para checkboxes (subtipos y localidades)
    setMultipleInArrayDraft,  // Función para agregae o quitae múltiples IDs de una vez (ideal para tildar/destildar todo un partido)
    resetDraft,               // Función para limpiar todos los filtros
    applyFilters,             // Función que consolida y navega
    activeCount,              // Cantidad de filtros seleccionados (para el badge del botón)
    isPending,                // Boolean que indica si la navegación está en curso
  };
}