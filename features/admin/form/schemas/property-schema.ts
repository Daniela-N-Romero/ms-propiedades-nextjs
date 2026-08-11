import { z } from 'zod';


const coerceNumber = (msg: string) =>
  z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number({ message: msg })
  );

const coerceOptionalNumber = () =>
  z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : Number(val)),
    z.number().nullable().optional()
  );

export const propertyFormSchema = z.object({
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  categoria: z.enum(['venta', 'alquiler']),
  origen: z.enum(['own', 'fromColleague']),

  // Números estrictos para React Hook Form
  precio: coerceNumber('Ingrese un precio válido').refine((val) => val >= 0, 'El precio debe ser un número positivo'),
  moneda: z.enum(['USD', 'ARS']),
  descripcion: z.string().optional(),

  // Ubicación
  zonaId: coerceNumber('Debe seleccionar una localidad/zona').refine((val) => val >= 1, 'Debe seleccionar una localidad/zona'),
  direccionPersonalizada: z.string().optional(),
  latitud: coerceNumber('Latitud inválida o no seleccionada'),
  longitud: coerceNumber('Longitud inválida o no seleccionada'),

  // Superficies
  superficieTotal: coerceOptionalNumber(),
  superficieCubierta: coerceOptionalNumber(),

  // Relaciones
  tipoInmuebleId: coerceNumber('Debe seleccionar un tipo de inmueble').refine((val) => val >= 1, 'Debe seleccionar un tipo de inmueble'),
  agenteId: coerceNumber('Debe asignar un agente responsable').refine((val) => val >= 1, 'Debe asignar un agente responsable'),
  propietarioId: coerceOptionalNumber(),
  colegaId: coerceOptionalNumber(),

  // Multimedia
  videoUrl: z.string().optional(),
  pdfUrl: z.string().optional(),

  // Visibilidad y Notas
  isPublished: z.boolean().default(false),
  isUnlisted: z.boolean().default(false),
  isDestacada: z.boolean().default(false),
  notasPrivadas: z.string().optional(),

  // Objeto dinámico de características según el tipo de propiedad
  caracteristicas: z.record(z.string(), z.any()).optional(),

  // Galería de imágenes (URLs)
  imagenes: z.array(z.string()).min(1, 'Debe cargar al menos una imagen de portada'),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;