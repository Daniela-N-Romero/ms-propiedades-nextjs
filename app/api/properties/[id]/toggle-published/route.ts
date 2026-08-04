import { NextResponse } from 'next/server';
import { prisma } from '@/backend/db'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { isPublished } = await request.json();

    const updated = await prisma.propiedad.update({
      where: { id: Number(id) },
      data: { isPublished },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: 'Error al cambiar estado' }, { status: 500 });
  }
}