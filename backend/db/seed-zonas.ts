// backend/db/seed-zonas.ts
import { prisma } from '@/backend/db';

const REGIONES_ESTRUCTURA = [
  {
    nombre: 'GBA Sur',
    latitud: -34.78,
    longitud: -58.28,
    partidos: [
      {
        nombre: 'Presidente Perón',
        latitud: -34.911,
        longitud: -58.399,
        localidades: [
          { nombre: 'Guernica', latitud: -34.911, longitud: -58.399 },
        ],
      },
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
        nombre: 'Cañuelas',
        latitud: -35.05,
        longitud: -58.76,
        localidades: [
          { nombre: 'Cañuelas', latitud: -35.05, longitud: -58.76 },
          { nombre: 'Máximo Paz', latitud: -34.93, longitud: -58.62 },
          { nombre: 'Vicente Casares', latitud: -34.95, longitud: -58.66 },
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
          { nombre: 'Villa Lugano', latitud: -34.671, longitud: -58.473 },
          { nombre: 'Nueva Pompeya', latitud: -34.653, longitud: -58.419 },
          { nombre: 'Mataderos', latitud: -34.656, longitud: -58.502 },
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
          { nombre: 'Villa Adelina', latitud: -34.523, longitud: -58.544 },
          { nombre: 'Boulogne', latitud: -34.505, longitud: -58.563 },
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
          { nombre: 'Carapachay', latitud: -34.53, longitud: -58.55 },
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
          { nombre: 'El Talar', latitud: -34.474, longitud: -58.651 },
          { nombre: 'Benavídez', latitud: -34.396, longitud: -58.687 },
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
          { nombre: 'Matheu', latitud: -34.385, longitud: -58.832 },
          { nombre: 'Loma Verde', latitud: -34.301, longitud: -58.852 },
        ],
      },
      {
        nombre: 'Pilar',
        latitud: -34.458,
        longitud: -58.914,
        localidades: [
          { nombre: 'Pilar', latitud: -34.458, longitud: -58.914 },
          { nombre: 'Parque Industrial Pilar', latitud: -34.44, longitud: -58.98 },
          { nombre: 'Del Viso', latitud: -34.444, longitud: -58.802 },
          { nombre: 'Villa Rosa', latitud: -34.429, longitud: -58.868 },
          { nombre: 'Fatima', latitud: -34.428, longitud: -59.006 },
        ],
      },
      {
        nombre: 'San Fernando',
        latitud: -34.442,
        longitud: -58.558,
        localidades: [
          { nombre: 'San Fernando', latitud: -34.442, longitud: -58.558 },
          { nombre: 'Victoria', latitud: -34.452, longitud: -58.544 },
          { nombre: 'Virreyes', latitud: -34.459, longitud: -58.572 },
        ],
      },
      {
        nombre: 'General San Martín',
        latitud: -34.577,
        longitud: -58.536,
        localidades: [
          { nombre: 'San Martín', latitud: -34.577, longitud: -58.536 },
          { nombre: 'San Andrés', latitud: -34.561, longitud: -58.548 },
          { nombre: 'Villa Ballester', latitud: -34.549, longitud: -58.555 },
          { nombre: 'José León Suárez', latitud: -34.53, longitud: -58.575 },
        ],
      },
      {
        nombre: 'Malvinas Argentinas',
        latitud: -34.502,
        longitud: -58.69,
        localidades: [
          { nombre: 'Los Polvorines', latitud: -34.502, longitud: -58.69 },
          { nombre: 'Tortuguitas', latitud: -34.471, longitud: -58.756 },
          { nombre: 'Grand Bourg', latitud: -34.484, longitud: -58.718 },
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
          { nombre: 'González Catán', latitud: -34.767, longitud: -58.618 },
          { nombre: 'Virrey del Pino', latitud: -34.829, longitud: -58.729 },
          { nombre: 'Lomas del Mirador', latitud: -34.662, longitud: -58.538 },
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
          { nombre: 'El Palomar', latitud: -34.61, longitud: -58.583 },
          { nombre: 'Sáenz Peña', latitud: -34.597, longitud: -58.526 },
        ],
      },
      {
        nombre: 'Hurlingham',
        latitud: -34.595,
        longitud: -58.625,
        localidades: [
          { nombre: 'Hurlingham', latitud: -34.595, longitud: -58.625 },
          { nombre: 'William C. Morris', latitud: -34.577, longitud: -58.643 },
          { nombre: 'Villa Tesei', latitud: -34.61, longitud: -58.63 },
        ],
      },
      {
        nombre: 'Morón',
        latitud: -34.652,
        longitud: -58.618,
        localidades: [
          { nombre: 'Morón', latitud: -34.652, longitud: -58.618 },
          { nombre: 'Haedo', latitud: -34.645, longitud: -58.598 },
          { nombre: 'Castelar', latitud: -34.658, longitud: -58.645 },
        ],
      },
      {
        nombre: 'Ituzaingó',
        latitud: -34.658,
        longitud: -58.667,
        localidades: [
          { nombre: 'Ituzaingó', latitud: -34.658, longitud: -58.667 },
          { nombre: 'Udaondo', latitud: -34.62, longitud: -58.68 },
        ],
      },
      {
        nombre: 'Merlo',
        latitud: -34.665,
        longitud: -58.728,
        localidades: [
          { nombre: 'Merlo', latitud: -34.665, longitud: -58.728 },
          { nombre: 'San Antonio de Padua', latitud: -34.661, longitud: -58.698 },
          { nombre: 'Parque San Martín', latitud: -34.68, longitud: -58.73 },
        ],
      },
      {
        nombre: 'Moreno',
        latitud: -34.65,
        longitud: -58.78,
        localidades: [
          { nombre: 'Moreno', latitud: -34.65, longitud: -58.78 },
          { nombre: 'Paso del Rey', latitud: -34.648, longitud: -58.749 },
          { nombre: 'Trujui', latitud: -34.59, longitud: -58.76 },
          { nombre: 'Francisco Álvarez', latitud: -34.63, longitud: -58.85 },
        ],
      },
    ],
  },
  {
    nombre: 'Interior de Bs. As.',
    latitud: -37.0,
    longitud: -60.0,
    partidos: [
      {
        nombre: 'Partido de la Costa',
        latitud: -36.372,
        longitud: -56.725,
        localidades: [
          { nombre: 'San Clemente del Tuyú', latitud: -36.372, longitud: -56.725 },
          { nombre: 'Mar del Tuyú', latitud: -36.57, longitud: -56.68 },
          { nombre: 'San Bernardo', latitud: -36.68, longitud: -56.67 },
        ],
      },
      {
        nombre: 'Tres Arroyos',
        latitud: -38.892,
        longitud: -60.325,
        localidades: [
          { nombre: 'Reta', latitud: -38.892, longitud: -60.325 },
          { nombre: 'Tres Arroyos', latitud: -38.37, longitud: -60.27 },
        ],
      },
      {
        nombre: 'General Pueyrredón',
        latitud: -38.0,
        longitud: -57.55,
        localidades: [
          { nombre: 'Mar del Plata', latitud: -38.0, longitud: -57.55 },
          { nombre: 'Batán', latitud: -38.0, longitud: -57.71 },
        ],
      },
      {
        nombre: 'Bahía Blanca',
        latitud: -38.71,
        longitud: -62.26,
        localidades: [
          { nombre: 'Bahía Blanca', latitud: -38.71, longitud: -62.26 },
          { nombre: 'Ingeniero White', latitud: -38.78, longitud: -62.26 },
        ],
      },
      {
        nombre: 'Zárate',
        latitud: -34.09,
        longitud: -59.02,
        localidades: [
          { nombre: 'Zárate', latitud: -34.09, longitud: -59.02 },
          { nombre: 'Lima', latitud: -33.98, longitud: -59.19 },
        ],
      },
      {
        nombre: 'Campana',
        latitud: -34.16,
        longitud: -58.95,
        localidades: [
          { nombre: 'Campana', latitud: -34.16, longitud: -58.95 },
        ],
      },
    ],
  },
];

export async function seedZonas() {
  console.log('🌍 Sincronizando Árbol de Zonas de forma segura (sin borrar ni duplicar)...');

  let creados = 0;
  let existentes = 0;

  for (const reg of REGIONES_ESTRUCTURA) {
    // 1. Buscar o crear Región
    let regionDb = await prisma.zona.findFirst({
      where: { nombre: reg.nombre, padreId: null },
    });

    if (!regionDb) {
      regionDb = await prisma.zona.create({
        data: {
          nombre: reg.nombre,
          latitud: reg.latitud,
          longitud: reg.longitud,
          padreId: null,
        },
      });
      creados++;
    } else {
      existentes++;
    }

    for (const part of reg.partidos) {
      // 2. Buscar o crear Partido
      let partidoDb = await prisma.zona.findFirst({
        where: { nombre: part.nombre, padreId: regionDb.id },
      });

      if (!partidoDb) {
        partidoDb = await prisma.zona.create({
          data: {
            nombre: part.nombre,
            latitud: part.latitud,
            longitud: part.longitud,
            padreId: regionDb.id,
          },
        });
        creados++;
      } else {
        existentes++;
      }

      for (const loc of part.localidades) {
        // 3. Buscar o crear Localidad
        let locDb = await prisma.zona.findFirst({
          where: { nombre: loc.nombre, padreId: partidoDb.id },
        });

        if (!locDb) {
          await prisma.zona.create({
            data: {
              nombre: loc.nombre,
              latitud: loc.latitud,
              longitud: loc.longitud,
              padreId: partidoDb.id,
            },
          });
          creados++;
        } else {
          existentes++;
        }
      }
    }
  }

  console.log(`✅ Árbol de Zonas sincronizado. Nodos nuevos agregados: ${creados}, Nodos preexistentes conservados: ${existentes}.`);
}
