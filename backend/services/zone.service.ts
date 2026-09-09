import { prisma } from '@/backend/db';
import { sanearZona } from '@/lib/sanitizers';
import { sanearParaServer} from '@/lib/sanitizers';
import { ZonaServer } from '@/types/server-data';
import { TipoOperacionEnum } from '@prisma-client';
import { cache } from 'react';

// ZONAS Y LOCALIDADES

//Trae las zonas y localidades (TODAS, no importa si no hay propiedades ahi)
export async function getZonas() {
  const zonas = await prisma.zona.findMany({
    include: { padre: true },
    orderBy: { nombre: 'asc' },
  });
  return zonas.map(sanearZona);
}

//Trae solo las Zonas Padre / Regiones principales (ej. Zona Norte, GBA Sur, CABA).
export async function getZonasPadre() {
  const zonas = await prisma.zona.findMany({
    where: { padreId: null },
    orderBy: { nombre: 'asc' },
  });
  return zonas.map(sanearZona);
}

//Trae las localidades con su relacion con el padre (TODAS, no importa si no hay propiedades ahi)
export async function getLocalidadesHijas() { 
  const localidades = await prisma.zona.findMany({ 
    where: { padreId: { not: null } },
    include: { padre: true },
    orderBy: { nombre: 'asc' } 
  }); 
  return localidades.map(sanearZona);
}
//Trae todas las localidades de la BD (Hijas) en una lista plana sin relaciones
export async function getLocalidadesPorPadre(padreId?: number) {
  const localidades = await prisma.zona.findMany({
    where: {
      padreId: padreId ? padreId : { not: null }, // Si hay id filtra por ese padre, sino trae todas las hijas
    },
    orderBy: { nombre: 'asc' },
  });
  return localidades.map(sanearZona);
}
//Trae todas las zonas de la BD (Padres e Hijas) en una lista plana sin relaciones
export async function getZonasTodas() {
  const zonas = await prisma.zona.findMany({ orderBy: { nombre: 'asc' } });
  return zonas.map(sanearZona);
}

// GET ZONAS Y LOCALIDADES PARA PROPIEDADES CON PUBLISHED: TRUE
//[Padres e Hijas + Publicadas]
export const getZonasActivas = cache(async () => {
  try {
    const zonas = await prisma.zona.findMany({
      orderBy: { nombre: 'asc' },
    });

    // Nos aseguramos de devolver el array saneado
    return sanearParaServer(zonas) as unknown as ZonaServer[];
  } catch (error) {
    console.error('Error al traer zonas:', error);
    return [];
  }
});

//[Solo Hijas + Publicadas + Filtra por Tipo/Categoría]
export async function getLocalidadesActivasPorTipo(mercadoSlug: string, categoria?: string) {
const wherePropiedad: any = {
    isPublished: true,
  };

  if (mercadoSlug && mercadoSlug !== 'todas') {
    wherePropiedad.tipoInmueble = {
      OR: [
        { padre: { slug: { equals: mercadoSlug, mode: 'insensitive' } } },
        { slug: { equals: mercadoSlug, mode: 'insensitive' } },
      ],
    };
  }

  // 2. Filtrar por categoría (Venta / Alquiler) si viene especificada
  if (categoria) {
    wherePropiedad.categoria = categoria as TipoOperacionEnum;
  }
  
  const localidades = await prisma.zona.findMany({
    where: {
      padreId: { not: null }, // Solo localidades hijas (ej: Berazategui, Ezeiza)
      propiedades: {
        some: wherePropiedad // Que tengan al menos 1 propiedad publicada con estos criterios
      }
    },
    include: {
    padre: {
      include: {
        padre: true, 
      },
    },
  },
    orderBy: [
      { padre: { nombre: 'asc' } },
      { nombre: 'asc' }
    ]
  });

  return localidades.map(sanearZona);
}