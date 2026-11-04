import type { PropiedadMapaItem, PropiedadRawItem } from '../types/mapa-types';

/**
 * Valida si un valor numérico es una coordenada válida y distinta de 0
 */
export function esCoordenadaValida(valor: unknown): boolean {
  if (valor === null || valor === undefined || valor === '') return false;
  const num = Number(valor);
  return !isNaN(num) && num !== 0;
}

/**
 * Transforma y sanitiza un array de propiedades crudas provenientes de Prisma
 * a la estructura requerida por el mapa, descartando registros sin geolocalización.
 */
export function toPropiedadesMapa(propiedadesRaw: PropiedadRawItem[], esAdmin = false): PropiedadMapaItem[] {
  if (!Array.isArray(propiedadesRaw)) return [];

  return propiedadesRaw
    .filter((p) => esCoordenadaValida(p.latitud) && esCoordenadaValida(p.longitud))
    .map((p) => {
      const item: PropiedadMapaItem = {
        id: p.id,
        codigo: p.codigo,
        slug: p.slug,
        titulo: p.titulo,
        precio: Number(p.precio) || 0,
        moneda: p.moneda || 'USD',
        status: p.status || p.estado || 'disponible',
        financiacion: p.financiacion || undefined,
        superficieTotal: p.superficieTotal ? Number(p.superficieTotal) : null,
        superficieCubierta: p.superficieCubierta ? Number(p.superficieCubierta) : null,
        latitud: Number(p.latitud),
        longitud: Number(p.longitud),
        imagenPortada: p.imagenes?.[0]?.url || '/images/placeholder.png',
        zonaNombre: esAdmin
          ? p.direccionPersonalizada || p.zona?.nombre || 'Zona no especificada'
          : p.zona?.nombre || 'Zona no especificada',
        agente: p.agente
          ? {
              nombre: p.agente.nombre,
              telefono: p.agente.telefono,
            }
          : undefined,
      };

      if (esAdmin) {
        item.origen = p.origen;
        item.propietarioId = p.propietarioId;
        item.colegaId = p.colegaId;
        item.colegaInmobiliaria = p.colega?.inmobiliaria;
        item.colegaTel = p.colega?.telefono;
      }

      return item;
    });
}