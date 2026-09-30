'use server';

import { prisma } from '@/backend/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const colegaSchema = z.object({
  nombre: z.string().optional().nullable(),
  apellido: z.string().optional().nullable(),
  inmobiliaria: z.string().min(1, 'El nombre de la inmobiliaria es obligatorio'),
  telefono: z.string().optional().nullable(),
  email: z.string().email('Email inválido').optional().or(z.literal('')).nullable(),
  notasPrivadas: z.string().optional().nullable(),
});

export type ColegaFormValues = z.infer<typeof colegaSchema>;

export async function saveColegaAction(data: ColegaFormValues, id?: number) {
  try {
    const validated = colegaSchema.parse(data);

    if (id) {
      const colega = await prisma.colega.update({
        where: { id },
        data: {
          nombre: validated.nombre || null,
          apellido: validated.apellido || null,
          inmobiliaria: validated.inmobiliaria,
          telefono: validated.telefono || null,
          email: validated.email || null,
          notasPrivadas: validated.notasPrivadas || null,
        },
      });

      revalidatePath('/admin/colegas');
      //revalidatePath('/admin/crear');
      return { success: true, colega: colega };
    } else {
      const colega = await prisma.colega.create({
        data: {
          nombre: validated.nombre,
          apellido: validated.apellido,
          inmobiliaria: validated.inmobiliaria,
          telefono: validated.telefono || null,
          email: validated.email || null,
          notasPrivadas: validated.notasPrivadas || null,
        },
      });

      revalidatePath('/admin/colegas');
      //revalidatePath('/admin/crear');
      return { success: true, colega: colega };
    }
  } catch (error: any) {
    console.error('Error guardando colega:', error);
    return {
      success: false,
      error: error?.errors?.[0]?.message || 'Error al procesar el colega en la base de datos.',
    };
  }
}

export async function deleteColegaAction(id: number) {
  try {
    await prisma.colega.delete({ where: { id } });
    revalidatePath('/admin/colegas');
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar colega:', error);
    return { success: false, error: 'No se pudo eliminar el colega. Verifique que no tenga propiedades asociadas.' };
  }
}