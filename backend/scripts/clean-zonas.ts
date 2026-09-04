import { prisma } from '@/backend/db';

export async function borrarRegionYDescendientes(nombreRegionABorrar: string) {
  try {
    // 1. Buscar la región padre por nombre (ej: "Pcia. de Buenos Aires")
    const regionPadre = await prisma.zona.findFirst({
      where: { nombre: { equals: nombreRegionABorrar, mode: 'insensitive' } },
      include: {
        hijas: {
          include: {
            hijas: true, // Localidades
          },
        },
      },
    });

    if (!regionPadre) {
      console.log(`No se encontró la región "${nombreRegionABorrar}".`);
      return;
    }

    // 2. Recolectar IDs de partidos y localidades hijas
    const partidosIds = regionPadre.hijas.map((p) => p.id);
    const localidadesIds = regionPadre.hijas.flatMap((p) => p.hijas.map((l) => l.id));

    // 3. Eliminar en orden (de más específico a más general) para evitar problemas de FK
    if (localidadesIds.length > 0) {
      await prisma.zona.deleteMany({
        where: { id: { in: localidadesIds } },
      });
    }

    if (partidosIds.length > 0) {
      await prisma.zona.deleteMany({
        where: { id: { in: partidosIds } },
      });
    }

    // 4. Eliminar la región principal
    await prisma.zona.delete({
      where: { id: regionPadre.id },
    });

    console.log(`✅ Región "${nombreRegionABorrar}" y todos sus sub-niveles fueron eliminados correctamente.`);
  } catch (error) {
    console.error('Error al borrar la región:', error);
  }
}

// Ejecutar
borrarRegionYDescendientes('Pcia. de Buenos Aires');