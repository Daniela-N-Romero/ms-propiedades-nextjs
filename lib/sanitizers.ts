import type { Zona, Propiedad } from '@prisma-client';
import type { ZonaServer, PropiedadServer } from '@/types/server-data';

// Saneador de Zonas (incluyendo padres/hijos si vienen en el include)
export function sanearZona(zona: Zona & { padre?: Zona | null }): ZonaServer {
  return {
    ...zona,
    latitud: zona.latitud ? Number(zona.latitud) : null,
    longitud: zona.longitud ? Number(zona.longitud) : null,
    padre: zona.padre ? sanearZona(zona.padre) : null,
  };
}

// Saneador de Propiedades
export function sanearPropiedad(propiedad: Propiedad): PropiedadServer {
  return {
    ...propiedad,
    precio: Number(propiedad.precio),
    superficieTotal: propiedad.superficieTotal ? Number(propiedad.superficieTotal) : null,
    superficieCubierta: propiedad.superficieCubierta ? Number(propiedad.superficieCubierta) : null,
    latitud: propiedad.latitud ? Number(propiedad.latitud) : null,
    longitud: propiedad.longitud ? Number(propiedad.longitud) : null,
  };
}

// Saneador de Propiedad Completa con Relaciones
export function sanearPropiedadCompleta(prop: any): any {
  return {
    ...sanearPropiedad(prop),
    zona: prop.zona ? sanearZona(prop.zona) : null,
    tipoInmueble: prop.tipoInmueble || null,
    agente: prop.agente || null,
    propietario: prop.propietario || null,
    colega: prop.colega || null,
    imagenes: prop.imagenes || [],
  };
}

export function sanearParaServer<T>(objeto: T): T {
  if (!objeto) return objeto;
  return JSON.parse(JSON.stringify(objeto));
}
