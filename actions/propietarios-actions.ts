'use server';

import { prisma } from '@/backend/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const propietarioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  email: z.string().email('Email inválido').optional().or(z.literal('')).nullable(),
  notasPrivadas: z.string().optional().nullable(),
});

export type PropietarioFormInput = z.infer<typeof propietarioSchema>;

export async function savePropietarioAction(data: PropietarioFormInput, id?: number) {
  try {
    const validated = propietarioSchema.parse(data);

    if (id) {
      const propietario = await prisma.propietario.update({
        where: { id },
        data: {
          nombre: validated.nombre.trim(),
          apellido: validated.apellido?.trim() || null,
          telefono: validated.telefono?.trim() || null,
          email: validated.email?.trim() || null,
          notasPrivadas: validated.notasPrivadas?.trim() || null,
        },
      });

      revalidatePath('/admin/propietarios');
      //revalidatePath('/admin/crear');
      return { success: true, propietario };
    } else {
      const propietario = await prisma.propietario.create({
        data: {
          nombre: validated.nombre.trim(),
          apellido: validated.apellido?.trim() || null,
          telefono: validated.telefono?.trim() || null,
          email: validated.email?.trim() || null,
          notasPrivadas: validated.notasPrivadas?.trim() || null,
        },
      });

      revalidatePath('/admin/propietarios');
      //revalidatePath('/admin/crear');
      return { success: true, propietario };
    }
  } catch (error: any) {
    console.error('Error guardando propietario:', error);
    return {
      success: false,
      error: error?.errors?.[0]?.message || 'No se pudo guardar el propietario.',
    };
  }
}

export async function deletePropietarioAction(id: number) {
  try {
    await prisma.propietario.delete({ where: { id } });
    revalidatePath('/admin/propietarios');
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar propietario:', error);
    return { success: false, error: 'No se pudo eliminar el propietario. Verifique que no tenga propiedades asociadas.' };
  }
}