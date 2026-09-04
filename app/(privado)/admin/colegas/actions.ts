'use server';

import { prisma } from '@/backend/db';
import { revalidatePath } from 'next/cache';

// 1. Guardar o Editar Colega
export async function saveColegaAction(data: {
  id?: number;
  nombre: string;
  apellido: string;
  inmobiliaria: string;
  telefono?: string;
  email?: string;
  notasPrivadas?: string;
}) {
  try {
    if (data.id) {
      await prisma.colega.update({
        where: { id: data.id },
        data: {
          nombre: data.nombre,
          apellido: data.apellido,
          inmobiliaria: data.inmobiliaria,
          telefono: data.telefono || null,
          email: data.email || null,
          notasPrivadas: data.notasPrivadas || null,
        },
      });
    } else {
      await prisma.colega.create({
        data: {
          nombre: data.nombre,
          apellido: data.apellido,
          inmobiliaria: data.inmobiliaria,
          telefono: data.telefono || null,
          email: data.email || null,
          notasPrivadas: data.notasPrivadas || null,
        },
      });
    }
    revalidatePath('/admin/colegas');
    return { success: true };
  } catch (error) {
    console.error('Error guardando colega:', error);
    return { success: false, error: 'No se pudo guardar el colega.' };
  }
}

// 2. Desvincular Propiedad de este colega
export async function unassignColegaAction(propertyId: number) {
  try {
    await prisma.propiedad.update({
      where: { id: propertyId },
      data: { colegaId: null },
    });
    revalidatePath('/admin/colegas');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error al desvincular la propiedad.' };
  }
}

// 3. Vincular Propiedad libre a este colega
export async function assignColegaAction(propertyId: number, colegaId: number) {
  try {
    await prisma.propiedad.update({
      where: { id: propertyId },
      data: {
        colegaId,
        propietarioId: null,
        origen: 'fromColleague', // Sincroniza el origen a cartera de colega
      },
    });
    revalidatePath('/admin/colegas');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error al vincular la propiedad.' };
  }
}

// 4. Eliminar Colega (sus propiedades pasarán automáticamente a null / Sin Asignar)
export async function deleteColegaAction(id: number) {
  try {
    await prisma.colega.delete({
      where: { id },
    });

    revalidatePath('/admin/colegas');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar colega:', error);
    return { success: false, error: 'No se pudo eliminar el colega.' };
  }
}