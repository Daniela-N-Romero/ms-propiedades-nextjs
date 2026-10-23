/**
 * useItemsPropuesta: Maneja el estado de los ítems seleccionados, autocompletados, toggle de selección y cálculo rápido de métricas.
 */

import { useState, useEffect } from 'react';
import { ItemForm, PropiedadSimple } from '../types/propuesta.types';

function calcularMesesDesdeFecha(fechaRaw: any): number {
  if (!fechaRaw) return 0;
  const hoy = new Date();
  const entrega = new Date(fechaRaw);
  const diffMs = entrega.getTime() - hoy.getTime();
  const diffDias = diffMs / (1000 * 3600 * 24);
  return diffDias > 0 ? Math.ceil(diffDias / 30) : 0;
}

export function useItemsPropuesta(
  initialItems: any[],
  propiedadesBD: PropiedadSimple[],
  parquesBD: any[],
  tieneTarifaPreferencial: boolean,
  costoObraPreferencial: number,
  costoObraMercado: number
) {
  // 1. Inicialización
  const [itemsSeleccionados, setItemsSeleccionados] = useState<ItemForm[]>(
    initialItems?.map((i: any, idx: number) => {
      const propBase = i.propiedad || {};
      const esPreventaFinal = i.esPreventa ?? propBase.esPreventa ?? false;
      const fechaEntregaFinal = i.fechaEstimadaEntrega || propBase.fechaEstimadaEntrega || null;
      const mesesEntregaFinal = (i.mesesEntrega !== undefined && i.mesesEntrega !== null && i.mesesEntrega > 0)
        ? i.mesesEntrega
        : calcularMesesDesdeFecha(fechaEntregaFinal);

      return {
        ...i,
        propiedadId: i.propiedadId,
        esPrioritaria: i.esPrioritaria || idx === 0,
        nombre: i.nombre || i.parqueIndustrialNombre || i.parqueIndustrial?.nombre || i.propiedad?.parqueIndustrial?.nombre || i.propiedad?.zona?.nombre || '',
        costoObraM2: i.costoObraM2 || 350,
        fosAplicado: i.fosAplicado || 0.6,
        orden: i.orden || idx + 1,
        esFinanciado: i.esFinanciado ?? true,
        porcentajeAnticipo: i.porcentajeAnticipo ?? 30,
        cantidadCuotas: i.cantidadCuotas ?? 24,
        mesesObra: i.mesesObra ?? 8,
        esPreventa: esPreventaFinal,
        fechaEstimadaEntrega: fechaEntregaFinal,
        mesesEntrega: mesesEntregaFinal,
      };
    }) || []
  );

  // 2. Re-sincronización con Logs
  useEffect(() => {
    if (propiedadesBD.length === 0) return;

    console.log("🔍 [DEBUG BBDD] Propiedades cargadas desde API:", propiedadesBD);

    setItemsSeleccionados((itemsPrev) =>
      itemsPrev.map((item) => {
        const propReal = propiedadesBD.find((p) => p.id === item.propiedadId);
        if (!propReal) return item;

        console.log(`📌 [DEBUG ITEM] Propiedad id ${item.propiedadId} (${propReal.titulo}):`, {
          propReal_esPreventa: propReal.esPreventa,
          propReal_fechaEntrega: propReal.fechaEstimadaEntrega,
          item_esPreventa_actual: item.esPreventa,
        });

        // Forzamos el valor de la BBDD si el ítem de la propuesta no viene explícitamente en true
        const esPreventaCalculado = Boolean(propReal.esPreventa || item.esPreventa);
        const fechaEntregaCalculada = item.fechaEstimadaEntrega || propReal.fechaEstimadaEntrega || null;
        const mesesEntregaCalculados = item.mesesEntrega || calcularMesesDesdeFecha(fechaEntregaCalculada);

        return {
          ...item,
          esPreventa: esPreventaCalculado,
          fechaEstimadaEntrega: fechaEntregaCalculada,
          mesesEntrega: mesesEntregaCalculados,
        };
      })
    );
  }, [propiedadesBD, parquesBD]);

  const togglePropiedad = (prop: PropiedadSimple) => {
    const existe = itemsSeleccionados.some((i) => i.propiedadId === prop.id);
    if (existe) {
      setItemsSeleccionados(
        itemsSeleccionados
          .filter((i) => i.propiedadId !== prop.id)
          .map((it, idx) => ({ ...it, orden: idx + 1 }))
      );
    } else {
      console.log("➕ [DEBUG TOGGLE] Agregando propiedad:", prop);

      const supLote = Number(prop.superficieTotal || prop.superficieCubierta || 0);
      const precioTotal = Number(prop.precio || 0);
      const fosBase = 0.6;
      const esPreventa = Boolean(prop.esPreventa);
      const mesesEntrega = esPreventa ? calcularMesesDesdeFecha(prop.fechaEstimadaEntrega) : 0;

      const nuevoItem: ItemForm = {
        propiedadId: prop.id,
        esPrioritaria: itemsSeleccionados.length === 0,
        notaLogistica: prop.parqueIndustrial?.conectividad || prop.parqueIndustrial?.direccionAcceso || '',
        tiempoEstimadoString: '',
        nombre: prop.parqueIndustrial?.nombre || prop.zona?.nombre || prop.titulo,
        costoTierraCustom: precioTotal,
        costoObraM2: tieneTarifaPreferencial ? costoObraPreferencial : costoObraMercado,
        supNaveProyectada: supLote > 0 ? Math.round(supLote * fosBase) : 0,
        alquilerM2Estimado: 5.0,
        anticipoCash: Math.round(precioTotal * 0.3),
        cuotasTexto: prop.financiacion || '',
        fosAplicado: fosBase,
        orden: itemsSeleccionados.length + 1,
        esFinanciado: true,
        porcentajeAnticipo: 30,
        cantidadCuotas: 24,
        mesesObra: 8,
        ofertaContadoUSD: undefined,
        notaEspecial: null,
        esPreventa: esPreventa,
        fechaEstimadaEntrega: prop.fechaEstimadaEntrega || null,
        mesesEntrega: mesesEntrega,
      };
      setItemsSeleccionados([...itemsSeleccionados, nuevoItem]);
    }
  };

  const calcularMetricasItem = (item: ItemForm) => {
    const prop = propiedadesBD.find((p) => p.id === item.propiedadId);
    const supLote = Number(prop?.superficieTotal || prop?.superficieCubierta || 0);
    const fos = item.fosAplicado || 0.6;
    const supNave = item.supNaveProyectada || (supLote > 0 ? Math.round(supLote * fos) : 0);
    const costoTierra = item.costoTierraCustom || 0;
    const tarifaObraM2 = tieneTarifaPreferencial ? costoObraPreferencial : costoObraMercado;
    const costoObraTotal = supNave * tarifaObraM2;
    const inversionTotal = costoTierra + costoObraTotal;
    const ingresoAnualUSD = supNave * (item.alquilerM2Estimado || 5.0) * 12;

    return {
      supNave,
      costoObraTotal,
      inversionTotal,
      ingresoAnualUSD,
      roiAnual: Number((inversionTotal > 0 ? (ingresoAnualUSD / inversionTotal) * 100 : 0).toFixed(2)),
    };
  };

  const maxRoiCalculado =
    itemsSeleccionados.length > 0
      ? Math.max(...itemsSeleccionados.map((it) => calcularMetricasItem(it).roiAnual))
      : 0;

  return {
    itemsSeleccionados,
    setItemsSeleccionados,
    togglePropiedad,
    calcularMetricasItem,
    maxRoiCalculado,
  };
}