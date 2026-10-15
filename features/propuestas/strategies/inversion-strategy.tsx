import React from 'react';
import { TipoPropuestaEnum } from '@/prisma/generated/client';
import { PropuestaStrategy } from './propuesta-strategy.interface';
import {
  PropuestaComercialEntity,
  PropuestaItemEntity,
  MetricaInversionItem,
  MetricasInversionResult,
  PropuestaPayload,
} from '../types/propuesta.types';
import { PropuestaInversionView } from '../views/propuesta-inversion-view';

export class InversionStrategy implements PropuestaStrategy<MetricasInversionResult> {
type = TipoPropuestaEnum.INVERSION_DESARROLLO;

  calcularMetricas(items: PropuestaItemEntity[], payloadData?: PropuestaPayload | null): MetricasInversionResult {
    const costoObraMercado = Number(payloadData?.costoObraMercadoM2 ?? 400);
    const costoObraPreferencial = payloadData?.costoObraPreferencialM2
      ? Number(payloadData.costoObraPreferencialM2)
      : null;

    const tieneAhorroPreferencial =
      Boolean(payloadData?.tieneTarifaPreferencial) &&
      costoObraPreferencial !== null &&
      costoObraPreferencial < costoObraMercado;

    let ahorroTotalAcumuladoUSD = 0;

    const comparativa: MetricaInversionItem[] = items.map((item) => {
      const p = item.propiedad;

      // 🔑 Prioridad absoluta al texto neutro 'nombre' editado en el form
      const nombreOpcion =
        item.nombre?.trim() ||
        (item as any).parqueIndustrialNombre?.trim() ||
        item.parqueIndustrial?.nombre ||
        p.parqueIndustrial?.nombre ||
        p.zona?.nombre ||
        p.titulo;

      const supLote = Number(p.superficieTotal ?? 0);
      const fos = item.fosAplicado ?? 0.6;
      const supNave =
        item.supNaveProyectada ?? (supLote > 0 ? Math.round(supLote * fos) : Number(p.superficieCubierta ?? 0));

      const costoTierra =
        item.costoTierraCustom !== null && item.costoTierraCustom !== undefined
          ? Number(item.costoTierraCustom)
          : Number(p.precio ?? 0);

      const tarifaObraM2Aplicada =
        item.costoObraM2 ?? (tieneAhorroPreferencial && costoObraPreferencial ? costoObraPreferencial : costoObraMercado);

      const costoObraTotal = supNave * tarifaObraM2Aplicada;
      const inversionTotal = costoTierra + costoObraTotal;

      const ahorroObraUSD =
        tieneAhorroPreferencial && costoObraPreferencial
          ? supNave * (costoObraMercado - costoObraPreferencial)
          : 0;

      ahorroTotalAcumuladoUSD += ahorroObraUSD;

      const alquilerM2 = item.alquilerM2Estimado ?? 5.0;
      const ingresoMensualTotal = supNave * alquilerM2;
      const ingresoAnualTotal = ingresoMensualTotal * 12;
      const roiAnual = inversionTotal > 0 ? (ingresoAnualTotal / inversionTotal) * 100 : 0;

      // 🔑 Cálculo de Desembolso y Flujo de Fondos ("El lote se paga solo")
      const esFinanciado = item.esFinanciado === true; 

      const porcentajeAnticipo = Number(item.porcentajeAnticipo ?? 0);
      const cantidadCuotas = Number(item.cantidadCuotas ?? 0);
      const mesesObra = Number(item.mesesObra ?? 0);

      // Si es financiado, calcula el anticipo; si es al contado, el desembolso en tierra es el 100%
     const anticipoLoteUSD = esFinanciado ? (costoTierra * porcentajeAnticipo) / 100 : costoTierra;
      const desembolsoInicialRequeridoUSD = anticipoLoteUSD + costoObraTotal;

      const saldoFinanciadoUSD = costoTierra - anticipoLoteUSD;
      // Evitamos división por 0
      const cuotaMensualLoteUSD = esFinanciado && cantidadCuotas > 0 ? saldoFinanciadoUSD / cantidadCuotas : 0;

      const resultadoNetoMensualUSD = ingresoMensualTotal - cuotaMensualLoteUSD;
      const mesesRentaActiva = Math.max(cantidadCuotas - mesesObra, 0);
      const ahorroTotalRentaUSD = ingresoMensualTotal * mesesRentaActiva;
      const costoNetoFinalActivoUSD = inversionTotal - ahorroTotalRentaUSD;

      return {
        id: item.id,
        nombre: nombreOpcion,
        ubicacionDescripcion: item.notaLogistica || item.parqueIndustrial?.conectividad || p.parqueIndustrial?.conectividad || '',
        localidad: p.zona?.nombre ?? 'Corredor Industrial',
        supLote,
        supNave,
        costoTierra,
        costoObraM2: tarifaObraM2Aplicada,
        costoObraTotal,
        ahorroObraUSD,
        inversionTotal,
        alquilerM2,
        ingresoMensualTotal,
        ingresoAnualTotal,
        roiAnual: Number(roiAnual.toFixed(2)),
        anticipoCash: item.anticipoCash ?? anticipoLoteUSD,
        cuotasTexto: item.cuotasTexto || p.financiacion || '',
        moneda: p.moneda ?? 'USD',

        // 🔑 Retorno de las variables calculadas de desembolso
        esFinanciado,
        porcentajeAnticipo,
        cantidadCuotas,
        mesesObra,
        desembolsoInicialRequeridoUSD: Number(desembolsoInicialRequeridoUSD.toFixed(0)),
        cuotaMensualLoteUSD: Number(cuotaMensualLoteUSD.toFixed(0)),
        resultadoNetoMensualUSD: Number(resultadoNetoMensualUSD.toFixed(0)),
        costoNetoFinalActivoUSD: Number(costoNetoFinalActivoUSD.toFixed(0)),
        ahorroTotalRentaUSD: Number(ahorroTotalRentaUSD.toFixed(0)),
        ofertaContadoUSD: item.ofertaContadoUSD ? Number(item.ofertaContadoUSD) : undefined,
      };
    });

    return {
      costoObraMercado,
      costoObraPreferencial,
      tieneAhorroPreferencial,
      ahorroTotalAcumuladoUSD,
      comparativa,
      maxRoi: comparativa.length > 0 ? Math.max(...comparativa.map((c) => c.roiAnual)) : 0,
    };
  }

  renderView({ propuesta, metricas }: { propuesta: PropuestaComercialEntity; metricas: MetricasInversionResult }) {
    return <PropuestaInversionView propuesta={propuesta} metricas={metricas} />;
  }
}