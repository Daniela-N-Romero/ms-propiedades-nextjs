import { PropuestaComercialEntity, PropuestaItemEntity, PropuestaPayload } from "../types/propuesta.types";
import { serializarPrisma } from '@/lib/sanitizers'

/**-----------------------------------------------------------------------------------------
 * 
 * Sanea los ítems de propuesta automáticamente.
 * Cualquier campo nuevo agregado a Prisma pasará SOLO sin necesidad de agregarlo acá.
 * 
 */

export function sanearItemsPropuesta(itemsRaw: any[]): PropuestaItemEntity[] {
  if (!Array.isArray(itemsRaw)) return [];

  return itemsRaw.map((itemRaw) => {
    // Convertimos automáticamente todos los Decimals/Dates de Prisma a numbers/strings
    const item = serializarPrisma(itemRaw);
    const p = item.propiedad || {};

    // Retornamos todo el objeto y SOLO sobreescribimos los campos con lógica de fallback especial
    return {
      ...item,

      // Fallback inteligente de Jerarquía de Nombre (Parque -> Zona -> Título)
      nombre:
        item.nombre || item.parqueIndustrialNombre || item.parqueIndustrial?.nombre ||
        p.parqueIndustrial?.nombre || p.zona?.nombre || p.titulo || null,

        // Garantizamos fallbacks numéricos para la estrategia de inversión
      fosAplicado: item.fosAplicado ?? 0.6,
      orden: item.orden ?? 0,
      porcentajeAnticipo: item.porcentajeAnticipo ?? 0,
      cantidadCuotas: item.cantidadCuotas ?? 0,
      mesesObra: item.mesesObra ?? 0,
      esFinanciado: Boolean(item.esFinanciado ?? false),

      // Objeto propiedad limpio
      propiedad: {
        ...p,
        precio: p.precio ?? 0,
        zona: p.zona ? { id: Number(p.zona.id), nombre: String(p.zona.nombre) } : null,
        imagenes: Array.isArray(p.imagenes) ? p.imagenes : [],
      },
    };
  });
}



/**-------------------------------------------------------------------
 * 
 * Sanitiza la propuesta completa recibida desde Prisma
 * 
 */

export function sanearPropuestaComercial(propuestaRaw: any): PropuestaComercialEntity {
  if (!propuestaRaw) return null as any;

  const propuestaLimpia = serializarPrisma(propuestaRaw);

  return {
    ...propuestaLimpia,
    items: sanearItemsPropuesta(propuestaRaw.items),
    payloadJson: (propuestaLimpia.payloadJson as PropuestaPayload) || null,
  };
}