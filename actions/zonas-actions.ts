'use server';

import { prisma } from '@/backend/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const zonaSchema = z.object({
  nombre: z.string().min(1, 'El nombre de la ubicación es obligatorio'),
  padreId: z.number().optional().nullable(),
});

export type ZonaFormInput = z.infer<typeof zonaSchema>;

export async function saveZonaAction(data: ZonaFormInput, id?: number) {
  try {
    const validated = zonaSchema.parse(data);

    if (id) {
      const zona = await prisma.zona.update({
        where: { id },
        data: {
          nombre: validated.nombre.trim(),
          padreId: validated.padreId || null,
        },
      });

      revalidatePath('/admin/crear');
      revalidatePath('/admin/dashboard');
      return { success: true, zona };
    } else {
      const zona = await prisma.zona.create({
        data: {
          nombre: validated.nombre.trim(),
          padreId: validated.padreId || null,
        },
      });

      revalidatePath('/admin/crear');
      revalidatePath('/admin/dashboard');
      return { success: true, zona };
    }
  } catch (error: any) {
    console.error('Error guardando zona:', error);
    return {
      success: false,
      error: error?.errors?.[0]?.message || 'No se pudo guardar la ubicación.',
    };
  }
}