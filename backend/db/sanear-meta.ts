import { prisma } from '@/backend/db';

async function sanearMetaAds() {
  console.log('🔄 Iniciando saneamiento de Meta Ads en la base de datos...');

  // 1. Desactivar Meta Ads para TODAS las propiedades que sean "De Colega"
  const colegasUpdated = await prisma.propiedad.updateMany({
    where: {
      OR: [
        { origen: 'fromColleague' },
        { colegaId: { not: null } },
      ],
    },
    data: {
      permitMetaAd: false,
    },
  });
  console.log(`❌ Propiedades de Colegas desactivadas: ${colegasUpdated.count}`);

  // 2. Desactivar Meta Ads para TODAS las propiedades que NO estén publicadas (Borradores)
  const borradoresUpdated = await prisma.propiedad.updateMany({
    where: {
      isPublished: false,
    },
    data: {
      permitMetaAd: false,
    },
  });
  console.log(`❌ Propiedades Borrador desactivadas: ${borradoresUpdated.count}`);

  // 3. Imprimir el estado final en consola para verificar
  const resumen = await prisma.propiedad.findMany({
    select: {
      id: true,
      codigo: true,
      origen: true,
      isPublished: true,
      permitMetaAd: true,
    },
    orderBy: { id: 'asc' },
  });

  console.log('\n📊 ESTADO FINAL DE PROPIEDADES EN BASE DE DATOS:');
  resumen.forEach((p) => {
    const estadoWeb = p.isPublished ? '🌐 PUBLICADA' : '📝 BORRADOR';
    const estadoMeta = p.permitMetaAd ? '✅ INCLUIDA EN META' : '🚫 EXCLUIDA DE META';
    console.log(`ID: ${p.id} | REF: ${p.codigo || 'S/D'} | ${p.origen.toUpperCase()} | ${estadoWeb} | ${estadoMeta}`);
  });
}

// 🔑 ¡ESTA LÍNEA ES LA QUE EJECUTA LA FUNCIÓN!
sanearMetaAds()
  .catch((e) => {
    console.error('❌ Error ejecutando saneamiento:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });