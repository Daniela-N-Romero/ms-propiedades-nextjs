'use server'
import { prisma } from '@/backend/db';
import { revalidatePath } from 'next/cache';

export async function toggleDestacadaAction(id: number, currentIsFeatured: boolean) {
  try {
    const updated = await prisma.propiedad.update({
      where: { id },
      data: { isDestacada: !currentIsFeatured }, // Cambia de true a false o viceversa
    });

    // Revalidamos las rutas para que se actualice la lista del admin y la Home pública
    revalidatePath('/admin/propiedades');
    revalidatePath('/propiedades');
    revalidatePath('/');

    return { success: true, isFeatured: updated.isDestacada };
  } catch (error) {
    console.error('Error al cambiar estado de destacada:', error);
    return { success: false, error: 'No se pudo actualizar la propiedad' };
  }
}