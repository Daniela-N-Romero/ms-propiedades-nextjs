// app/api/properties/[id]/toggle-meta-ad/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/backend/db';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = Number(id);

    if (!propertyId || isNaN(propertyId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json();
    const { permitMetaAd } = body;

    const updated = await prisma.propiedad.update({
      where: { id: propertyId },
      data: {
        permitMetaAd: Boolean(permitMetaAd),
      },
    });

    return NextResponse.json({ success: true, permitMetaAd: updated.permitMetaAd });
  } catch (error) {
    console.error('Error al cambiar permiso de Meta:', error);
    return NextResponse.json(
      { error: 'Error interno al actualizar Meta Ads' },
      { status: 500 }
    );
  }
}