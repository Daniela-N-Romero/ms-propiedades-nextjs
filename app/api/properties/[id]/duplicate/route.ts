import { NextResponse } from 'next/server';
import { prisma } from '@/backend/db';
import { slugify, generarCodigoRef } from '@/lib/utils-formatting';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = Number(id);

    if (!propertyId || isNaN(propertyId)) {
      return NextResponse.json({ error: 'ID de propiedad inválido' }, { status: 400 });
    }

    // 1. Buscamos la propiedad original con sus imágenes asociadas
    const original = await prisma.propiedad.findUnique({
      where: { id: propertyId },
      include: {
        imagenes: true,
        tipoInmueble: true,
      },
    });

    if (!original) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
    }

    // 2. Preparamos el nuevo título y slug único
    const nuevoTitulo = `Copia de ${original.titulo}`;
    const baseSlug = slugify(nuevoTitulo);
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    // 3. Ejecutamos la clonación dentro de una transacción
    const duplicada = await prisma.$transaction(async (tx) => {
      // Duplicamos el registro principal
      const nuevaProp = await tx.propiedad.create({
        data: {
          codigo: 'TEMP', // Se actualiza a continuación con el helper
          titulo: nuevoTitulo,
          slug: uniqueSlug,
          direccionPersonalizada: original.direccionPersonalizada,
          superficieTotal: original.superficieTotal,
          superficieCubierta: original.superficieCubierta,
          origen: original.origen,
          categoria: original.categoria,
          precio: original.precio,
          moneda: original.moneda,
          financiacion: original.financiacion,
          descripcion: original.descripcion,
          videoUrl: original.videoUrl,
          pdfUrl: original.pdfUrl,
          latitud: original.latitud,
          longitud: original.longitud,
          isPublished: false, // Nace como borrador para revisión
          isUnlisted: original.isUnlisted,
          isDestacada: false,
          notasPrivadas: original.notasPrivadas,
          caracteristicas: original.caracteristicas ?? undefined,
          permitMetaAd: false, // Por seguridad no se incluye a Meta automáticamente
          imagenMetaUrl: original.imagenMetaUrl,
          tipoInmuebleId: original.tipoInmuebleId,
          zonaId: original.zonaId,
          propietarioId: original.propietarioId,
          colegaId: original.colegaId,
          agenteId: original.agenteId,
        },
      });

      // Generamos el nuevo código REF semántico con el nuevo ID
      const nuevoCodigo = generarCodigoRef({
        id: nuevaProp.id,
        type: original.tipoInmueble?.slug || 'propiedad',
      });

      const propActualizada = await tx.propiedad.update({
        where: { id: nuevaProp.id },
        data: { codigo: nuevoCodigo },
      });

      // Duplicamos las referencias de las imágenes
      if (original.imagenes && original.imagenes.length > 0) {
        await tx.imagen.createMany({
          data: original.imagenes.map((img) => ({
            url: img.url,
            orden: img.orden,
            propiedadId: nuevaProp.id,
          })),
        });
      }

      return propActualizada;
    });

    return NextResponse.json({ success: true, duplicatedId: duplicada.id });
  } catch (error) {
    console.error('Error duplicando propiedad:', error);
    return NextResponse.json(
      { error: 'Error interno al duplicar la propiedad' },
      { status: 500 }
    );
  }
}