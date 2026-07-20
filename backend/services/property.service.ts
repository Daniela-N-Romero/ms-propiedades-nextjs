// src/backend/services/property.service.ts
import { prisma } from '../db'; 
import { Propiedad } from '@prisma-client'

export async function getDestacadas(): Promise<Propiedad[]> {
  return await prisma.propiedad.findMany({
    where: {
      isPublished: true,
      isDestacada: true
    },
    include: {
      zona: true 
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

// TO DO: Futuro CRUD del panel de administración:
export async function createPropiedad(data: any) { /* ... */ }
export async function updatePropiedad(id: number, data: any) { /* ... */ }
export async function deletePropiedad(id: number) { /* ... */ }

