'use server';

import { prisma } from '@/backend/db';
import { propertyFormSchema, PropertyFormValues } from '../schemas/property-schema';
import { generarCodigoRef, slugify } from '@/lib/utils-formatting';
import { revalidatePath } from 'next/cache';

export async function savePropertyAction(
  data: PropertyFormValues,
  propertyId?: number
) {
  const validated = propertyFormSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const values = validated.data;

  try {

    const zona = await prisma.zona.findUnique({
      where: { id: values.zonaId },
    });

    // Obtenemos el tipo de inmueble para saber si es industrial, comercial, etc.
    const tipoInmueble = await prisma.tipoInmueble.findUnique({
      where: { id: values.tipoInmuebleId },
      include: { padre: true },
    });

    // Determinar la categoría principal para la nomenclatura
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
        // 1. Actualizar datos principales
        await tx.propiedad.update({
          where: { id: propertyId },
          data: {
            titulo: values.titulo,
            categoria: values.categoria,
            origen: values.origen,
            precio: values.precio,
            moneda: values.moneda,
            financiacion: values.financiacion,
            descripcion: values.descripcion,
            direccionPersonalizada: values.direccionPersonalizada,
            latitud: values.latitud,
            longitud: values.longitud,
            superficieTotal: values.superficieTotal,
            superficieCubierta: values.superficieCubierta,
            tipoInmuebleId: values.tipoInmuebleId,
            zonaId: values.zonaId,
            agenteId: values.agenteId,
            propietarioId: values.propietarioId || null,
            colegaId: values.colegaId || null,
            videoUrl: values.videoUrl,
            pdfUrl: values.pdfUrl,
            isPublished: values.isPublished,
            isUnlisted: values.isUnlisted,
            isDestacada: values.isDestacada,
            notasPrivadas: values.notasPrivadas,
            caracteristicas: values.caracteristicas || {},
            updatedAt: new Date(),
          },
        });

        // 2. Reemplazar galería de imágenes
        await tx.imagen.deleteMany({ where: { propiedadId: propertyId } });

        await tx.imagen.createMany({
          data: values.imagenes.map((url, index) => ({
            url,
            orden: index,
            propiedadId: propertyId,
          })),
        });
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

      // Generar el código unificado con helper
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
          categoria: values.categoria,
          origen: values.origen,
          precio: values.precio,
          moneda: values.moneda,
          financiacion: values.financiacion,
          descripcion: values.descripcion,
          direccionPersonalizada: values.direccionPersonalizada,
          latitud: values.latitud,
          longitud: values.longitud,
          superficieTotal: values.superficieTotal,
          superficieCubierta: values.superficieCubierta,
          tipoInmuebleId: values.tipoInmuebleId,
          zonaId: values.zonaId,
          agenteId: values.agenteId,
          propietarioId: values.propietarioId || null,
          colegaId: values.colegaId || null,
          videoUrl: values.videoUrl,
          pdfUrl: values.pdfUrl,
          isPublished: values.isPublished,
          isUnlisted: values.isUnlisted,
          isDestacada: values.isDestacada,
          notasPrivadas: values.notasPrivadas,
          caracteristicas: values.caracteristicas || {},

          imagenes: {
            create: values.imagenes.map((url, index) => ({
              url,
              orden: index,
            })),
          },
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