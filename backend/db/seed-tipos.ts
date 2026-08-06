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

export async function seedTipos() {
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


}

