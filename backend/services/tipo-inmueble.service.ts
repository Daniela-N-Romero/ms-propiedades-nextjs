import { prisma } from '@/backend/db';
import { sanearParaServer} from '@/lib/sanitizers';

/**
 * Trae solo los Mercados Padre (ej. Industrial, Comercial, Residencial).
 * Útil para el select principal de "Mercado".
 */
export async function getMercadosPadre() {
  const mercados = await prisma.tipoInmueble.findMany({
    where: { padreId: null },
    orderBy: { nombre: 'asc' },
  });
  return sanearParaServer(mercados);
}

/**
 * Trae los subtipos según el mercado seleccionado.
 * @param padreId (Opcional) ID del tipo padre seleccionado en el primer select.
 * @param soloPublicados Si es true, filtra solo los que tienen propiedades activas (para la web). Si es false, trae todos (para el admin).
 */
export async function getSubtiposPorMercado(padreId?: number, soloPublicados: boolean = false) {
  const subtipos = await prisma.tipoInmueble.findMany({
    where: {
      padreId: padreId ? padreId : { not: null },
      ...(soloPublicados && { propiedades: { some: { isPublished: true } } }),
    },
    orderBy: { nombre: 'asc' },
  });
  return sanearParaServer(subtipos);
}