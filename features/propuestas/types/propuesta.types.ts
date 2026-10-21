import { TipoPropuestaEnum } from '@/prisma/generated/client';



export interface TarjetaRecomendacion {
  id: string;
  activa: boolean;
  titulo: string;
  opcionAsociadaId?: string; // ID o nombre de la opción vinculada (ej: "propiedadId" o "nombre")
  texto: string;
}

export interface PropuestaPayload {
  costoObraMercadoM2?: number;
  costoObraPreferencialM2?: number;
  tieneTarifaPreferencial?: boolean;
  recomendaciones?: RecomendacionesPayload;
  [key: string]: unknown;
}

export interface RecomendacionesPayload {
  mostrarSeccion?: boolean;
  tituloGeneral?: string;
  tarjetas?: TarjetaRecomendacion[];
}

export interface ParqueIndustrialEntity {
  id: number;
  nombre: string;
  slug: string;
  direccionAcceso?: string | null;
  conectividad?: string | null;
  alquilerM2Referencial?: number | null;
  precioTierraM2Ref?: number | null;
  latitud?: number | string | null;
  longitud?: number | string | null;
  zonaId?: number | null;
}

export interface PropiedadEntity {
  id: number;
  codigo: string;
  titulo: string;
  slug: string;
  precio: number | string;
  moneda: string;
  financiacion?: string | null;
  superficieTotal?: number | string | null;
  superficieCubierta?: number | string | null;
  latitud?: number | string | null;
  longitud?: number | string | null;
  descripcion?: string | null;
  zona?: { id: number; nombre: string } | null;
  parqueIndustrial?: { id: number; nombre: string; direccionAcceso?: string | null; conectividad?: string | null } | null;
  imagenes?: { id: number; url: string }[];
}

export interface PropuestaItemEntity {
  id: string;
  propuestaId: string;
  propiedadId: number;
  esPrioritaria: boolean;
  notaLogistica?: string | null;
  tiempoEstimadoString?: string | null;
  financiacion?: string | null;
  nombre?: string | null;
  parqueIndustrialId?: number | null;
  parqueIndustrial?: ParqueIndustrialEntity | null;
  costoTierraCustom?: number | null;
  costoObraM2?: number | null;
  supNaveProyectada?: number | null;
  alquilerM2Estimado?: number | null;
  anticipoCash?: number | null;
  cuotasTexto?: string | null;
  fosAplicado?: number | null;
  orden: number;
  propiedad: PropiedadEntity;
  esFinanciado?: boolean | null;
  porcentajeAnticipo?: number | null;
  cantidadCuotas?: number | null;
  mesesObra?: number | null;
  ofertaContadoUSD?: number | null;
  notaEspecial: string | null;
}

export interface PropuestaComercialEntity {
  id: string;
  clienteNombre: string;
  clienteEmpresa?: string | null;
  slug: string;
  tipo: TipoPropuestaEnum;
  puntoInteresNombre?: string | null;
  puntoInteresLat?: number | null;
  puntoInteresLng?: number | null;
  payloadJson?: PropuestaPayload | null;
  createdAt: Date;
  updatedAt: Date;
  items: PropuestaItemEntity[];
}

export interface MetricaInversionItem {
  id: string;
  nombre: string;
  ubicacionDescripcion: string;
  localidad: string;
  supLote: number;
  supNave: number;
  costoTierra: number;
  costoObraM2: number;
  costoObraTotal: number;
  ahorroObraUSD: number;
  inversionTotal: number;
  alquilerM2: number;
  ingresoMensualTotal: number;
  ingresoAnualTotal: number;
  roiAnual: number;
  anticipoCash: number;
  cuotasTexto: string;
  moneda: string;
  esFinanciado: boolean;
  porcentajeAnticipo: number;
  cantidadCuotas: number;
  mesesObra: number;
  notaEspecial: string | null;
  desembolsoInicialRequeridoUSD: number;
  cuotaMensualLoteUSD: number;
  resultadoNetoMensualUSD: number;
  costoNetoFinalActivoUSD: number;
  ahorroTotalRentaUSD: number;
  ofertaContadoUSD?: number;
}

export interface MetricasInversionResult {
  costoObraMercado: number;
  costoObraPreferencial: number | null;
  tieneAhorroPreferencial: boolean;
  ahorroTotalAcumuladoUSD: number;
  comparativa: MetricaInversionItem[];
  maxRoi: number;
}

export interface PropiedadSimple {
  id: number;
  codigo: string;
  titulo: string;
  precio: number | string;
  moneda: string;
  financiacion?: string | null;
  superficieTotal?: number | string | null;
  superficieCubierta?: number | string | null;
  zona?: { id: number; nombre: string };
  parqueIndustrialId: number | null;
  parqueIndustrial?: { id: number; nombre: string; direccionAcceso?: string | null; conectividad?: string | null } | null;
  descripcion?: string | null;
}

export interface ItemForm {
  propiedadId: number;
  esPrioritaria: boolean;
  notaLogistica: string;
  notaEspecial: string | null;
  tiempoEstimadoString: string;
  nombre: string;
  costoTierraCustom: number;
  costoObraM2: number;
  supNaveProyectada: number;
  alquilerM2Estimado: number;
  anticipoCash: number | null;
  cuotasTexto: string;
  fosAplicado: number;
  orden: number;
  esFinanciado?: boolean;
  porcentajeAnticipo?: number;
  cantidadCuotas?: number;
  mesesObra?: number;
  ofertaContadoUSD?: number;
}

