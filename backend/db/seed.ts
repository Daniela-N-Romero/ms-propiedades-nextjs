// backend/db/seed.ts
import { prisma } from './index';

async function main() {
  console.log('🌱 Iniciando la carga de Zonas y Localidades...');

  // 1. Limpiamos datos viejos para no duplicar si lo corremos varias veces
  await prisma.zona.deleteMany();

  // 2. Creamos las Zonas "Padre" principales
  const gbaSur = await prisma.zona.create({
    data: { nombre: 'GBA Sur' },
  });

  const caba = await prisma.zona.create({
    data: { nombre: 'CABA' },
  });

  const gbaOeste = await prisma.zona.create({
    data: { nombre: 'GBA Oeste' },
  });

  // 3. Creamos las Localidades asociadas a sus respectivos padres
  // Localidades de GBA Sur
  await prisma.zona.createMany({
    data: [
      { nombre: 'Canning', padreId: gbaSur.id },
      { nombre: 'Ezeiza', padreId: gbaSur.id },
      { nombre: 'Hudson', padreId: gbaSur.id },
      { nombre: 'Burzaco', padreId: gbaSur.id },
    ],
  });

  // Localidades de CABA
  await prisma.zona.createMany({
    data: [
      { nombre: 'Parque Patricios', padreId: caba.id },
      { nombre: 'Nueva Pompeya', padreId: caba.id },
      { nombre: 'Villa Soldati', padreId: caba.id },
    ],
  });

  // Localidades de GBA Oeste
  await prisma.zona.createMany({
    data: [
      { nombre: 'Moreno', padreId: gbaOeste.id },
      { nombre: 'Morón', padreId: gbaOeste.id },
    ],
  });

  console.log('✅ ¡Zonas y Localidades cargadas con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });