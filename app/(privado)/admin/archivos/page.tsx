// app/(privado)/admin/archivos/page.tsx
import { prisma } from '@/backend/db';
import { ArchivosClient } from './archivos-client';
import { sanearPropiedad } from '@/lib/sanitizers';

export const dynamic = 'force-dynamic';

interface ArchivosPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ArchivosPage({ searchParams }: ArchivosPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 20; // 👈 20 propiedades por página para mantener la velocidad

  const [propiedadesRaw, totalPropiedades] = await Promise.all([
    prisma.propiedad.findMany({
      take: pageSize,
      skip: (page - 1) * pageSize,
      select: {
        id: true,
        titulo: true,
        categoria: true,
        precio: true,
        moneda: true,
        superficieTotal: true,
        superficieCubierta: true,
        pdfUrl: true,
        direccionPersonalizada: true,
        descripcion: true, 
        caracteristicas: true,
        zona: {
          select: {
            nombre: true,
            padre: {
              select: {
                nombre: true,
                padre: { select: { nombre: true } }
              }
            }
          }
        },
        tipoInmueble: { select: { nombre: true } },
        imagenes: {
          orderBy: { orden: 'asc' },
          select: { url: true }
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.propiedad.count()
  ]);

  const propiedades = propiedadesRaw.map((p) => sanearPropiedad(p));
  const totalPages = Math.ceil(totalPropiedades / pageSize);

  return (
    <ArchivosClient 
      propiedades={propiedades} 
      currentPage={page} 
      totalPages={totalPages} 
    />
  );
}