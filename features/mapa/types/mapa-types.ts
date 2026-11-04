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
  status?: string;
  agente?: {
    nombre: string;
    telefono?: string;
  } | null;
  // Campos opcionales para la vista del mapa privado
  origen?: string;
  propietarioId?: number | null;
  colegaId?: number | null;
  colegaInmobiliaria?: string | null;
  colegaTel?: string | null;
}

export interface PropiedadRawItem {
  id: number;
  codigo: string;
  slug: string;
  titulo: string;
  precio: number;
  moneda: string;
  latitud: number | null;
  longitud: number | null;
  status?: string;
  estado?: string;
  financiacion?: string;
  superficieTotal?: number | null;
  superficieCubierta?: number | null;
  origen?: string;
  propietarioId?: number | null;
  colegaId?: number | null;
  direccionPersonalizada?: string | null;

  // Relaciones de Prisma
  zona?: {
    nombre: string;
  } | null;
  imagenes?: Array<{
    url: string;
  }>;
  colega?: {
    inmobiliaria?: string | null;
    telefono?: string | null;
  } | null;
  agente?: {
    nombre: string;
    telefono?: string;
  } | null;
}