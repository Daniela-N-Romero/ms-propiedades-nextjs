import { NextResponse } from 'next/server';
import { prisma } from '@/backend/db';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const resolvedParams = await params; 
    const id = Number(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json();
    const { isUnlisted } = body;

    const updated = await prisma.propiedad.update({
      where: { id },
      data: { isUnlisted },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error al actualizar visibilidad:', error);
    return NextResponse.json(
      { error: 'Error al cambiar visibilidad' },
      { status: 500 }
    );
  }
}