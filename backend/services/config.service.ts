import { prisma } from '@/backend/db';
import { links as defaultLinks } from '@/config/contact-info';

export async function getContactLinks() {
  try {
    const config = await prisma.configuracionEmpresa.findUnique({
      where: { id: 1 },
    });

    if (!config) return defaultLinks;

    return {
      instagram: config.instagram || defaultLinks.instagram,
      facebook: config.facebook || defaultLinks.facebook,
      whatsapp: `https://wa.me/${config.telefono}` || defaultLinks.whatsapp,
      linkedIn: config.linkedin || defaultLinks.linkedIn,
      telefono: config.telefono || defaultLinks.telefono,
      direccion: config.direccion || defaultLinks.direccion,
      email: config.email || defaultLinks.email,
    };
  } catch (error) {
    // Si la DB aún no tiene la tabla creada, usamos los defaults sin romper el sitio
    return defaultLinks;
  }
}

// Función que usará el Panel de Administración para guardar cambios
export async function updateConfiguracionEmpresa(data: any) {
  return await prisma.configuracionEmpresa.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data }
  });
}