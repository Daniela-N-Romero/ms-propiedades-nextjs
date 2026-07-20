// src/backend/services/property.service.ts
import { prisma } from '../db';
import { Zona } from '@prisma-client'
import { TipoPropiedadEnum } from '@/prisma/generated/enums';

//GET ZONAS Y LOCALIDADES
export async function getZonas(): Promise<Zona[]> {
  return await prisma.zona.findMany({
    orderBy: { nombre: 'asc' }
  });
}

export async function getLocalidadesHijas() { 
  return await prisma.zona.findMany({ 
    where: { padreId: { not: null } }, 
    orderBy: { nombre: 'asc' } 
  }); 
}

//GET ZONAS Y LOCALIDADES PARA PROPIEDADES CON PUBLISHED: TRUE

export async function getZonasActivas(): Promise<Zona[]> {
  return await prisma.zona.findMany({
    where: {
      OR: [
        { propiedades: { some: { isPublished: true } } },
        { hijas: { some: { propiedades: { some: { isPublished: true } } } } }
      ]
    },
    orderBy: { nombre: 'asc' }
  });
}

export async function getLocalidadesActivasPorTipo(tipo: TipoPropiedadEnum) {
  return await prisma.zona.findMany({
    where: {
      padreId: { not: null },
      propiedades: {
        some: {
          isPublished: true,
          tipo: tipo 
        }
      }
    },
    orderBy: { nombre: 'asc' }
  });
}