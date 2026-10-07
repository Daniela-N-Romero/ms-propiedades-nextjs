'use server';

import { prisma } from '@/backend/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Colega } from '@/prisma/generated/client'

interface ColegaIdOpcional extends Omit<Colega, 'id'> {
  id?: Colega['id']
}

const colegaSchema = z.object({
  nombre: z.string().optional().or(z.literal('')).nullable(),
  apellido: z.string().optional().or(z.literal('')).nullable(),
  inmobiliaria: z.string().min(1, 'El nombre de la inmobiliaria es obligatorio'),
  telefono: z.string().optional().or(z.literal('')).nullable(),
  email: z.string().email('Email inválido').optional().or(z.literal('')).nullable(),
  notasPrivadas: z.string().optional().or(z.literal('')).nullable(),
});

export type ColegaFormValues = z.infer<typeof colegaSchema>;

export async function saveColegaAction(data: ColegaFormValues, id?: number) {
  try {
    const validated = colegaSchema.parse(data);

    // Sanitización limpia: convertimos los vacíos "" en null explícito
    const payload = {
      nombre: validated.nombre?.trim() || null,
      apellido: validated.apellido?.trim() || null,
      inmobiliaria: validated.inmobiliaria.trim(),
      telefono: validated.telefono?.trim() || null,
      email: validated.email?.trim() || null,
      notasPrivadas: validated.notasPrivadas?.trim() || null,
    };

    let colega: ColegaIdOpcional;

    if (id) {
      colega = await prisma.colega.update({
        where: { id },
        data: payload,
      });
    } else {
      colega = await prisma.colega.create({
        data: payload,
      });
    }

    // Revalida todo el layout de admin para reflejar el cambio en cualquier pantalla
    revalidatePath('/admin', 'layout');

    return { success: true, colega };
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