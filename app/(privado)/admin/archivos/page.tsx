import { prisma } from '@/backend/db';
import { ArchivosClient } from './archivos-client';
import { sanearPropiedadCompleta } from '@/lib/sanitizers';

export const dynamic = 'force-dynamic';

export default async function ArchivosPage() {
  const propiedadesRaw = await prisma.propiedad.findMany({
    select: {
      id: true,
      titulo: true,
      categoria: true,
      precio: true,
      moneda: true,
      superficieTotal: true,
      superficieCubierta: true,
      caracteristicas: true,
      pdfUrl: true,
      direccionPersonalizada: true,
      descripcion: true,
      deletedAt: true,
      zona: {
        select: { 
          nombre: true, 
          padre: { select: { nombre: true, padre: { select: { nombre: true } } } } 
        },
      },
      tipoInmueble: {
        select: { nombre: true },
      },
      imagenes: {
        take: 10,
        select: { url: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

const propiedades = propiedadesRaw.map((p) => sanearPropiedadCompleta(p));

  return <ArchivosClient propiedades={propiedades} />;
}