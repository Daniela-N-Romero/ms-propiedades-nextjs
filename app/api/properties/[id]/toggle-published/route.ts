import { NextResponse } from 'next/server';
import { prisma } from '@/backend/db';
import { publishPropertySchema } from '@/features/admin/form/schemas/property-schema';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    const body = await req.json();
    const { isPublished } = body;

    // Si la quieren pasar a "Publicada", verificamos que no sea un borrador incompleto
    if (isPublished) {
      const propiedad = await prisma.propiedad.findUnique({
        where: { id },
        include: { imagenes: true },
      });

      if (!propiedad) {
        return NextResponse.json(
          { error: 'La propiedad no existe.' },
          { status: 404 }
        );
      }

      // Estructuramos el objeto para validarlo con el schema de publicación
      const datosAValidar = {
        ...propiedad,
        precio: Number(propiedad.precio),
        superficieTotal: propiedad.superficieTotal ? Number(propiedad.superficieTotal) : null,
        superficieCubierta: propiedad.superficieCubierta ? Number(propiedad.superficieCubierta) : null,
        latitud: Number(propiedad.latitud),
        longitud: Number(propiedad.longitud),
        imagenes: propiedad.imagenes.map((img) => img.url),
      };

      const result = publishPropertySchema.safeParse(datosAValidar);

      if (!result.success) {
        // Retornamos error con la lista de datos faltantes
        const faltantes = Object.keys(result.error.flatten().fieldErrors).join(', ');
        return NextResponse.json(
          {
            error: `No se puede publicar: la propiedad está incompleta. Campos faltantes u observados: [${faltantes}]. Por favor, edítela para completarla.`,
          },
          { status: 400 }
        );
      }
    }

    // Si pasa la validación (o si la están pasando a Borrador), actualizamos el estado
    const updated = await prisma.propiedad.update({
      where: { id },
      data: { isPublished },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error al cambiar el estado de publicación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al actualizar la propiedad' },
      { status: 500 }
    );
  }
}