import { TipoPropuestaEnum } from '@/prisma/generated/client';

/**
 * PropiedadBase: Representa una propiedad devuelta por el backend. Todo lo que viene de la BBDD de inmuebles.
 * ItemForm: Es la estructura plana que manipulan React Hook Form o el Hook usePropuestaFormState. Todo lo que el usuario edita en la pantalla dentro de las tarjetitas.
 * PropuestaItemEntity: Es el ítem guardado/cargado de la propuesta (extiende de ItemForm). Es ItemForm + la PropiedadBase adjunta traída de la BBDD.
 * MetricaInversionItem: Es el resultado transformado por la InversionStrategy para mostrar las tarjetas con ROI. Son los números finales calculados por la matemática financiera.
 */

// ==========================================
// 1. RECOMENDACIONES Y PAYLOAD (JSON)
// ==========================================
export interface TarjetaRecomendacion {
  id: string;
  activa: boolean;
  titulo: string;
  opcionAsociadaId?: string;
  texto: string;
}

export interface RecomendacionesPayload {
  mostrarSeccion?: boolean;
  tituloGeneral?: string;
  tarjetas?: TarjetaRecomendacion[];
}

export interface PropuestaPayload {
  costoObraMercadoM2?: number;
  costoObraPreferencialM2?: number;
  tieneTarifaPreferencial?: boolean;
  recomendaciones?: RecomendacionesPayload;
  [key: string]: unknown;
}

// ==========================================
// 2. DOMINIO / BBDD (Propiedades y Parques)
// ==========================================
export interface ParqueIndustrialEntity {
  id: number;
  nombre: string;
  slug: string;
  direccionAcceso?: string | null;
  conectividad?: string | null;
  alquilerM2Referencial?: number | null;
  precioTierraM2Ref?: number | null;
  latitud?: number | null;
  longitud?: number | null;
  zonaId?: number | null;
  esPreventa?: boolean;
  fechaEstimadaEntrega?: Date | string | null;
}

export interface PropiedadBase {
  id: number;
  codigo: string;
  titulo: string;
  slug: string;
  precio: number;
  moneda: string;
  financiacion?: string | null;
  superficieTotal?: number | null;
  superficieCubierta?: number | null;
  latitud?: number | null;
  longitud?: number | null;
  descripcion?: string | null;
  zonaId?: number | null;
  zona?: { id: number; nombre: string } | null;
  parqueIndustrialId?: number | null;
  parqueIndustrial?: { id: number; nombre: string; direccionAcceso?: string | null; conectividad?: string | null } | null;
  imagenes?: { id: number; url: string }[];
  esPreventa?: boolean;
  fechaEstimadaEntrega?: Date | string | null;
}

// Para usar en el catálogo de búsqueda (alias más limpio)
export type PropiedadSimple = PropiedadBase;

// ==========================================
// 3. FORMULARIO DE EDICIÓN / ESTADO
// ==========================================
export interface ItemForm {
  propiedadId: number;
  esPrioritaria: boolean;
  orden: number;
  nombre: string;
  notaLogistica?: string | null;
  notaEspecial?: string | null;
  tiempoEstimadoString?: string | null;

  // Parámetros de Inversión y Obra
  costoTierraCustom: number;
  costoObraM2: number;
  supNaveProyectada: number;
  alquilerM2Estimado: number;
  fosAplicado: number;

  // Esquema de Financiación / Compra
  esFinanciado: boolean;
  porcentajeAnticipo: number;
  cantidadCuotas: number;
  mesesObra: number;
  anticipoCash?: number | null;
  cuotasTexto?: string | null;
  ofertaContadoUSD?: number | null;

  // Atributos de Preventa
  esPreventa?: boolean;
  fechaEstimadaEntrega?: Date | string | null;
  mesesEntrega?: number;
}

// ==========================================
// 4. ENTIDAD COMPLETA DE PROPUESTA (Prisma + Relaciones)
// ==========================================
export interface PropuestaItemEntity extends ItemForm {
  id: string;
  propuestaId: string;
  propiedad: PropiedadBase;
  parqueIndustrial?: ParqueIndustrialEntity | null;
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
  createdAt: Date | string;
  updatedAt: Date | string;
  items: PropuestaItemEntity[];
}

// ==========================================
// 5. MÉTIRICAS CALCULADAS (Estrategias de Inversión)
// ==========================================
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
  esPreventa: boolean;
  fechaEstimadaEntrega: string | null; 
  mesesEntrega: number;
}

export interface MetricasInversionResult {
  costoObraMercado: number;
  costoObraPreferencial: number | null;
  tieneAhorroPreferencial: boolean;
  ahorroTotalAcumuladoUSD: number;
  comparativa: MetricaInversionItem[];
  maxRoi: number;
}