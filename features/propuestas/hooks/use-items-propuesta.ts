/**
 * useItemsPropuesta: Maneja el estado de los ítems seleccionados, autocompletados, toggle de selección y cálculo rápido de métricas.
 */

import { useState, useEffect } from 'react';
import { ItemForm, PropiedadSimple } from '../types/propuesta.types';

export function useItemsPropuesta(
  initialItems: any[],
  propiedadesBD: PropiedadSimple[],
  parquesBD: any[],
  tieneTarifaPreferencial: boolean,
  costoObraPreferencial: number,
  costoObraMercado: number
) {
  // 1. Inicialización de los ítems seleccionados
  const [itemsSeleccionados, setItemsSeleccionados] = useState<ItemForm[]>(
    initialItems?.map((i: any, idx: number) => ({
      ...i, // Pasa automáticamente todos los campos (incluyendo esPreventa, mesesEntregaLote, etc.)
      propiedadId: i.propiedadId,
      esPrioritaria: i.esPrioritaria || idx === 0,
      nombre:
        i.nombre ||
        i.parqueIndustrialNombre ||
        i.parqueIndustrial?.nombre ||
        i.propiedad?.parqueIndustrial?.nombre ||
        i.propiedad?.zona?.nombre ||
        '',
      costoObraM2: i.costoObraM2 || 350,
      fosAplicado: i.fosAplicado || 0.6,
      orden: i.orden || idx + 1,
      esFinanciado: i.esFinanciado ?? true,
      porcentajeAnticipo: i.porcentajeAnticipo ?? 30,
      cantidadCuotas: i.cantidadCuotas ?? 24,
      mesesObra: i.mesesObra ?? 8,
      esPreventa: i.esPreventa ?? i.propiedad?.esPreventa ?? false,
      fechaEstimadaEntrega:
        i.fechaEstimadaEntrega ?? i.propiedad?.fechaEstimadaEntrega ?? null,
    })) || []
  );

  // 2. Re-sincronización asíncrona de nombres de parques desde la BBDD
  useEffect(() => {
    if (propiedadesBD.length === 0 || parquesBD.length === 0) return;

    setItemsSeleccionados((itemsPrev) =>
      itemsPrev.map((item) => {
        const propReal = propiedadesBD.find((p) => p.id === item.propiedadId);
        const parqueId = propReal?.parqueIndustrialId || propReal?.parqueIndustrial?.id;

        if (parqueId) {
          const parqueEncontrado = parquesBD.find((park) => Number(park.id) === Number(parqueId));
          if (parqueEncontrado?.nombre) {
            return {
              ...item,
              nombre: parqueEncontrado.nombre,
              notaLogistica:
                item.notaLogistica ||
                parqueEncontrado.conectividad ||
                parqueEncontrado.direccionAcceso ||
                '',
            };
          }
        }
        return item;
      })
    );
  }, [propiedadesBD, parquesBD]);

  // 3. Agregar o quitar propiedades del catálogo
  const togglePropiedad = (prop: PropiedadSimple) => {
    const existe = itemsSeleccionados.some((i) => i.propiedadId === prop.id);
    if (existe) {
      setItemsSeleccionados(
        itemsSeleccionados
          .filter((i) => i.propiedadId !== prop.id)
          .map((it, idx) => ({ ...it, orden: idx + 1 }))
      );
    } else {
      const supLote = Number(prop.superficieTotal || prop.superficieCubierta || 0);
      const precioTotal = Number(prop.precio || 0);
      const fosBase = 0.6;

      const nuevoItem: ItemForm = {
        propiedadId: prop.id,
        esPrioritaria: itemsSeleccionados.length === 0,
        notaLogistica:
          prop.parqueIndustrial?.conectividad || prop.parqueIndustrial?.direccionAcceso || '',
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
        esPreventa: prop.esPreventa ?? false,
        fechaEstimadaEntrega: prop.fechaEstimadaEntrega ?? null,
      };
      setItemsSeleccionados([...itemsSeleccionados, nuevoItem]);
    }
  };

  // 4. Cálculo de métricas financieras por ítem
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