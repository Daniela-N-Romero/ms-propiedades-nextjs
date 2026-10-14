import 'dotenv/config';
import { prisma } from '@/backend/db';

const actualizacionesCanning = [
  {
    slug: 'parque-industrial-espacio-nova',
    direccionAcceso: 'Calle Perito Moreno 1200, Canning',
    conectividad: 'Ubicado sobre Calle Perito Moreno a la altura 1200, en el corazón del Polo Industrial Canning, con rápida salida a Ruta 58, Au. Ezeiza-Cañuelas y Au. Presidente Perón.',
  },
  {
    slug: 'canning-industrial-parque-privado-etapa-i',
    direccionAcceso: 'Calle Perito Moreno 375, Canning',
    conectividad: 'Ubicado sobre Calle Perito Moreno 375, en el acceso inicial del Polo Industrial Canning, con conectividad directa hacia Ruta 58 y Au. Presidente Perón.',
  },
  {
    slug: 'canning-industrial-parque-privado-etapa-ii',
    direccionAcceso: 'Calle Perito Moreno 700, Canning',
    conectividad: 'Ubicado sobre Calle Perito Moreno 700, corredor industrial consolidado de Canning con facilidades de acceso para transporte pesado.',
  },
  {
    slug: 'canning-industrial-parque-privado-etapa-iii',
    direccionAcceso: 'Calle Perito Moreno 700, Canning',
    conectividad: 'Ubicado sobre Calle Perito Moreno 700, etapa de desarrollo con amplias facilidades de preventa e ingreso directo sobre Perito Moreno.',
  },
];

async function main() {
  console.log('🔄 Actualizando direcciones de parques en Calle Perito Moreno (Canning)...');

  for (const item of actualizacionesCanning) {
    await prisma.parqueIndustrial.update({
      where: { slug: item.slug },
      data: {
        direccionAcceso: item.direccionAcceso,
        conectividad: item.conectividad,
      },
    });
    console.log(`  ✓ ${item.slug} → Dirección corregida: "${item.direccionAcceso}"`);
  }

  console.log('✅ Actualización completada con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error al actualizar parques de Canning:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });