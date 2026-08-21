// features/admin/form/schemas/property-schema.ts
import { z } from 'zod';

const coerceOptionalNumber = () =>
  z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().nullable().optional()
  );

  const coerceNullableNumber = () =>
  z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().nullable()
  );

const coerceNumber = (msg: string) =>
z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return undefined;
    // Reemplaza comas por puntos para que Number() de JS lea decimales como 0.5
    const clean = String(val).replace(/\./g, '').replace(',', '.');
    return Number(clean);
  }, z.number({ message: msg }));

// ----------------------------------------------------
// 1. SCHEMA PARA BORRADOR (Validación laxa/mínima)
// ----------------------------------------------------
export const draftPropertySchema = z.object({
  titulo: z.string().min(3, 'Escriba un título de al menos 3 caracteres'),
  slug: z.string().optional(),
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
  permitMetaAd: z.boolean().default(false),
  imagenMetaUrl: z.string().optional().nullable(),
});

// ----------------------------------------------------
// 2. SCHEMA PARA PUBLICACIÓN (Validación estricta al 100%)
// ----------------------------------------------------
export const basePublishPropertySchema = z.object({
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  slug: z.string().optional(),
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

  propietarioId: coerceNullableNumber(),
  colegaId: coerceNullableNumber(),

  videoUrl: z.string().optional(),
  pdfUrl: z.string().optional(),

  isPublished: z.boolean().default(true),
  isUnlisted: z.boolean().default(false),
  isDestacada: z.boolean().default(false),
  notasPrivadas: z.string().optional(),

  caracteristicas: z.record(z.string(), z.any()).optional(),

  permitMetaAd: z.boolean().default(false),
  imagenMetaUrl: z.string().optional().nullable(),
  imagenes: z
    .array(z.string())
    .min(1, 'Debe incluir al menos una imagen o la imagen por defecto'),
})

// Inferimos el tipo ANTES de aplicar .superRefine() para evitar la referencia circular
export type PropertyFormValues = z.infer<typeof basePublishPropertySchema>;

// Refinamos el esquema y lo exportamos
export const publishPropertySchema = basePublishPropertySchema.superRefine((data, ctx) => {

  const colegaIdNum = Number(data.colegaId);
  const propietarioIdNum = Number(data.propietarioId);

  // Si es De Colega y no seleccionó un ID válido (> 0)
  if (data.origen === 'fromColleague' && (!colegaIdNum || isNaN(colegaIdNum) || colegaIdNum <= 0)) {
    ctx.addIssue({
      code: 'custom',
      path: ['colegaId'],
      message: 'Debe seleccionar la Inmobiliaria Colega de origen.',
    });
  }

  // Si es Cartera Propia y no seleccionó Propietario (> 0)
  if (data.origen === 'own' && (!propietarioIdNum || isNaN(propietarioIdNum) || propietarioIdNum <= 0)) {
    ctx.addIssue({
      code: 'custom',
      path: ['propietarioId'],
      message: 'Debe seleccionar el Propietario asignado.',
    });
  }
});