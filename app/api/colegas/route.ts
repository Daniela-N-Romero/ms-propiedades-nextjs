import { NextResponse } from 'next/server';
import { prisma } from '@/backend/db';
import { sanearParaServer } from '@/lib/sanitizers';

export const revalidate = 0;

export async function GET() {
  try {
    const colegas = await prisma.colega.findMany({
      include: {
        propiedades: {
          select: {
            id: true,
            codigo: true,
            titulo: true,
            slug: true,
            imagenes: {
              select: { url: true },
              take: 1,
              orderBy: { orden: 'asc' },
            },
          },
        },
      },
      orderBy: { inmobiliaria: 'asc' },
    });

    const propiedadesLibres = await prisma.propiedad.findMany({
      where: {
        propietarioId: null,
        colegaId: null,
      },
      select: {
        id: true,
        codigo: true,
        titulo: true,
        slug: true,
        imagenes: {
          select: { url: true },
          take: 1,
          orderBy: { orden: 'asc' },
        },
      },
      orderBy: { codigo: 'asc' },
    });

    return NextResponse.json({
      colegas: sanearParaServer(colegas),
      propiedadesLibres: sanearParaServer(propiedadesLibres),
    });
  } catch (error) {
    console.error('Error fetching colegas admin:', error);
    return NextResponse.json({ error: 'Error al obtener datos de colegas' }, { status: 500 });
  }
}