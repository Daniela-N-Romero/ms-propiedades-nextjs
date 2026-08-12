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

      // 🔑 ARMAS EL OBJETO LIMPIO COMPATIBLE CON ZOD
      const datosAValidar = {
        titulo: propiedad.titulo ?? '',
        categoria: propiedad.categoria ?? '',
        origen: propiedad.origen ?? '',
        precio: propiedad.precio ? Number(propiedad.precio) : 0,
        moneda: propiedad.moneda ?? '',
        financiacion: propiedad.financiacion ?? null,
        descripcion: propiedad.descripcion ?? '',
        zonaId: propiedad.zonaId ? Number(propiedad.zonaId) : 0,
        direccionPersonalizada: propiedad.direccionPersonalizada ?? '',
        latitud: propiedad.latitud ? Number(propiedad.latitud) : -34.78,
        longitud: propiedad.longitud ? Number(propiedad.longitud) : -58.28,
        
        // 📍 Asumimos mapa confirmado si tiene coordenadas válidas o zona
        isMapConfirmed: Boolean(propiedad.zonaId && propiedad.zonaId > 0),

        superficieTotal: propiedad.superficieTotal ? Number(propiedad.superficieTotal) : 0,
        superficieCubierta: propiedad.superficieCubierta ? Number(propiedad.superficieCubierta) : 0,
        tipoInmuebleId: propiedad.tipoInmuebleId ? Number(propiedad.tipoInmuebleId) : 0,
        agenteId: propiedad.agenteId ? Number(propiedad.agenteId) : 0,
        propietarioId: propiedad.propietarioId ? Number(propiedad.propietarioId) : null,
        colegaId: propiedad.colegaId ? Number(propiedad.colegaId) : null,
        videoUrl: propiedad.videoUrl ?? '',
        pdfUrl: propiedad.pdfUrl ?? '',
        isPublished: true,
        isUnlisted: propiedad.isUnlisted ?? false,
        isDestacada: propiedad.isDestacada ?? false,
        notasPrivadas: propiedad.notasPrivadas ?? '',
        caracteristicas: (propiedad.caracteristicas as Record<string, any>) ?? {},
        imagenes: propiedad.imagenes.length > 0 
          ? propiedad.imagenes.map((img) => img.url) 
          : ['/images/placeholder.png'],
      };

      const result = publishPropertySchema.safeParse(datosAValidar);

      if (!result.success) {
        const faltantes = Object.keys(result.error.flatten().fieldErrors).join(', ');
        return NextResponse.json(
          {
            error: `No se puede publicar: la propiedad está incompleta. Campos observados: [${faltantes}]. Por favor, edítela para completarla.`,
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