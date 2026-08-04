import type { Zona, Propiedad, TipoInmueble, Agente, Propietario, Colega, Imagen } from '@prisma-client';

// 1. ZONA SANEADA
export type ZonaServer = Omit<Zona, 'latitud' | 'longitud'> & {
  latitud: number | null;
  longitud: number | null;
  padre?: ZonaServer | null;
  hijas?: ZonaServer[];
};

// 2. PROPIEDAD SANEADA
export type PropiedadServer = Omit<
  Propiedad,
  'precio' | 'superficieTotal' | 'superficieCubierta' | 'latitud' | 'longitud'
> & {
  precio: number;
  superficieTotal: number | null;
  superficieCubierta: number | null;
  latitud: number | null;
  longitud: number | null;
};

// 3. PROPIEDAD COMPLETA (CON RELACIONES)
export type PropertyFullData = PropiedadServer & {
  zona: ZonaServer;
  tipoInmueble: TipoInmueble & { padre?: TipoInmueble | null };
  agente: Agente;
  propietario?: Propietario | null;
  colega?: Colega | null;
  imagenes: Imagen[];
};


