'use server';

import { prisma } from '@/backend/db';
import { PropertyFormValues } from '../schemas/property-schema';
import { generarCodigoRef, slugify } from '@/lib/utils-formatting';
import { revalidatePath } from 'next/cache';

export async function savePropertyAction(
  data: PropertyFormValues,
  propertyId?: number
) {
  const values = data;

  try {
    const zona = await prisma.zona.findUnique({ where: { id: values.zonaId } });
    const tipoInmueble = await prisma.tipoInmueble.findUnique({
      where: { id: values.tipoInmuebleId },
      include: { padre: true },
    });

    const tipoCategoria = tipoInmueble?.padre?.slug || tipoInmueble?.slug || 'industrial';

    if (propertyId) {
      // MODO EDICIÓN
      const propiedadExistente = await prisma.propiedad.findUnique({
        where: { id: propertyId },
      });

      if (!propiedadExistente) {
        return { success: false, error: 'La propiedad no existe.' };
      }

      await prisma.$transaction(async (tx) => {
        await tx.propiedad.update({
          where: { id: propertyId },
          data: {
            titulo: values.titulo,
            categoria: (values.categoria as any) || 'venta',
            origen: (values.origen as any) || 'own',
            precio: values.precio || 0,
            moneda: (values.moneda as any) || 'USD',
            financiacion: values.financiacion || null,
            descripcion: values.descripcion || '',
            direccionPersonalizada: values.direccionPersonalizada || null,
            latitud: values.latitud || -34.78,
            longitud: values.longitud || -58.28,
            superficieTotal: values.superficieTotal || null,
            superficieCubierta: values.superficieCubierta || null,

            // Relaciones obligatorias aseguradas
            tipoInmuebleId: values.tipoInmuebleId,
            zonaId: values.zonaId,
            agenteId: values.agenteId,

            propietarioId: values.propietarioId && values.propietarioId > 0 ? values.propietarioId : null,
            colegaId: values.colegaId && values.colegaId > 0 ? values.colegaId : null,

            videoUrl: values.videoUrl || null,
            pdfUrl: values.pdfUrl || null,
            isPublished: Boolean(values.isPublished),
            isUnlisted: Boolean(values.isUnlisted),
            isDestacada: Boolean(values.isDestacada),
            notasPrivadas: values.notasPrivadas || null,
            caracteristicas: values.caracteristicas || {},
            updatedAt: new Date(),
          },
        });

        await tx.imagen.deleteMany({ where: { propiedadId: propertyId } });

        if (values.imagenes && values.imagenes.length > 0) {
          await tx.imagen.createMany({
            data: values.imagenes.map((url, index) => ({
              url,
              orden: index,
              propiedadId: propertyId,
            })),
          });
        }
      });

      revalidatePath('/admin/dashboard');
      revalidatePath(`/propiedades/${propiedadExistente.slug}`);
      revalidatePath('/');
      revalidatePath('/propiedades');

      return { success: true, propertyId };

    } else {
      // MODO CREACIÓN
      const totalCount = await prisma.propiedad.count();
      const nuevoIdSimulado = totalCount + 100;

      const codigoRef = generarCodigoRef({
        id: nuevoIdSimulado,
        type: tipoCategoria,
        locality: zona?.nombre || 'GBA',
      });

      const baseSlug = slugify(values.titulo);
      const slugRef = `${baseSlug}-${codigoRef.toLowerCase()}`;

      const nuevaPropiedad = await prisma.propiedad.create({
        data: {
          codigo: codigoRef,
          titulo: values.titulo,
          slug: slugRef,
          categoria: (values.categoria as any) || 'venta',
          origen: (values.origen as any) || 'own',
          precio: values.precio || 0,
          moneda: (values.moneda as any) || 'USD',
          financiacion: values.financiacion || null,
          descripcion: values.descripcion || '',
          direccionPersonalizada: values.direccionPersonalizada || null,
          latitud: values.latitud || -34.78,
          longitud: values.longitud || -58.28,
          superficieTotal: values.superficieTotal || null,
          superficieCubierta: values.superficieCubierta || null,

          // Relaciones obligatorias aseguradas
          tipoInmuebleId: values.tipoInmuebleId,
          zonaId: values.zonaId,
          agenteId: values.agenteId,

          propietarioId: values.propietarioId && values.propietarioId > 0 ? values.propietarioId : null,
          colegaId: values.colegaId && values.colegaId > 0 ? values.colegaId : null,

          videoUrl: values.videoUrl || null,
          pdfUrl: values.pdfUrl || null,
          isPublished: Boolean(values.isPublished),
          isUnlisted: Boolean(values.isUnlisted),
          isDestacada: Boolean(values.isDestacada),
          notasPrivadas: values.notasPrivadas || null,
          caracteristicas: values.caracteristicas || {},

          imagenes: values.imagenes && values.imagenes.length > 0
            ? {
                create: values.imagenes.map((url, index) => ({
                  url,
                  orden: index,
                })),
              }
            : undefined,
        },
      });

      revalidatePath('/admin/dashboard');
      revalidatePath('/');
      revalidatePath('/propiedades');

      return { success: true, propertyId: nuevaPropiedad.id };
    }
  } catch (error) {
    console.error('Error guardando propiedad:', error);
    return { success: false, error: 'Ocurrió un error al guardar en la base de datos.' };
  }
}