import type { Zona, Propiedad } from '@prisma-client';
import type { ZonaServer, PropiedadServer } from '@/types/server-data';

/**
 * Convierte campos de tipo Decimal (Prisma) a Number (JS) de forma segura.
 * Sirve para propiedades individuales o parciales (Cards, Listas, Mapas).
 */
export function sanearPropiedad(p: any) {
  if (!p) return null;

  return {
    ...p,
    precio: p.precio ? Number(p.precio) : 0,
    latitud: p.latitud ? Number(p.latitud) : null,
    longitud: p.longitud ? Number(p.longitud) : null,
    superficieTotal: p.superficieTotal ? Number(p.superficieTotal) : null,
    superficieCubierta: p.superficieCubierta ? Number(p.superficieCubierta) : null,
  };
}

/**
 * Sanear Zonas (evita errores con Decimal en lat/lng de zonas si las hay)
 */
export function sanearZona(zona: any) {
  if (!zona) return null;

  return {
    ...zona,
    latitud: zona.latitud ? Number(zona.latitud) : null,
    longitud: zona.longitud ? Number(zona.longitud) : null,
    padre: zona.padre ? sanearZona(zona.padre) : null,
  };
}

/**
 * Sanear objetos complejos con relaciones (para vistas de Detalle/Fichas)
 */
export function sanearPropiedadCompleta(prop: any) {
  if (!prop) return null;

  return {
    ...sanearPropiedad(prop),
    zona: prop.zona ? sanearZona(prop.zona) : null,
  };
}


export function sanearParaServer<T>(objeto: T): T {
  if (!objeto) return objeto;
  return JSON.parse(JSON.stringify(objeto));
}
