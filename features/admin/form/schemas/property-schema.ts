// features/admin/form/schemas/property-schema.ts
import { z } from 'zod';

const coerceOptionalNumber = () =>
  z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().nullable().optional()
  );

const coerceNumber = (msg: string) =>
  z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number({ message: msg })
  );

// ----------------------------------------------------
// 1. SCHEMA PARA BORRADOR (Validación laxa/mínima)
// ----------------------------------------------------
export const draftPropertySchema = z.object({
  titulo: z.string().min(3, 'Escriba un título de al menos 3 caracteres'),
  
  // Relaciones mínimas de base de datos
  tipoInmuebleId: coerceNumber('Debe seleccionar un tipo de inmueble').refine((val) => val >= 1, 'Debe seleccionar un tipo de inmueble'),
  agenteId: coerceNumber('Debe asignar un agente responsable').refine((val) => val >= 1, 'Debe asignar un agente responsable'),
  zonaId: coerceNumber('Debe seleccionar una localidad/zona').refine((val) => val >= 1, 'Debe seleccionar una localidad/zona'),

  // Todo lo demás es opcional para el borrador
  categoria: z.string().optional(),
  origen: z.string().optional(),
  precio: coerceOptionalNumber(),
  moneda: z.string().optional(),
  financiacion: z.string().optional().nullable(),
  descripcion: z.string().optional(),
  direccionPersonalizada: z.string().optional(),
  latitud: coerceOptionalNumber(),
  longitud: coerceOptionalNumber(),
  isMapConfirmed: z.boolean().optional(),
  superficieTotal: coerceOptionalNumber(),
  superficieCubierta: coerceOptionalNumber(),
  propietarioId: coerceOptionalNumber(),
  colegaId: coerceOptionalNumber(),
  videoUrl: z.string().optional(),
  pdfUrl: z.string().optional(),
  isPublished: z.boolean().default(false),
  isUnlisted: z.boolean().default(false),
  isDestacada: z.boolean().default(false),
  notasPrivadas: z.string().optional(),
  caracteristicas: z.record(z.string(), z.any()).optional(),
  imagenes: z.array(z.string()).default([]),
});

// ----------------------------------------------------
// 2. SCHEMA PARA PUBLICACIÓN (Validación estricta al 100%)
// ----------------------------------------------------
export const publishPropertySchema = z.object({
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  categoria: z.enum(['venta', 'alquiler'], {
    message: 'Debe seleccionar una operación (Venta o Alquiler)',
  }),

  origen: z.enum(['own', 'fromColleague'], {
    message: 'Debe seleccionar el origen de la cartera',
  }),

  precio: coerceNumber('Ingrese un precio válido').refine((val) => val > 0, 'El precio debe ser mayor a 0'),
  moneda: z.enum(['USD', 'ARS'], {
    message: 'Debe seleccionar el tipo de moneda',
  }),
  financiacion: z.string().optional().nullable(),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),

  zonaId: coerceNumber('Debe seleccionar una localidad/zona').refine((val) => val >= 1, 'Debe seleccionar una localidad/zona'),
  direccionPersonalizada: z.string().optional(),
  latitud: coerceNumber('Latitud inválida o no seleccionada'),
  longitud: coerceNumber('Longitud inválida o no seleccionada'),
  isMapConfirmed: z.boolean().refine((val) => val === true, {
    message: 'Debe confirmar que la ubicación en el mapa es correcta',
  }),

  superficieTotal: coerceNumber('Ingrese la superficie total').refine((val) => val > 0, 'La superficie total debe ser mayor a 0'),
  superficieCubierta: coerceNumber('Ingrese la superficie cubierta').refine((val) => val >= 0, 'La superficie cubierta debe ser un número válido'),

  tipoInmuebleId: coerceNumber('Debe seleccionar un tipo de inmueble').refine((val) => val >= 1, 'Debe seleccionar un tipo de inmueble'),
  agenteId: coerceNumber('Debe asignar un agente responsable').refine((val) => val >= 1, 'Debe asignar un agente responsable'),

  propietarioId: coerceOptionalNumber(),
  colegaId: coerceOptionalNumber(),

  videoUrl: z.string().optional(),
  pdfUrl: z.string().optional(),

  isPublished: z.boolean().default(true), // 👈 Fuerza Publicación
  isUnlisted: z.boolean().default(false),
  isDestacada: z.boolean().default(false),
  notasPrivadas: z.string().optional(),

  caracteristicas: z.record(z.string(), z.any()).optional(),

  imagenes: z
    .array(z.string())
    .min(1, 'Debe incluir al menos una imagen o la imagen por defecto'),
});

export type PropertyFormValues = z.infer<typeof publishPropertySchema>;