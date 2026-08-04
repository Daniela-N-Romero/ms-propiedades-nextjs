// src/backend/services/property.service.ts
import { prisma } from '@/backend/db';
import { PropertyFullData, ZonaServer } from '@/types/server-data';
import { sanearParaServer} from '@/lib/sanitizers';
import { TipoOperacionEnum, MonedaEnum, TipoInmueble } from '@prisma-client'
import { sanearPropiedadCompleta, sanearZona } from '@/lib/sanitizers';
import { getAgentes, getColegas, getPropietarios } from './admin-catalogos.service';
import { getLocalidadesPorPadre, getZonasPadre } from './zone.service';
import { getMercadosPadre, getSubtiposPorMercado } from './tipo-inmueble.service';
import { PropertyFormValues } from '@/features/admin/form/schemas/property-schema';

/**
 * 1. OBTENER PROPIEDADES DESTACADAS
 * USO: Home / Landing Page.
 * QUÉ HACE: Trae solo propiedades marcadas como 'isPublished: true' e 'isDestacada: true', 
 * ordenadas por fecha más reciente. Incluye la zona y tipo de inmueble.
 */
export async function getDestacadas() {
  const destacadas = await prisma.propiedad.findMany({
    where: { isPublished: true, isDestacada: true },
    include: { zona: true, tipoInmueble: true },
    orderBy: { createdAt: 'desc' }
  });

  return destacadas.map(prop => sanearParaServer(prop));
}


/**
 * 2. OBTENER PROPIEDADES (Listado Básico)
 * USO: Consultas rápidas o vistas simples.
 * QUÉ HACE: Filtra propiedades publicadas por operación, zona o tipo.
 * ⚠️ SUPERPOSICIÓN: Es un subconjunto de `searchPropiedades`. Si no necesitas mantenerla 
 * por compatibilidad, se recomienda consolidarla en `searchPropiedades`.
 */
export async function getPropiedades(filtros?: {
  operacion?: string;
  tipoInmueble?: string;
  zonaId?: number;
}) {
  const propiedades = await prisma.propiedad.findMany({
    where: {
      isPublished: true,
      ...(filtros?.operacion && { operacion: filtros.operacion }),
      ...(filtros?.zonaId && { zonaId: filtros.zonaId }),
    },
    include: {
      zona: true,
      tipoInmueble: true,
      imagenes: true
    },
  });

  return propiedades.map((prop) => sanearParaServer(prop));
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
    padreId: { not: null }, // EXIGE QUE SEA UN HIJO
    propiedades: {
      some: { isPublished: true } // Solo con stock publicado
    }
  };

  // Si seleccionaron un mercado específico (industrial, comercial, vivienda, etc.)
  if (mercadoSlug && mercadoSlug !== 'todas') {
    whereCondition.padre = {
      slug: { equals: mercadoSlug, mode: 'insensitive' }
    };
  }

  const subtipos = await prisma.tipoInmueble.findMany({
    where: whereCondition,
    orderBy: { nombre: 'asc' }
  });

  return sanearParaServer(subtipos);
}

/**
 * 4. OBTENER DETALLE DE UNA PROPIEDAD POR SLUG
 * USO: Página de detalle de propiedad (Ficha pública).
 * QUÉ HACE: Busca una única propiedad publicada por su URL amigable (slug), 
 * trayendo relaciones completas: zona padre/hija, tipo inmueble padre/hijo, 
 * agente asignado e imágenes ordenadas.
 */
export async function getPropiedadBySlug(slug: string) {
  const propiedad = await prisma.propiedad.findUnique({
    where: { slug, isPublished: true },
    include: {
      zona: { include: { padre: true } },
      tipoInmueble: { include: { padre: true } },
      agente: true,
      imagenes: { orderBy: { orden: 'asc' } }
    }
  });
  if (!propiedad) return null;

  return sanearParaServer(propiedad) as unknown as PropertyFullData;
}



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
}

export async function searchPropiedades(filters: SearchFilters) {
  const queryWhere: any = { isPublished: true };

  if (filters.categoria) {
    queryWhere.categoria = filters.categoria as TipoOperacionEnum;
  }
// Filtrado por jerarquía de tipos de inmueble
  if (filters.subtiposSlugs && filters.subtiposSlugs.length > 0) {
    // Si filtran un subtipo específico (ej: "nave-industrial")
    queryWhere.tipoInmueble = { slug: { in: filters.subtiposSlugs } };
  } else if (filters.mercadoSlug) {
    // Si filtran el mercado completo (ej: "industrial"), buscamos donde el PADRE sea "industrial"
    queryWhere.tipoInmueble = {
      OR: [
        { padre: { slug: { equals: filters.mercadoSlug, mode: 'insensitive' } } },
        { slug: { equals: filters.mercadoSlug, mode: 'insensitive' } },
      ],
    };
  }


  // Filtrado de Moneda Obligatorio (Evita cruzar USD con ARS)
  if (filters.moneda) {
    queryWhere.moneda = filters.moneda as MonedaEnum;
  }

  if (filters.localidades && filters.localidades.length > 0) {
    queryWhere.zonaId = { in: filters.localidades };
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

  let queryOrderBy: any = { createdAt: 'desc' };
  if (filters.ordenar === 'precio_asc') queryOrderBy = { precio: 'asc' };
  if (filters.ordenar === 'precio_desc') queryOrderBy = { precio: 'desc' };
  if (filters.ordenar === 'sup_asc') queryOrderBy = { superficieTotal: 'asc' };
  if (filters.ordenar === 'sup_desc') queryOrderBy = { superficieTotal: 'desc' };

  const resultados = await prisma.propiedad.findMany({
    where: queryWhere,
    include: {
      zona: true,
      tipoInmueble: { include: { padre: true } }
    },
    orderBy: queryOrderBy
  });

  return resultados.map(prop => sanearParaServer(prop));
}

export async function getPropiedadById(propertyId: number) {
  const propiedad = await prisma.propiedad.findUnique({
    where: { id: propertyId },
    include: {
      zona: { include: { padre: true } },
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
    propertyId? getPropiedadById(propertyId) : null,
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