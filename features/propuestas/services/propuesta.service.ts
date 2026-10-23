import { prisma } from '@/backend/db';
import { sanearPropuestaComercial } from '../utils/sanitizer';
import { PropuestaComercialEntity } from '@/features/propuestas/types/propuesta.types';

export class PropuestasService {
  static async obtenerPorSlug(slug: string): Promise<PropuestaComercialEntity | null> {
    const propuestaRaw = await prisma.propuestaComercial.findUnique({
      where: { slug },
      include: {
        items: {
          include: {
            parqueIndustrial: true,
            propiedad: {
              include: {
                // TRAE SOLO LA PRIMERA IMAGEN (PORTADA)
                imagenes: {
                  take: 1,
                  orderBy: { orden: 'asc' },
                },
                zona: true,
                parqueIndustrial: true,
              },
            },
          },
          orderBy: { orden: 'asc' },
        },
      },
    });

    if (!propuestaRaw) return null;
    return sanearPropuestaComercial(propuestaRaw);
  }

  static async obtenerPorId(id: string): Promise<PropuestaComercialEntity | null> {
    const propuestaRaw = await prisma.propuestaComercial.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            parqueIndustrial: true,
            propiedad: {
              include: {
                // TRAE SOLO LA PRIMERA IMAGEN (PORTADA)
                imagenes: {
                  take: 1,
                  orderBy: { orden: 'asc' },
                },
                zona: true,
                parqueIndustrial: true,
              },
            },
          },
          orderBy: { orden: 'asc' },
        },
      },
    });

    if (!propuestaRaw) return null;
    return sanearPropuestaComercial(propuestaRaw);
  }

  static async obtenerListadoAdmin() {
    return await prisma.propuestaComercial.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });
  }

  static async crear(body: any) {
    const {
      tipo,
      clienteNombre,
      clienteEmpresa,
      slug,
      puntoInteresNombre,
      puntoInteresLat,
      puntoInteresLng,
      payloadJson,
      items,
    } = body;

    return await prisma.propuestaComercial.create({
      data: {
        tipo: tipo || 'LOGISTICA_RUTAS',
        clienteNombre,
        clienteEmpresa: clienteEmpresa || null,
        slug,
        puntoInteresNombre: puntoInteresNombre || 'Punto de Referencia',
        puntoInteresLat: puntoInteresLat ? Number(puntoInteresLat) : null,
        puntoInteresLng: puntoInteresLng ? Number(puntoInteresLng) : null,
        payloadJson: payloadJson || undefined,
        items: {
          create: (items || []).map((item: any, index: number) => ({
            propiedadId: Number(item.propiedadId),
            esPrioritaria: Boolean(item.esPrioritaria),
            notaLogistica: item.notaLogistica || null,
            tiempoEstimadoString: item.tiempoEstimadoString || null,
            nombre: item.nombre || null,
            parqueIndustrialId: item.parqueIndustrialId ? Number(item.parqueIndustrialId) : null,
            costoTierraCustom: item.costoTierraCustom !== null && item.costoTierraCustom !== undefined  ? Number(item.costoTierraCustom) : null,
            costoObraM2: item.costoObraM2 ? Number(item.costoObraM2) : null,
            supNaveProyectada: item.supNaveProyectada ? Number(item.supNaveProyectada) : null,
            alquilerM2Estimado: item.alquilerM2Estimado ? Number(item.alquilerM2Estimado) : null,
            cuotasTexto: item.cuotasTexto || null,
            fosAplicado: item.fosAplicado ? Number(item.fosAplicado) : 0.6,
            orden: Number(item.orden ?? index + 1),
            esFinanciado: item.esFinanciado !== undefined ? Boolean(item.esFinanciado) : true,
            porcentajeAnticipo: Number(item.porcentajeAnticipo ?? 0),
            anticipoCash: item.anticipoCash ? Number(item.anticipoCash) : null,
            cantidadCuotas: Number(item.cantidadCuotas ?? 0),
            mesesObra: Number(item.mesesObra ?? 8),
            ofertaContadoUSD: item.ofertaContadoUSD !== null && item.ofertaContadoUSD !== undefined  ? Number(item.ofertaContadoUSD): null,
            notaEspecial: item.notaEspecial || null
          })),
        },
      },
    });
  }

  static async actualizar(id: string, body: any) {
  const {
    tipo,
    clienteNombre,
    clienteEmpresa,
    slug,
    puntoInteresNombre,
    puntoInteresLat,
    puntoInteresLng,
    payloadJson,
    items,
  } = body;

  return await prisma.$transaction(async (tx) => {
    await tx.propuestaItem.deleteMany({ where: { propuestaId: id } });

    return await tx.propuestaComercial.update({
      where: { id },
      data: {
        tipo,
        clienteNombre,
        clienteEmpresa: clienteEmpresa || null,
        slug,
        puntoInteresNombre: puntoInteresNombre || null,
        puntoInteresLat: puntoInteresLat ? Number(puntoInteresLat) : null,
        puntoInteresLng: puntoInteresLng ? Number(puntoInteresLng) : null,
        payloadJson: payloadJson || undefined,
        items: {
          create: (items || []).map((item: any, index: number) => ({
            propiedadId: Number(item.propiedadId),
            esPrioritaria: Boolean(item.esPrioritaria),
            notaLogistica: item.notaLogistica || null,
            tiempoEstimadoString: item.tiempoEstimadoString || null,
            nombre: item.nombre || null,
            parqueIndustrialId: item.parqueIndustrialId ? Number(item.parqueIndustrialId) : null,
            costoTierraCustom: item.costoTierraCustom !== null && item.costoTierraCustom !== undefined  ? Number(item.costoTierraCustom) : null,
            costoObraM2: item.costoObraM2 ? Number(item.costoObraM2) : null,
            supNaveProyectada: item.supNaveProyectada ? Number(item.supNaveProyectada) : null,
            alquilerM2Estimado: item.alquilerM2Estimado ? Number(item.alquilerM2Estimado) : null,
            anticipoCash: item.anticipoCash !== null && item.anticipoCash !== undefined ? Number(item.anticipoCash) : null,
            cuotasTexto: item.cuotasTexto || null,
            fosAplicado: item.fosAplicado ? Number(item.fosAplicado) : 0.6,
            orden: Number(item.orden ?? index + 1),
            esFinanciado: item.esFinanciado !== undefined ? Boolean(item.esFinanciado) : true,
            porcentajeAnticipo: Number(item.porcentajeAnticipo ?? 0),
            cantidadCuotas: Number(item.cantidadCuotas ?? 0),
            mesesObra: Number(item.mesesObra ?? 8),
            ofertaContadoUSD: item.ofertaContadoUSD !== null && item.ofertaContadoUSD !== undefined  ? Number(item.ofertaContadoUSD) : null,
            notaEspecial: item.notaEspecial || null,
         })),
        },
      },
    });
  });
}

  static async eliminarPorId(id: string) {
    return await prisma.propuestaComercial.delete({
      where: { id },
    });
  }
}