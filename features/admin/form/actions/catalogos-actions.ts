'use server';

import { prisma } from '@/backend/db';
import { revalidatePath } from 'next/cache';

// CREAR PROPIETARIO RÁPIDO
export async function createPropietarioAction(formData: {
  nombre: string;
  apellido?: string;
  telefono?: string;
  email?: string;
  notasPrivadas?: string;
}) {
  try {
    if (!formData.nombre || formData.nombre.trim() === '') {
      return { success: false, error: 'El nombre es obligatorio.' };
    }

    const nuevoPropietario = await prisma.propietario.create({
      data: {
        nombre: formData.nombre.trim() || null,
        apellido: formData.apellido?.trim() || null,
        telefono: formData.telefono?.trim() || null,
        email: formData.email?.trim() || null,
        notasPrivadas: formData.notasPrivadas?.trim() || null,
      },
    });

    revalidatePath('/admin');
    return { success: true, propietario: nuevoPropietario };
  } catch (error) {
    console.error('Error creando propietario:', error);
    return { success: false, error: 'No se pudo crear el propietario.' };
  }
}

// CREAR COLEGA RÁPIDO
export async function createColegaAction(formData: {
  nombre?: string;
  apellido?: string;
  inmobiliaria?: string;
  telefono?: string;
  email?: string;
  notasPrivadas?: string;
}) {
  try {
    if (!formData.inmobiliaria || formData.inmobiliaria.trim() === '') {
      return { success: false, error: 'El nombre de la inmobiliaria es obligatorio.' };
    }

    const nuevoColega = await prisma.colega.create({
      data: {
        nombre: formData.nombre?.trim() || null,
        apellido: formData.apellido?.trim() || null,
        inmobiliaria: formData.inmobiliaria?.trim() || null,
        telefono: formData.telefono?.trim() || null,
        email: formData.email?.trim() || null,
        notasPrivadas: formData.notasPrivadas?.trim() || null,
      },
    });

    revalidatePath('/admin');
    return { success: true, colega: nuevoColega };
  } catch (error) {
    console.error('Error creando colega:', error);
    return { success: false, error: 'No se pudo crear el colega.' };
  }
}

//CREAR ZONA RÁPIDO
export async function createZonaAction(data: {
  nombre: string;
  padreId?: number | null;
}) {
  try {
    if (!data.nombre.trim()) {
      return { success: false, error: 'El nombre de la ubicación es obligatorio.' };
    }

    const nuevaZona = await prisma.zona.create({
      data: {
        nombre: data.nombre.trim(),
        padreId: data.padreId || null,
      },
    });

    revalidatePath('/admin/crear');
    revalidatePath('/admin/dashboard');

    return { success: true, zona: nuevaZona };
  } catch (error) {
    console.error('Error creando zona:', error);
    return { success: false, error: 'No se pudo crear la ubicación.' };
  }
}