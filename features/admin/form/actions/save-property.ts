'use server';

import { prisma } from '@/backend/db';
import { PropertyFormValues } from '../schemas/property-schema';
import { generarCodigoRef, parseRawNumber, slugify } from '@/lib/utils-formatting';
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

    // Regla inteligente de permitMetaAd si no viniera definida
    const permitMetaCalculado = values.permitMetaAd !== undefined
      ? Boolean(values.permitMetaAd)
      : values.origen === 'own';


    const precioPuro = typeof values.precio === 'string'
      ? parseRawNumber(values.precio)
      : Number(values.precio || 0);

    const supTotalPura = typeof values.superficieTotal === 'string'
      ? parseRawNumber(values.superficieTotal)
      : Number(values.superficieTotal || 0);

    const supCubiertaPura = typeof values.superficieCubierta === 'string'
      ? parseRawNumber(values.superficieCubierta)
      : Number(values.superficieCubierta || 0);


    const parseCoordenada = (val: any): number | null => {
      if (val === null || val === undefined || val === '' || val === 0) return null;

      // 1. Convertimos a string y dejamos solo dígitos y signo menos
      let str = String(val).replace(',', '.');
      const isNegative = str.startsWith('-');
      const cleanDigits = str.replace(/[^0-9]/g, '');

      if (!cleanDigits) return null;

      // 2. Si la cadena viene sin punto y es gigante (ej: "3488215091792249")
      // Tomamos los primeros 2 dígitos para la parte entera y hasta 6 para los decimales
      if (!str.includes('.')) {
        const entera = cleanDigits.slice(0, 2);
        const decimales = cleanDigits.slice(2, 8);
        const num = parseFloat(`${isNegative ? '-' : ''}${entera}.${decimales}`);
        return isNaN(num) ? null : num;
      }

      // 3. Si ya traía punto, aseguramos que la parte entera no tenga más de 3 dígitos
      const parsed = parseFloat(str);
      if (isNaN(parsed) || parsed === 0) return null;

      // Limitamos a máximo 6 decimales para PostgreSQL Decimal(9,6)
      return Number(parsed.toFixed(6));
    };

    const latPura = parseCoordenada(values.latitud);
    const lngPura = parseCoordenada(values.longitud);

    if (propertyId) {
      // MODO EDICIÓN
      const propiedadExistente = await prisma.propiedad.findUnique({
        where: { id: propertyId },
      });

      if (!propiedadExistente) {
        return { success: false, error: 'La propiedad no existe.' };
      }

      console.log('📊 VALORES QUE SE VAN A GUARDAR EN PRISMA:', {
        precio: values.precio,
        superficieTotal: values.superficieTotal,
        superficieCubierta: values.superficieCubierta,
        latitud: values.latitud,
        longitud: values.longitud,
      });

      console.log('📊 VALORES LUEGO DE CONVERSION:', {
        precio: precioPuro,
        superficieTotal: supTotalPura,
        superficieCubierta: supCubiertaPura,
        latitud: latPura,
        longitud: lngPura
      });


      await prisma.$transaction(async (tx) => {
        await tx.propiedad.update({
          where: { id: propertyId },
          data: {
            titulo: values.titulo,
            categoria: (values.categoria as any) || 'venta',
            origen: (values.origen as any) || 'own',
            precio: precioPuro,
            moneda: (values.moneda as any) || 'USD',
            financiacion: values.financiacion || null,
            descripcion: values.descripcion || '',
            direccionPersonalizada: values.direccionPersonalizada || null,
            latitud: latPura || -34.78,
            longitud: lngPura || -58.28,
            superficieTotal: supTotalPura,
            superficieCubierta: supCubiertaPura,

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
            permitMetaAd: permitMetaCalculado,
            imagenMetaUrl: values.imagenMetaUrl || null,
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
          precio: precioPuro,
          moneda: (values.moneda as any) || 'USD',
          financiacion: values.financiacion || null,
          descripcion: values.descripcion || '',
          direccionPersonalizada: values.direccionPersonalizada || null,
          latitud: values.latitud || -34.78,
          longitud: values.longitud || -58.28,
          superficieTotal: supTotalPura,
          superficieCubierta: supCubiertaPura,

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
          permitMetaAd: permitMetaCalculado,
          imagenMetaUrl: values.imagenMetaUrl || null,
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