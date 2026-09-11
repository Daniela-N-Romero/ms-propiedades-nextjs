// src/backend/services/property.service.ts
import { prisma } from '@/backend/db';
import { PropertyFullData, ZonaServer } from '@/types/server-data';
import { sanearParaServer, sanearPropiedad } from '@/lib/sanitizers';
import { TipoOperacionEnum, MonedaEnum, TipoInmueble } from '@prisma-client'
import { sanearPropiedadCompleta, sanearZona } from '@/lib/sanitizers';
import { getAgentes, getColegas, getPropietarios } from './admin-catalogos.service';
import { getLocalidadesPorPadre, getZonasPadre } from './zone.service';
import { getMercadosPadre, getSubtiposPorMercado } from './tipo-inmueble.service';
import { cache } from 'react';

/**
 * 1. OBTENER PROPIEDADES DESTACADAS
 * USO: Home / Landing Page.
 * QUÉ HACE: Trae solo propiedades marcadas como 'isPublished: true' e 'isDestacada: true', 
 * ordenadas por fecha más reciente. Incluye la zona y tipo de inmueble.
 */
export async function getDestacadas() {
  const destacadas = await prisma.propiedad.findMany({
    where: { isPublished: true, isDestacada: true, isUnlisted: false, }, // isUnlisted: false para excluir propiedades no listadas
    select: {
      id: true,
      slug: true,
      titulo: true,
      categoria: true,
      precio: true,
      moneda: true,
      financiacion: true,
      isDestacada: true,
      superficieTotal: true,
      superficieCubierta: true,
      zona: { select: { nombre: true } },
      tipoInmueble: { select: { nombre: true } },
      imagenes: {
        take: 1, // Solo trae 1 foto de portada
        orderBy: { orden: 'asc' },
        select: { url: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return destacadas.map(prop => sanearPropiedad(prop));
}


/**
 * 2. OBTENER PROPIEDADES (Listado Básico)
 * USO: Consultas rápidas o vistas simples.
 * QUÉ HACE: Filtra propiedades publicadas por operación, zona o tipo.
 * ⚠️ SUPERPOSICIÓN: Es un subconjunto de `searchPropiedades`. Si no necesitas mantenerla 
 * por compatibilidad, se recomienda consolidarla en `searchPropiedades`.
 */
/**
 * 2. OBTENER PROPIEDADES (Listado Básico)
 */
export async function getPropiedades(filtros?: {
  operacion?: string;
  tipoInmueble?: string;
  zonaId?: number;
}) {
  const propiedades = await prisma.propiedad.findMany({
    where: {
      isPublished: true,
      isUnlisted: false,
      ...(filtros?.operacion && { operacion: filtros.operacion }),
      ...(filtros?.zonaId && { zonaId: filtros.zonaId }),
    },
    select: {
      id: true,
      slug: true,
      titulo: true,
      categoria: true,
      precio: true,
      moneda: true,
      financiacion: true,
      isDestacada: true,
      superficieTotal: true,
      superficieCubierta: true,
      zona: { select: { nombre: true } },
      tipoInmueble: { select: { nombre: true } },
      imagenes: {
        take: 1,
        orderBy: { orden: 'asc' },
        select: { url: true }
      }
    },
  });

  return propiedades.map((prop) => sanearPropiedad(prop));
}

/**
 * ELIMINAR PROPIEDAD
 */
export async function deletePropiedad(id: number) {
  try {
    await prisma.propiedad.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar propiedad:', error);
    return { success: false, error: 'No se pudo eliminar la propiedad.' };
  }
}

/**
 * VINCULAR IMAGEN A PROPIEDAD (Helper opcional)
 */
export async function guardarImagenEnBD(urlPublica: string, propiedadId: number) {
  const ultimaImagen = await prisma.imagen.findFirst({
    where: { propiedadId },
    orderBy: { orden: 'desc' },
  });

  const nuevoOrden = ultimaImagen ? ultimaImagen.orden + 1 : 0;

  return await prisma.imagen.create({
    data: {
      url: urlPublica,
      orden: nuevoOrden,
      propiedadId,
    },
  });
}

/**
 * 3. OBTENER SUBTIPOS SEGÚN MERCADO (Filtro dinámico de categorías)
 * USO: Menús de navegación, selectores de tipo de inmueble (ej: en el buscador).
 * QUÉ HACE: Devuelve solo los subtipos HIJOS (ej: "Nave Industrial", "Depósito") 
 * que pertenecen a un mercado PADRE (ej: "Industrial") Y que tienen stock publicado activo.
 */
export async function getSubtiposPorTipoMercado(mercadoSlug?: string) {
  const whereCondition: any = {
    padreId: { not: null },
    propiedades: {
      some: { isPublished: true, isUnlisted: false }
    }
  };

  if (mercadoSlug && mercadoSlug !== 'todas') {
    whereCondition.padre = {
      slug: { equals: mercadoSlug, mode: 'insensitive' }
    };
  }

  const subtipos = await prisma.tipoInmueble.findMany({
    where: whereCondition,
    select: {
      id: true,
      nombre: true,
      slug: true,
      padreId: true
    },
    orderBy: { nombre: 'asc' }
  });

  return subtipos;
}

/**
 * 4. OBTENER DETALLE DE UNA PROPIEDAD POR SLUG
 * USO: Página de detalle de propiedad (Ficha pública).
 * QUÉ HACE: Busca una única propiedad publicada por su URL amigable (slug), 
 * trayendo relaciones completas: zona padre/hija, tipo inmueble padre/hijo, 
 * agente asignado e imágenes ordenadas.
 */
export const getPropiedadBySlug = cache(async (slug: string) => {
  try {
    const propiedad = await prisma.propiedad.findUnique({
      where: { slug, isPublished: true },
      include: {
        zona: {
          include: {
            padre: {
              include: {
                padre: true,
              },
            },
          },
        },
        tipoInmueble: { include: { padre: true } },
        agente: true,
        imagenes: { orderBy: { orden: 'asc' } },
      },
    });

    if (!propiedad) return null;

    return sanearPropiedadCompleta(propiedad) as unknown as PropertyFullData;
  } catch (error) {
    console.error('Error en Prisma getPropiedadBySlug:', error);
    return null;
  }
});



//BUSQUEDA POR FILTROS

/**
 * 5. BÚSQUEDA AVANZADA MULTICRITERIO
 * USO: Buscador principal de la web (catálogo con filtros).
 * QUÉ HACE: Construye una query dinámica según los filtros recibidos:
 * categoría (operación), mercado/subtipos, moneda, localidades, rangos de precio,
 * superficie total/cubierta y ordenamiento personalizado.
 */
interface SearchFilters {
  categoria?: string;
  mercadoSlug?: string;
  subtiposSlugs?: string[];
  moneda?: string;
  precioMin?: number;
  precioMax?: number;
  supMin?: number;
  supMax?: number;
  supCubMin?: number;
  supCubMax?: number;
  localidades?: number[];
  ordenar?: string;
  page?: number;
  pageSize?: number;
}

export type SearchMode = 'list' | 'map' | 'full';

export async function searchPropiedades(
  filters: SearchFilters,
  isPublishedOnly: boolean = true,
  isNotUnlisted: boolean = true,
  mode: SearchMode = 'full' // 'full' por defecto para retrocompatibilidad
) {
  const queryWhere: any = {};

  if (isPublishedOnly) {
    queryWhere.isPublished = true;
  }
  if (isNotUnlisted) {
    queryWhere.isUnlisted = false;
  }

  if (filters.categoria) {
    queryWhere.categoria = filters.categoria as TipoOperacionEnum;
  }

  // Filtrado por jerarquía de tipos de inmueble
  if (filters.subtiposSlugs && filters.subtiposSlugs.length > 0) {
    queryWhere.tipoInmueble = { slug: { in: filters.subtiposSlugs } };
  } else if (filters.mercadoSlug) {
    queryWhere.tipoInmueble = {
      OR: [
        { padre: { slug: { equals: filters.mercadoSlug, mode: 'insensitive' } } },
        { slug: { equals: filters.mercadoSlug, mode: 'insensitive' } },
      ],
    };
  }

  if (filters.moneda) {
    queryWhere.moneda = filters.moneda as MonedaEnum;
  }

  // Filtrado por Localidades
  if (filters.localidades && filters.localidades.length > 0) {
    const zonasConHijas = await prisma.zona.findMany({
      where: { id: { in: filters.localidades } },
      select: {
        id: true,
        hijas: { select: { id: true } }
      }
    });

    const idsHijas = zonasConHijas.flatMap(z => z.hijas.map(hija => hija.id));
    const todasLasZonaIds = Array.from(new Set([...filters.localidades, ...idsHijas]));
    queryWhere.zonaId = { in: todasLasZonaIds };
  }

  if (filters.precioMin || filters.precioMax) {
    queryWhere.precio = {};
    if (filters.precioMin) queryWhere.precio.gte = filters.precioMin;
    if (filters.precioMax) queryWhere.precio.lte = filters.precioMax;
  }

  if (filters.supMin || filters.supMax) {
    queryWhere.superficieTotal = {};
    if (filters.supMin) queryWhere.superficieTotal.gte = filters.supMin;
    if (filters.supMax) queryWhere.superficieTotal.lte = filters.supMax;
  }

  if (filters.supCubMin || filters.supCubMax) {
    queryWhere.superficieCubierta = {};
    if (filters.supCubMin) queryWhere.superficieCubierta.gte = filters.supCubMin;
    if (filters.supCubMax) queryWhere.superficieCubierta.lte = filters.supCubMax;
  }

  // Si es MODO MAPA, obligamos a la base de datos a traer solo geolocalizados
  if (mode === 'map') {
    queryWhere.latitud = { not: null };
    queryWhere.longitud = { not: null };
  }

  let queryOrderBy: any = { createdAt: 'desc' };
  if (filters.ordenar === 'precio_asc') queryOrderBy = { precio: 'asc' };
  if (filters.ordenar === 'precio_desc') queryOrderBy = { precio: 'desc' };
  if (filters.ordenar === 'sup_asc') queryOrderBy = { superficieTotal: 'asc' };
  if (filters.ordenar === 'sup_desc') queryOrderBy = { superficieTotal: 'desc' };

  // 1. MODO MAPA
  if (mode === 'map') {
    const resultados = await prisma.propiedad.findMany({
      where: queryWhere,
      select: {
        id: true,
        codigo: true,
        slug: true,
        titulo: true,
        precio: true,
        moneda: true,
        financiacion: true,
        superficieTotal: true,
        superficieCubierta: true,
        latitud: true,
        longitud: true,
        origen: true,
        propietarioId: true,
        colegaId: true,
        direccionPersonalizada: true,
        zona: { select: { nombre: true } },
        imagenes: {
          take: 1,
          orderBy: { orden: 'asc' },
          select: { url: true }
        }
      },
      orderBy: [{ isDestacada: 'desc' }, queryOrderBy],
    });

    const saneadas = resultados.map(p => sanearPropiedad(p));

    return {
      propiedades: saneadas,
      totalPropiedades: saneadas.length,
      currentPage: 1,
      totalPages: 1
    };
  }

  // 2. MODO LISTA
  if (mode === 'list') {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 12; // 👈 12 propiedades por página

    // Ejecutamos la búsqueda de la página Y el conteo total en paralelo
    const [resultados, totalPropiedades] = await Promise.all([
      prisma.propiedad.findMany({
        where: queryWhere,
        take: pageSize,
        skip: (page - 1) * pageSize, // 👈 Se salta los registros de páginas anteriores
        select: {
          id: true,
          slug: true,
          titulo: true,
          categoria: true,
          precio: true,
          moneda: true,
          financiacion: true,
          isDestacada: true,
          superficieTotal: true,
          superficieCubierta: true,
          zona: { select: { nombre: true } },
          tipoInmueble: { select: { nombre: true } },
          imagenes: {
            take: 1,
            orderBy: { orden: 'asc' },
            select: { url: true }
          }
        },
        orderBy: [{ isDestacada: 'desc' }, queryOrderBy],
      }),
      prisma.propiedad.count({ where: queryWhere }) // Cuenta el total real sin límites
    ]);

    const totalPages = Math.ceil(totalPropiedades / pageSize);

    return {
      propiedades: resultados.map(p => sanearPropiedad(p)),
      totalPropiedades,
      currentPage: page,
      totalPages
    };
  }

  // 3. MODO FULL (Fallback de seguridad)
  const resultados = await prisma.propiedad.findMany({
    where: queryWhere,
    include: {
      zona: true,
      imagenes: { orderBy: { orden: 'asc' } },
      tipoInmueble: { include: { padre: true } }
    },
    orderBy: [{ isDestacada: 'desc' }, queryOrderBy],
  });

  const saneadas = resultados.map(prop => sanearPropiedadCompleta(prop));

  return {
    propiedades: saneadas,
    totalPropiedades: saneadas.length,
    currentPage: 1,
    totalPages: 1
  };
}

export async function getPropiedadById(propertyId: number) {
  const propiedad = await prisma.propiedad.findUnique({
    where: { id: propertyId },
    include: {
      zona: {
        include: {
          padre: {
            include: {
              padre: true,
            },
          },
        },
      },
      tipoInmueble: { include: { padre: true } },
      agente: true,
      imagenes: { orderBy: { orden: 'asc' } }
    }
  });
  if (!propiedad) return null;

  return sanearPropiedadCompleta(propiedad) as PropertyFullData;
}


//Traer datos para poblar select
/**
 * Carga los catálogos base para el formulario y, opcionalmente, 
 * los datos completos de una propiedad si se pasa un `propertyId`.
 */
export async function getFormData(propertyId?: number) {
  // Si hay propertyId, buscamos la propiedad en paralelo con los catálogos base
  const [
    propiedad,
    mercados,
    zonasPadre,
    agentes,
    propietarios,
    colegas
  ] = await Promise.all([
    propertyId ? getPropiedadById(propertyId) : null,
    getMercadosPadre(),
    getZonasPadre(),
    getAgentes(),
    getPropietarios(),
    getColegas(),
  ]);

  // Cargar dependencias secundarias (si estamos editando)
  // Si la propiedad existe, cargamos las localidades de su zona padre y los subtipos de su mercado padre
  let subtipos: TipoInmueble[] = [];
  let localidades: ZonaServer[] = [];

  if (propiedad) {
    const mercadoPadreId = propiedad.tipoInmueble?.padreId || propiedad.tipoInmuebleId;
    const zonaPadreId = propiedad.zona?.padreId || propiedad.zonaId;

    [subtipos, localidades] = await Promise.all([
      mercadoPadreId ? getSubtiposPorMercado(mercadoPadreId) : Promise.resolve([]),
      zonaPadreId ? getLocalidadesPorPadre(zonaPadreId) : Promise.resolve([]),
    ]);
  }

  return {
    propiedad,
    mercados,
    subtipos,      // En modo edición vendrá poblado; en modo creación iniciará vacío []
    zonasPadre,
    localidades,   // En modo edición vendrá poblado; en modo creación iniciará vacío []
    agentes,
    propietarios,
    colegas,
  };
}

export async function getPropiedadesSimilares(
  propiedadActualId: number,
  tipoInmuebleId: number,
  zonaId: number,
  limit = 3
) {
  try {
    // 📍 CAPA 1: Prioridad Absoluta a la Misma Zona Exacta (Localidad)
    const mismasZona = await prisma.propiedad.findMany({
      where: {
        id: { not: propiedadActualId }, // Excluimos la propiedad que está viendo
        zonaId: zonaId,                // Misma localidad exacta
        isPublished: true,
        isUnlisted: false,
        deletedAt: null,
      },
      take: limit,
      orderBy: [
        { isDestacada: 'desc' }, // Entre las de la misma zona, primero las destacadas
        { updatedAt: 'desc' },
      ],
      select: {
        id: true,
        slug: true,
        titulo: true,
        categoria: true,
        precio: true,
        moneda: true,
        financiacion: true,
        isDestacada: true,
        superficieTotal: true,
        superficieCubierta: true,
        zona: { select: { nombre: true } },
        tipoInmueble: { select: { nombre: true, padre: { select: { slug: true } } } },
        imagenes: {
          take: 1,
          orderBy: { orden: 'asc' },
          select: { url: true }
        },
      },
    });

    // Si ya completamos el cupo con la misma zona, las devolvemos directo
    if (mismasZona.length >= limit) {
      return mismasZona.map(p => sanearPropiedad(p));
    }

    // 🗺️ CAPA 2: FALLBACK POR TIPO DE INMUEBLE (Si faltan para completar los 3 casilleros)
    const idsYaEncontrados = [propiedadActualId, ...mismasZona.map((p) => p.id)];
    const faltantes = limit - mismasZona.length;

    const adicionalesMismoTipo = await prisma.propiedad.findMany({
      where: {
        id: { notIn: idsYaEncontrados },
        tipoInmuebleId: tipoInmuebleId, // Mismo tipo (ej. Nave Industrial)
        isPublished: true,
        isUnlisted: false,
        deletedAt: null,
      },
      take: faltantes,
      orderBy: [
        { isDestacada: 'desc' },
        { updatedAt: 'desc' },
      ],
      select: {
        id: true,
        slug: true,
        titulo: true,
        categoria: true,
        precio: true,
        moneda: true,
        financiacion: true,
        isDestacada: true,
        superficieTotal: true,
        superficieCubierta: true,
        zona: { select: { nombre: true } },
        tipoInmueble: { select: { nombre: true, padre: { select: { slug: true } } } },
        imagenes: {
          take: 1,
          orderBy: { orden: 'asc' },
          select: { url: true }
        },
      },
    });

    // Unimos los resultados: Primero las de la zona, luego las alternativas
    const unificadas = [...mismasZona, ...adicionalesMismoTipo];
    return unificadas.map(p => sanearPropiedad(p));
  } catch (error) {
    console.error('Error al obtener propiedades similares:', error);
    return [];
  }
}