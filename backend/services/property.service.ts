// src/backend/services/property.service.ts
import { prisma } from '../db'; 
import { Propiedad, Zona } from '@prisma-client'

export async function getDestacadas(): Promise<Propiedad[]> {
  return await prisma.propiedad.findMany({
    where: {
      isPublished: true,
    },
    take: 6 // Trae solo 6 para el Home
  });
}

export async function getZonas(): Promise<Zona[]>{
  return await prisma.zona.findMany({
    orderBy: { nombre: 'asc' }
  });
}