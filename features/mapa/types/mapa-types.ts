export interface PropietarioMapaItem {
  id: number;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  email?: string;
}

export interface ColegaMapaItem {
  id: number;
  nombre?: string;
  apellido?: string;
  inmobiliaria?: string;
  telefono?: string;
  email?: string;
}

export interface PropiedadMapaItem {
  id: number;
  codigo: string;
  slug: string;
  titulo: string;
  precio: number;
  financiacion?: string;
  superficieTotal: number | null;
  superficieCubierta: number | null;
  moneda: string;
  latitud: number;
  longitud: number;
  imagenPortada?: string;
  zonaNombre: string;
  // Campos opcionales para la vista del mapa privado
  origen?: string;
  propietarioId?: number | null;
  colegaId?: number | null;
  colegaInmobiliaria?: string | null;
  colegaTel?: string | null;
}
