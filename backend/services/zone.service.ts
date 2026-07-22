import { prisma } from '@/backend/db';
import type { Zona } from '@prisma-client'
import { TipoInmueble, TipoOperacionEnum } from '@prisma-client';

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

export async function getLocalidadesActivasPorTipo(mercadoSlug: string, categoria?: string) {
  
  const wherePropiedad: any = {
    isPublished: true,
    tipoInmueble: {
      padre: { slug: mercadoSlug }
    }
  };

  if (categoria) {
    wherePropiedad.categoria = categoria as TipoOperacionEnum;
  }
  
  return await prisma.zona.findMany({
    where: {
      padreId: { not: null },
      propiedades: {
        some: wherePropiedad 
      }
    },
    include: {
      padre: true 
    },
    orderBy: [
      { padre: { nombre: 'asc' } },
      { nombre: 'asc' }
    ]
  });
}
