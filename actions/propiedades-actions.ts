'use server';

import { prisma } from '@/backend/db';
import { PropertyFormValues } from '@/features/admin/form/schemas/property-schema';
import { generarCodigoRef, parseRawNumber, slugify } from '@/lib/utils-formatting';
import { revalidatePath } from 'next/cache';

// ==========================================
// SERVER ACTION PRINCIPAL
// ==========================================

export async function savePropertyAction(
  data: PropertyFormValues,
  propertyId?: number
) {
  const modo = data.isPublished ? 'PUBLICAR' : 'GUARDAR BORRADOR';
  console.log(`🚀 Iniciando acción: [${modo}] ${propertyId ? `(Edición ID: ${propertyId})` : '(Nueva Propiedad)'}`);

  const imagenesParaSalvar = mapearImagenesParaSalvar(data.imagenes);

  try {
    const zona = await prisma.zona.findUnique({ where: { id: data.zonaId } });
    const tipoInmueble = await prisma.tipoInmueble.findUnique({
      where: { id: data.tipoInmuebleId },
      include: { padre: true },
    });

    const tipoCategoria = tipoInmueble?.padre?.slug || tipoInmueble?.slug || 'industrial';
    const propertyData = construirPropertyData(data);

    if (propertyId) {
      // ✏️ MODO EDICIÓN
      const propiedadExistente = await prisma.propiedad.findUnique({ where: { id: propertyId } });
      if (!propiedadExistente) {
        return { success: false, error: 'La propiedad a editar no existe.' };
      }

      let nuevoSlug = propiedadExistente.slug;
      if (data.slug && data.slug.trim() !== '') {
        const slugNormalizado = slugify(data.slug);
        if (slugNormalizado !== propiedadExistente.slug) {
          const slugExistente = await prisma.propiedad.findFirst({
            where: { slug: slugNormalizado, NOT: { id: propertyId } },
          });

          if (slugExistente) {
            return { success: false, error: 'El Slug / URL especificado ya pertenece a otra propiedad.' };
          }
          nuevoSlug = slugNormalizado;
        }
      }

      await prisma.$transaction(async (tx) => {
        await tx.propiedad.update({
          where: { id: propertyId },
          data: {
            ...propertyData,
            slug: nuevoSlug,
            updatedAt: new Date(),
          },
        });

        await tx.imagen.deleteMany({ where: { propiedadId: propertyId } });
        if (imagenesParaSalvar.length > 0) {
          await tx.imagen.createMany({
            data: imagenesParaSalvar.map((item) => ({ ...item, propiedadId: propertyId })),
          });
        }
      });

      revalidatePath('/admin/dashboard');
      revalidatePath(`/propiedades/${nuevoSlug}`);
      revalidatePath('/');
      revalidatePath('/propiedades', 'layout');

      return { success: true, propertyId };

    } else {
      // ➕ MODO CREACIÓN
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const timestamp = Date.now().toString().slice(-4);

      const ultimaProp = await prisma.propiedad.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true },
      });
      const siguienteId = (ultimaProp?.id || 0) + 1;

      let codigoRef = generarCodigoRef({
        id: siguienteId,
        type: tipoCategoria,
        locality: zona?.nombre || 'GBA',
      });

      const existeCodigo = await prisma.propiedad.findFirst({ where: { codigo: codigoRef } });
      if (existeCodigo) {
        codigoRef = `${codigoRef.substring(0, 8)}-${Math.floor(100 + Math.random() * 900)}`;
      }

      const baseSlug = slugify(data.slug || data.titulo);
      let slugRef = `${baseSlug}-${codigoRef.toLowerCase()}`;

      const existeSlug = await prisma.propiedad.findFirst({ where: { slug: slugRef } });
      if (existeSlug) {
        slugRef = `${slugRef}-${timestamp}`;
      }

      const nuevaPropiedad = await prisma.propiedad.create({
        data: {
          ...propertyData,
          codigo: codigoRef,
          slug: slugRef,
          imagenes: imagenesParaSalvar.length > 0
            ? { create: imagenesParaSalvar }
            : undefined,
        },
      });

      revalidatePath('/admin/dashboard');
      revalidatePath('/');
      revalidatePath('/propiedades');

      return { success: true, propertyId: nuevaPropiedad.id };
    }
  } catch (error: any) {
  console.error(`❌ Error en savePropertyAction [${modo}]:`);
  console.dir(error, { depth: null }); // Impresión profunda del objeto de error de Prisma
  
  if (error.code === 'P2002') {
    const target = error.meta?.target || error.meta?.driverAdapterError;
    console.error('⚠️ Columna duplicada detectada:', target);
  }
  
  return { success: false, error: 'Ocurrió un error de duplicado en la base de datos.' };
}
}

export async function toggleDestacadaAction(id: number, currentIsFeatured: boolean) {
  try {
    const updated = await prisma.propiedad.update({
      where: { id },
      data: { isDestacada: !currentIsFeatured, updatedAt: new Date() },
    });

    revalidatePath('/admin/dashboard');
    revalidatePath('/api/properties');
    revalidatePath('/propiedades');
    revalidatePath('/');

    return { success: true, isFeatured: updated.isDestacada };
  } catch (error) {
    console.error('Error al cambiar estado de destacada:', error);
    return { success: false, error: 'No se pudo actualizar la propiedad' };
  }
}



// ==========================================
// HELPER FUNCTIONS (Privadas / Auxiliares)
// ==========================================

function parseCoordenada(val: any): number | null {
  if (val === null || val === undefined || val === '' || val === 0) return null;
  let str = String(val).replace(',', '.');
  const isNegative = str.startsWith('-');
  const cleanDigits = str.replace(/[^0-9]/g, '');

  if (!cleanDigits) return null;

  if (!str.includes('.')) {
    const entera = cleanDigits.slice(0, 2);
    const decimales = cleanDigits.slice(2, 8);
    const num = parseFloat(`${isNegative ? '-' : ''}${entera}.${decimales}`);
    return isNaN(num) ? null : num;
  }

  const parsed = parseFloat(str);
  if (isNaN(parsed) || parsed === 0) return null;
  return Number(parsed.toFixed(6));
}

function mapearImagenesParaSalvar(imagenesRaw: any[]) {
  return (imagenesRaw || []).map((img: any, index: number) => {
    if (typeof img === 'string') {
      return {
        url: img,
        urlWatermark: null,
        orden: index,
      };
    }
    return {
      url: img.url,
      urlWatermark: img.urlWatermark || null,
      orden: index,
    };
  });
}

function construirPropertyData(values: PropertyFormValues) {
  const precioPuro = typeof values.precio === 'string'
    ? parseRawNumber(values.precio)
    : Number(values.precio || 0);

  const supTotalPura = typeof values.superficieTotal === 'string'
    ? parseRawNumber(values.superficieTotal)
    : Number(values.superficieTotal || 0);

  const supCubiertaPura = typeof values.superficieCubierta === 'string'
    ? parseRawNumber(values.superficieCubierta)
    : Number(values.superficieCubierta || 0);

  return {
    titulo: values.titulo,
    categoria: (values.categoria as any) || 'venta',
    origen: (values.origen as any) || 'own',
    precio: precioPuro,
    moneda: (values.moneda as any) || 'USD',
    financiacion: values.financiacion || null,
    descripcion: values.descripcion || '',
    direccionPersonalizada: values.direccionPersonalizada || null,
    latitud: parseCoordenada(values.latitud) || -34.78,
    longitud: parseCoordenada(values.longitud) || -58.28,
    superficieTotal: supTotalPura,
    superficieCubierta: supCubiertaPura,

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
    permitMetaAd: Boolean(values.permitMetaAd),
    imagenMetaUrl: values.imagenMetaUrl || null,
    notasPrivadas: values.notasPrivadas || null,

    caracteristicas: {
      ...(values.caracteristicas || {})
    },
  };
}
