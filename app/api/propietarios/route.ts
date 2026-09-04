import { NextResponse } from 'next/server';
import { prisma } from '@/backend/db';
import { sanearParaServer } from '@/lib/sanitizers';

export const revalidate = 0;

export async function GET() {
  try {
    // 1. Obtener propietarios con sus propiedades
    const propietarios = await prisma.propietario.findMany({
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
      orderBy: { nombre: 'asc' },
    });

    // 2. Obtener propiedades libres/desconocidas (sin propietario ni colega)
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
      propietarios: sanearParaServer(propietarios),
      propiedadesLibres: sanearParaServer(propiedadesLibres),
    });
  } catch (error) {
    console.error('Error fetching propietarios admin:', error);
    return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 });
  }
}