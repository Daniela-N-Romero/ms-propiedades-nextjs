// src/backend/services/property.service.ts
import { prisma } from '../db';
import { Propiedad } from '@prisma-client'
import { MonedaEnum, TipoPropiedadEnum } from '@/prisma/generated/enums';

export async function getDestacadas(): Promise<Propiedad[]> {
  return await prisma.propiedad.findMany({
    where: { isPublished: true, isDestacada: true },
    include: { zona: true },
    orderBy: { createdAt: 'desc' }
  });
}

// TO DO: Futuro CRUD del panel de administración:
export async function createPropiedad(data: any) { /* ... */ }
export async function updatePropiedad(id: number, data: any) { /* ... */ }
export async function deletePropiedad(id: number) { /* ... */ }


//BUSQUEDA POR FILTROS

interface SearchFilters {
  categoria?: string;
  tipo?: string;
  subtipo?: string;
  moneda?: string;
  precioMin?: number;
  precioMax?: number;
  supMin?: number;
  supMax?: number;
  localidades?: number[];
  ordenar?: string;
}

export async function searchPropiedades(filters: SearchFilters) {
  const queryWhere: any = { isPublished: true, tipo: filters.tipo };

  if (filters.subtipo) queryWhere.subtipo = filters.subtipo;
  if (filters.categoria) queryWhere.categoria = filters.categoria;
  if (filters.tipo) queryWhere.tipo = filters.tipo;

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

  let queryOrderBy: any = { createdAt: 'desc' };
  if (filters.ordenar === 'precio_asc') queryOrderBy = { precio: 'asc' };
  if (filters.ordenar === 'precio_desc') queryOrderBy = { precio: 'desc' };
  if (filters.ordenar === 'sup_asc') queryOrderBy = { superficieTotal: 'asc' };
  if (filters.ordenar === 'sup_desc') queryOrderBy = { superficieTotal: 'desc' };

  const resultados = await prisma.propiedad.findMany({
    where: queryWhere,
    include: { zona: true },
    orderBy: queryOrderBy
  });

  return resultados.map(prop => ({
    ...prop,
    precio: Number(prop.precio),
    superficieTotal: prop.superficieTotal ? Number(prop.superficieTotal) : null,
    superficieCubierta: prop.superficieCubierta ? Number(prop.superficieCubierta) : null,
    latitud: prop.latitud ? Number(prop.latitud) : null,
    longitud: prop.longitud ? Number(prop.longitud) : null,
  }));

}
//trae los sutipos de propidades existentes
export async function getSubtiposPorTipo(tipo: TipoPropiedadEnum): Promise<string[]> {
  const propiedades = await prisma.propiedad.findMany({
    where: { isPublished: true, tipo },
    select: { subtipo: true },
    distinct: ['subtipo'], 
  });

  // Filtramos nulos o vacíos
  return propiedades.map(p => p.subtipo).filter(Boolean) as string[];
}