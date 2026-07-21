// src/backend/services/property.service.ts
import { prisma } from '../db';
import { Propiedad, TipoOperacionEnum, MonedaEnum } from '@prisma-client'

export async function getDestacadas() {
  const destacadas =  await prisma.propiedad.findMany({
    where: { isPublished: true, isDestacada: true },
    include: { zona: true, tipoInmueble: true },
    orderBy: { createdAt: 'desc' }
  });
  
  return destacadas.map(prop => sanearPropiedadParaServer(prop));  
}

// TO DO: Futuro CRUD PRINCIPAL del panel de administración:
export async function createPropiedad(data: any) { /* ... */ }
export async function updatePropiedad(id: number, data: any) { /* ... */ }
export async function deletePropiedad(id: number) { /* ... */ }


// METODOS GET ESPECIALES
//trae los sutipos de propidades existentes segun tipo de mercado (industrial, residencial, etc)
export async function getSubtiposPorTipoMercado(mercadoSlug: string) {
  return await prisma.tipoInmueble.findMany({
    where: {
      padre: { slug: mercadoSlug },
      propiedades: {
        some: { isPublished: true } // Solo donde haya stock real
      }
    },
    orderBy: { nombre: 'asc' }
  });
}

//trae la propiedad indicada segun el slug
export async function getPropiedadBySlug(slug: string) {
  const propiedad = await prisma.propiedad.findUnique({
    where: {  slug, isPublished: true },
    include: {
      zona: { include: { padre: true } },
      tipoInmueble: { include: { padre: true } },
      agente: true,
      imagenes: { orderBy: { orden: 'asc' } }
    }
  });
  if (!propiedad) return null;

  return sanearPropiedadParaServer(propiedad);  
}

//BUSQUEDA POR FILTROS

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

  if (filters.subtiposSlugs && filters.subtiposSlugs.length > 0) {
    // Si filtran un subtipo específico (ej: "nave-industrial")
    queryWhere.tipoInmueble = { slug: { in: filters.subtiposSlugs } };
  } else if (filters.mercadoSlug) {
    // Si filtran el mercado completo (ej: "industrial"), buscamos donde el PADRE sea "industrial"
    queryWhere.tipoInmueble = {
      padre: { slug: filters.mercadoSlug }
    };  
  }  


  // Filtrado de Moneda Obligatorio (Evita cruzar USD con ARS)
  queryWhere.moneda = (filters.moneda as MonedaEnum) || MonedaEnum.USD;

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

  return resultados.map(prop => sanearPropiedadParaServer(prop));  
}  

const sanearPropiedadParaServer = (propiedad: Propiedad) => {
 return  { ...propiedad,
    precio: Number(propiedad.precio),
    superficieTotal: propiedad.superficieTotal ? Number(propiedad.superficieTotal) : null,
    superficieCubierta: propiedad.superficieCubierta ? Number(propiedad.superficieCubierta) : null,
    latitud: propiedad.latitud ? Number(propiedad.latitud) : null,
    longitud: propiedad.longitud ? Number(propiedad.longitud) : null
 }
}
  