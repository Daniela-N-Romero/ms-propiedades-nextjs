import { ReactNode } from 'react';
import { PropuestaComercialEntity, PropuestaItemEntity } from '../types/propuesta.types';
import { TipoPropuestaEnum } from '@/prisma/generated/client';

export interface PropuestaStrategy<TResult = unknown, TPayload = Record<string, unknown>> {
  type: TipoPropuestaEnum;

  // Recibe la lista de ítems fuertemente tipada y devuelve su tipo de resultado específico
  calcularMetricas(items: PropuestaItemEntity[], payloadData?: TPayload): TResult;

  // Renderiza la vista pasando la propuesta y sus métricas calculadas con tipos exactos
  renderView(props: { propuesta: PropuestaComercialEntity; metricas: TResult }): ReactNode;
}

