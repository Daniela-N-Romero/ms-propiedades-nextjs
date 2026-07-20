// src/backend/services/property.service.ts
import { prisma } from '../db'; 
import {  Zona } from '@prisma-client'

export async function getZonas(): Promise<Zona[]>{
  return await prisma.zona.findMany({
    orderBy: { nombre: 'asc' }
  });
}

export async function getZonasActivas(): Promise<Zona[]>{
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