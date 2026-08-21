import { prisma } from '@/backend/db';
import { sanearParaServer } from '@/lib/sanitizers';
import { PropietarioFullData } from '@/types/server-data';

export async function getPropietarioById(id: string) {
  const propietario = await prisma.propietario.findUnique({
   where: { id: Number(id) },
  include: {
    propiedades: {
      select: {
        id: true,
        codigo: true,
        titulo: true,
        slug: true,
        precio: true,
        moneda: true,
        isPublished: true,
      }
    }
  }
  });
  if (!propietario) return null;

  return sanearParaServer(propietario) as unknown as PropietarioFullData;
}
