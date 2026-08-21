'use server';

import { prisma } from '@/backend/db';
import { revalidatePath } from 'next/cache';

// 1. Guardar o Editar Propietario
export async function savePropietarioAction(data: {
  id?: number;
  nombre: string;
  apellido?: string;
  telefono?: string;
  email?: string;
  notasPrivadas?: string;
}) {
  try {
    if (data.id) {
      await prisma.propietario.update({
        where: { id: data.id },
        data: {
          nombre: data.nombre,
          apellido: data.apellido || null,
          telefono: data.telefono || null,
          email: data.email || null,
          notasPrivadas: data.notasPrivadas || null,
        },
      });
    } else {
      await prisma.propietario.create({
        data: {
          nombre: data.nombre,
          apellido: data.apellido || null,
          telefono: data.telefono || null,
          email: data.email || null,
          notasPrivadas: data.notasPrivadas || null,
        },
      });
    }
    revalidatePath('/admin/propietarios');
    return { success: true };
  } catch (error) {
    console.error('Error guardando propietario:', error);
    return { success: false, error: 'No se pudo guardar el propietario.' };
  }
}

// 2. Desvincular Propiedad de este propietario
export async function unassignPropietarioAction(propertyId: number) {
  try {
    await prisma.propiedad.update({
      where: { id: propertyId },
      data: { propietarioId: null },
    });
    revalidatePath('/admin/propietarios');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error al desvincular la propiedad.' };
  }
}

// 3. Vincular Propiedad libre a este propietario
export async function assignPropietarioAction(propertyId: number, propietarioId: number) {
  try {
    await prisma.propiedad.update({
      where: { id: propertyId },
      data: {
        propietarioId,
        colegaId: null, // Si pertenecía a un colega, ahora pasa a ser cartera propia
      },
    });
    revalidatePath('/admin/propietarios');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error al vincular la propiedad.' };
  }
}