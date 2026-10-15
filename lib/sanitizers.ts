import type { Zona, Propiedad } from '@prisma-client';
import type { ZonaServer, PropiedadServer } from '@/types/server-data';
import { PropuestaComercialEntity, PropuestaItemEntity, PropuestaPayload } from '@/features/propuestas/types/propuesta.types';

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

/**
 * Sanitiza la propuesta completa recibida desde Prisma convirtiendo
 * los ítems y transformando el 'payloadJson' (JsonValue) al tipo de dominio 'PropuestaPayload'.
 */
export function sanearPropuestaComercial(propuestaRaw: any): PropuestaComercialEntity {
  const itemsSaneados = sanearItemsPropuesta(propuestaRaw.items);

  let payloadParsed: PropuestaPayload = null;
  if (propuestaRaw.payloadJson && typeof propuestaRaw.payloadJson === 'object') {
    payloadParsed = propuestaRaw.payloadJson as PropuestaPayload;
  }

  return {
    id: String(propuestaRaw.id),
    clienteNombre: String(propuestaRaw.clienteNombre || ''),
    clienteEmpresa: propuestaRaw.clienteEmpresa ? String(propuestaRaw.clienteEmpresa) : null,
    slug: String(propuestaRaw.slug || ''),
    tipo: propuestaRaw.tipo,
    puntoInteresNombre: propuestaRaw.puntoInteresNombre ? String(propuestaRaw.puntoInteresNombre) : null,
    puntoInteresLat: propuestaRaw.puntoInteresLat ? Number(propuestaRaw.puntoInteresLat) : null,
    puntoInteresLng: propuestaRaw.puntoInteresLng ? Number(propuestaRaw.puntoInteresLng) : null,
    payloadJson: payloadParsed,
    createdAt: new Date(propuestaRaw.createdAt),
    updatedAt: new Date(propuestaRaw.updatedAt),
    items: itemsSaneados,
  };
}


/**
 * Sanea los ítems de propuesta devueltos por Prisma convirtiendo los tipos Decimal a number
 */
export function sanearItemsPropuesta(itemsRaw: any[]): PropuestaItemEntity[] {
  if (!Array.isArray(itemsRaw)) return [];

  return itemsRaw.map((item) => {
    const p = item.propiedad;

    return {
      id: String(item.id),
      propuestaId: String(item.propuestaId),
      propiedadId: Number(item.propiedadId),
      esPrioritaria: Boolean(item.esPrioritaria),
      notaLogistica: item.notaLogistica || null,
      tiempoEstimadoString: item.tiempoEstimadoString || null,
      nombre: item.nombre || item.parqueIndustrialNombre || item.parqueIndustrial?.nombre || p?.parqueIndustrial?.nombre || p?.zona?.nombre || p?.titulo || null,      costoTierraCustom: item.costoTierraCustom ? Number(item.costoTierraCustom) : null,
      costoObraM2: item.costoObraM2 ? Number(item.costoObraM2) : null,
      supNaveProyectada: item.supNaveProyectada ? Number(item.supNaveProyectada) : null,
      alquilerM2Estimado: item.alquilerM2Estimado ? Number(item.alquilerM2Estimado) : null,
      anticipoCash: item.anticipoCash ? Number(item.anticipoCash) : null,
      cuotasTexto: item.cuotasTexto || null,
      fosAplicado: item.fosAplicado ? Number(item.fosAplicado) : 0.6,
      orden: Number(item.orden || 0),
      esFinanciado: Boolean(item.esFinanciado ?? false),
      porcentajeAnticipo: item.porcentajeAnticipo ?? 0,
      cantidadCuotas: item.cantidadCuotas ?? 0,
      mesesObra: item.mesesObra !== null && item.mesesObra !== undefined ? Number(item.mesesObra) : 0,
      ofertaContadoUSD: item.ofertaContadoUSD ?? null,
      propiedad: {
        id: Number(p.id),
        codigo: String(p.codigo || ''),
        titulo: String(p.titulo || ''),
        slug: String(p.slug || ''),
        precio: p.precio ? Number(p.precio) : 0,
        moneda: String(p.moneda || 'USD'),
        financiacion: String(p.financiacion || ''),
        superficieTotal: p.superficieTotal ? Number(p.superficieTotal) : null,
        superficieCubierta: p.superficieCubierta ? Number(p.superficieCubierta) : null,
        latitud: p.latitud ? Number(p.latitud) : null,
        longitud: p.longitud ? Number(p.longitud) : null,
        descripcion: p.descripcion || null,
        zona: p.zona ? { id: Number(p.zona.id), nombre: String(p.zona.nombre) } : null,
        imagenes: (p.imagenes || []).map((img: any) => ({
          id: Number(img.id),
          url: String(img.url),
        })),
      },
    };
  });
}


export function sanearParaServer<T>(objeto: T): T {
  if (!objeto) return objeto;
  return JSON.parse(JSON.stringify(objeto));
}
