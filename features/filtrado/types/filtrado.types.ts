/**
 * Representa el conjunto completo de criterios de búsqueda seleccionables.
 * Se utiliza tanto para el estado local en memoria como para representar los searchParams.
 */
export interface FiltrosState {
  categoria?: string;
  subtipo?: string[]; /** Lista de slugs de subtipos seleccionados (ej: ['nave-industrial', 'lote']) */
  localidad?: number[]; /** Lista de IDs numéricos de localidades seleccionadas (ej: [20, 21]) */
  moneda?: string;
  precioMin?: number;
  precioMax?: number;
  supMin?: number;
  supMax?: number;
  supCubMin?: number;
  supCubMax?: number;
  orden?: string;
}

/**
 * Opción de subtipo de inmueble proveniente de la base de datos
 */
export interface SubtipoOption {
  id: number;
  nombre: string;
  slug: string;
}

/**
 * Opción de localidad/zona geográfica proveniente de la base de datos
 */
export interface LocalidadOption {
  id: number;
  nombre: string;
}

/**
 * Propiedades recibidas por el contenedor principal de filtros
 */
export interface PanelFiltrosProps {
  localidades: LocalidadOption[];
  subtipos: SubtipoOption[];
  esMapa?: boolean;   /** Indica si el panel se está renderizando dentro de la vista de mapa */
}