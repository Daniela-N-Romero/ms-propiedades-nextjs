// backend/db/seed-zonas.ts
import { prisma } from '@/backend/db';

const ESTRUCTURA_TIPOS = [
  {
    nombre: 'Industrial',
    slug: 'industrial',
    hijos: [
      { nombre: 'Nave Industrial', slug: 'nave_industrial' },
      { nombre: 'Galpón / Depósito', slug: 'galpon' },
      { nombre: 'Lote en Parque Ind.', slug: 'lote_parque_industrial' },
      { nombre: 'Lote Industrial', slug: 'lote_industrial' },
    ],
  },
  {
    nombre: 'Comercial',
    slug: 'comercial',
    hijos: [
      { nombre: 'Local Comercial', slug: 'local' },
      { nombre: 'Oficina', slug: 'oficina' },
      { nombre: 'Edificio Comercial', slug: 'edificio_comercial' },
    ],
  },
  {
    nombre: 'Residencial',
    slug: 'residencial',
    hijos: [
      { nombre: 'Casa', slug: 'casa' },
      { nombre: 'Departamento', slug: 'departamento' },
      { nombre: 'Lote / Terreno', slug: 'terreno' },
      { nombre: 'Lote en Barrio Cerrado', slug: 'lote_interno' },
      { nombre: 'Quinta', slug: 'quinta' },
    ],
  },
  {
    nombre: 'Rural',
    slug: 'rural',
    hijos: [
      { nombre: 'Chacra / Campo', slug: 'campo' },
      { nombre: 'Fracción Rural', slug: 'fraccion_rural' },
    ],
  },
];

const REGIONES_ESTRUCTURA = [
  {
    nombre: 'GBA Sur',
    latitud: -34.78,
    longitud: -58.28,
    partidos: [
      {
        nombre: 'Berazategui',
        latitud: -34.763,
        longitud: -58.211,
        localidades: [
          { nombre: 'Berazategui', latitud: -34.763, longitud: -58.211 },
          { nombre: 'Guillermo E. Hudson', latitud: -34.793, longitud: -58.156 },
          { nombre: 'El Pato', latitud: -34.881, longitud: -58.181 },
          { nombre: 'Ranelagh', latitud: -34.788, longitud: -58.198 },
          { nombre: 'Plátanos', latitud: -34.785, longitud: -58.178 },
          { nombre: 'Sourigues', latitud: -34.809, longitud: -58.209 },
          { nombre: 'Pereyra', latitud: -34.838, longitud: -58.102 },
          { nombre: 'Gutierrez', latitud: -34.821, longitud: -58.182 },
        ],
      },
      {
        nombre: 'Quilmes',
        latitud: -34.72,
        longitud: -58.253,
        localidades: [
          { nombre: 'Quilmes', latitud: -34.72, longitud: -58.253 },
          { nombre: 'Bernal', latitud: -34.706, longitud: -58.28 },
          { nombre: 'Don Bosco', latitud: -34.7, longitud: -58.29 },
          { nombre: 'Ezpeleta', latitud: -34.75, longitud: -58.233 },
          { nombre: 'San Francisco Solano', latitud: -34.776, longitud: -58.318 },
        ],
      },
      {
        nombre: 'Ezeiza',
        latitud: -34.854,
        longitud: -58.522,
        localidades: [
          { nombre: 'Ezeiza', latitud: -34.854, longitud: -58.522 },
          { nombre: 'Canning', latitud: -34.876, longitud: -58.508 },
          { nombre: 'Carlos Spegazzini', latitud: -34.907, longitud: -58.618 },
          { nombre: 'Tristán Suárez', latitud: -34.89, longitud: -58.563 },
          { nombre: 'La Unión', latitud: -34.86, longitud: -58.54 },
        ],
      },
      {
        nombre: 'La Plata',
        latitud: -34.921,
        longitud: -57.954,
        localidades: [
          { nombre: 'La Plata', latitud: -34.921, longitud: -57.954 },
          { nombre: 'Abasto', latitud: -34.977, longitud: -58.077 },
          { nombre: 'Villa Elisa', latitud: -34.84, longitud: -58.09 },
          { nombre: 'City Bell', latitud: -34.872, longitud: -58.048 },
          { nombre: 'Gonnet', latitud: -34.887, longitud: -58.017 },
          { nombre: 'Lisandro Olmos', latitud: -35.054, longitud: -58.085 },
          { nombre: 'Tolosa', latitud: -34.897, longitud: -57.971 },
          { nombre: 'Los Hornos', latitud: -34.954, longitud: -57.989 },
          { nombre: 'San Carlos', latitud: -34.935, longitud: -57.999 },
        ],
      },
      {
        nombre: 'Florencio Varela',
        latitud: -34.795,
        longitud: -58.276,
        localidades: [
          { nombre: 'Florencio Varela', latitud: -34.795, longitud: -58.276 },
          { nombre: 'Ingeniero Juan Allan', latitud: -34.882, longitud: -58.198 },
          { nombre: 'Bosques', latitud: -34.821, longitud: -58.232 },
          { nombre: 'Villa Vatteone', latitud: -34.811, longitud: -58.272 },
          { nombre: 'Gobernador Costa', latitud: -34.786, longitud: -58.308 },
        ],
      },
      {
        nombre: 'Esteban Echeverría',
        latitud: -34.818,
        longitud: -58.461,
        localidades: [
          { nombre: 'Monte Grande', latitud: -34.809, longitud: -58.461 },
          { nombre: 'El Jagüel', latitud: -34.852, longitud: -58.499 },
          { nombre: 'Luis Guillón', latitud: -34.809, longitud: -58.438 },
          { nombre: '9 de Abril', latitud: -34.741, longitud: -58.49 },
        ],
      },
      {
        nombre: 'Almirante Brown',
        latitud: -34.8,
        longitud: -58.38,
        localidades: [
          { nombre: 'Burzaco', latitud: -34.834, longitud: -58.408 },
          { nombre: 'Adrogué', latitud: -34.797, longitud: -58.396 },
          { nombre: 'Claypole', latitud: -34.8, longitud: -58.326 },
          { nombre: 'Rafael Calzada', latitud: -34.782, longitud: -58.342 },
          { nombre: 'Longchamps', latitud: -34.855, longitud: -58.388 },
          { nombre: 'Glew', latitud: -34.888, longitud: -58.383 },
        ],
      },
      {
        nombre: 'Lomas de Zamora',
        latitud: -34.76,
        longitud: -58.4,
        localidades: [
          { nombre: 'Lomas de Zamora', latitud: -34.76, longitud: -58.4 },
          { nombre: 'Temperley', latitud: -34.756, longitud: -58.365 },
          { nombre: 'Banfield', latitud: -34.744, longitud: -58.393 },
          { nombre: 'Llavallol', latitud: -34.811, longitud: -58.434 },
          { nombre: 'San José', latitud: -34.767, longitud: -58.35 },
        ],
      },
      {
        nombre: 'Avellaneda',
        latitud: -34.66,
        longitud: -58.36,
        localidades: [
          { nombre: 'Avellaneda', latitud: -34.66, longitud: -58.36 },
          { nombre: 'Wilde', latitud: -34.714, longitud: -58.336 },
          { nombre: 'Gerli', latitud: -34.694, longitud: -58.355 },
          { nombre: 'Sarandí', latitud: -34.683, longitud: -58.333 },
          { nombre: 'Dock Sud', latitud: -34.646, longitud: -58.349 },
        ],
      },
      {
        nombre: 'Lanús',
        latitud: -34.7,
        longitud: -58.4,
        localidades: [
          { nombre: 'Lanús Oeste', latitud: -34.7, longitud: -58.4 },
          { nombre: 'Lanús Este', latitud: -34.7, longitud: -58.38 },
          { nombre: 'Remedios de Escalada', latitud: -34.722, longitud: -58.395 },
          { nombre: 'Valentín Alsina', latitud: -34.672, longitud: -58.418 },
        ],
      },
      {
        nombre: 'Presidente Perón',
        latitud: -34.911,
        longitud: -58.399,
        localidades: [
          { nombre: 'Guernica', latitud: -34.911, longitud: -58.399 },
        ],
      },
      {
        nombre: 'San Vicente',
        latitud: -35.048,
        longitud: -58.425,
        localidades: [
          { nombre: 'San Vicente', latitud: -35.048, longitud: -58.425 },
          { nombre: 'Alejandro Korn', latitud: -35.013, longitud: -58.375 },
          { nombre: 'Domselaar', latitud: -35.075, longitud: -58.291 },
        ],
      },
      {
        nombre: 'Partido de la Costa',
        latitud: -36.372,
        longitud: -56.725,
        localidades: [
          { nombre: 'San Clemente del Tuyú', latitud: -36.372, longitud: -56.725 },
        ],
      },
      {
        nombre: 'Tres Arroyos',
        latitud: -38.892,
        longitud: -60.325,
        localidades: [
          { nombre: 'Reta', latitud: -38.892, longitud: -60.325 },
        ],
      },
    ],
  },
  {
    nombre: 'CABA',
    latitud: -34.603,
    longitud: -58.381,
    partidos: [
      {
        nombre: 'Comunas CABA',
        latitud: -34.603,
        longitud: -58.381,
        localidades: [
          { nombre: 'Puerto Madero', latitud: -34.611, longitud: -58.363 },
          { nombre: 'Palermo', latitud: -34.588, longitud: -58.43 },
          { nombre: 'Belgrano', latitud: -34.562, longitud: -58.456 },
          { nombre: 'Recoleta', latitud: -34.588, longitud: -58.393 },
          { nombre: 'San Telmo', latitud: -34.621, longitud: -58.373 },
          { nombre: 'Barracas', latitud: -34.64, longitud: -58.38 },
          { nombre: 'Caballito', latitud: -34.618, longitud: -58.442 },
          { nombre: 'Villa Devoto', latitud: -34.598, longitud: -58.512 },
          { nombre: 'Microcentro', latitud: -34.603, longitud: -58.375 },
        ],
      },
    ],
  },
  {
    nombre: 'GBA Norte',
    latitud: -34.5,
    longitud: -58.55,
    partidos: [
      {
        nombre: 'San Isidro',
        latitud: -34.472,
        longitud: -58.526,
        localidades: [
          { nombre: 'San Isidro', latitud: -34.472, longitud: -58.526 },
          { nombre: 'Martínez', latitud: -34.496, longitud: -58.51 },
          { nombre: 'Beccar', latitud: -34.462, longitud: -58.536 },
        ],
      },
      {
        nombre: 'Vicente López',
        latitud: -34.528,
        longitud: -58.477,
        localidades: [
          { nombre: 'Vicente López', latitud: -34.528, longitud: -58.477 },
          { nombre: 'Olivos', latitud: -34.509, longitud: -58.489 },
          { nombre: 'Munro', latitud: -34.538, longitud: -58.539 },
          { nombre: 'Florida', latitud: -34.533, longitud: -58.497 },
        ],
      },
      {
        nombre: 'Tigre',
        latitud: -34.426,
        longitud: -58.579,
        localidades: [
          { nombre: 'Tigre', latitud: -34.426, longitud: -58.579 },
          { nombre: 'Nordelta', latitud: -34.412, longitud: -58.653 },
          { nombre: 'Don Torcuato', latitud: -34.492, longitud: -58.608 },
          { nombre: 'General Pacheco', latitud: -34.457, longitud: -58.628 },
        ],
      },
      {
        nombre: 'Escobar',
        latitud: -34.348,
        longitud: -58.793,
        localidades: [
          { nombre: 'Garín', latitud: -34.424, longitud: -58.729 },
          { nombre: 'Belén de Escobar', latitud: -34.348, longitud: -58.793 },
          { nombre: 'Ingeniero Maschwitz', latitud: -34.383, longitud: -58.733 },
        ],
      },
    ],
  },
  {
    nombre: 'GBA Oeste',
    latitud: -34.65,
    longitud: -58.6,
    partidos: [
      {
        nombre: 'La Matanza',
        latitud: -34.7,
        longitud: -58.58,
        localidades: [
          { nombre: 'San Justo', latitud: -34.683, longitud: -58.562 },
          { nombre: 'Isidro Casanova', latitud: -34.739, longitud: -58.567 },
          { nombre: 'Ramos Mejía', latitud: -34.641, longitud: -58.562 },
          { nombre: 'La Tablada', latitud: -34.697, longitud: -58.533 },
          { nombre: 'Ciudad Evita', latitud: -34.721, longitud: -58.536 },
        ],
      },
      {
        nombre: 'Tres de Febrero',
        latitud: -34.6,
        longitud: -58.56,
        localidades: [
          { nombre: 'Caseros', latitud: -34.608, longitud: -58.563 },
          { nombre: 'Pablo Podestá', latitud: -34.583, longitud: -58.603 },
          { nombre: 'Ciudadela', latitud: -34.637, longitud: -58.539 },
        ],
      },
      {
        nombre: 'Hurlingham',
        latitud: -34.595,
        longitud: -58.625,
        localidades: [
          { nombre: 'Hurlingham', latitud: -34.595, longitud: -58.625 },
          { nombre: 'William C. Morris', latitud: -34.577, longitud: -58.643 },
        ],
      },
    ],
  },
];
export async function seedZonasYTipos() {
  console.log('🏷️ Cargando Categorías y Tipos de Inmueble...');

  for (const catPadre of ESTRUCTURA_TIPOS) {
    const padreDb = await prisma.tipoInmueble.upsert({
      where: { slug: catPadre.slug },
      update: { nombre: catPadre.nombre },
      create: {
        nombre: catPadre.nombre,
        slug: catPadre.slug,
      },
    });

    for (const hijo of catPadre.hijos) {
      await prisma.tipoInmueble.upsert({
        where: { slug: hijo.slug },
        update: {
          nombre: hijo.nombre,
          padreId: padreDb.id,
        },
        create: {
          nombre: hijo.nombre,
          slug: hijo.slug,
          padreId: padreDb.id,
        },
      });
    }
  }

  console.log('✅ Categorías y Subtipos de Inmueble procesados.');

  console.log('🌍 Cargando Árbol Completo de Zonas (GBA Sur, Norte, Oeste y CABA)...');

  let totalNodos = 0;

  for (const reg of REGIONES_ESTRUCTURA) {
    // Crear Región (Nivel 1 - Sin padre)
    const regionDb = await prisma.zona.create({
      data: {
        nombre: reg.nombre,
        latitud: reg.latitud,
        longitud: reg.longitud,
        padreId: null,
      },
    });
    totalNodos++;

    for (const part of reg.partidos) {
      // Crear Partido (Nivel 2 - Padre: regionDb.id)
      const partidoDb = await prisma.zona.create({
        data: {
          nombre: part.nombre,
          latitud: part.latitud,
          longitud: part.longitud,
          padreId: regionDb.id,
        },
      });
      totalNodos++;

      for (const loc of part.localidades) {
        // Crear Localidad (Nivel 3 - Padre: partidoDb.id)
        const locCreada = await prisma.zona.create({
          data: {
            nombre: loc.nombre,
            latitud: loc.latitud,
            longitud: loc.longitud,
            padreId: partidoDb.id,
          },
        });
        totalNodos++;
      }
    }
  }

  console.log(`✅ Árbol Completo de Zonas cargado con éxito. Total nodos creados: ${totalNodos}`);
}

