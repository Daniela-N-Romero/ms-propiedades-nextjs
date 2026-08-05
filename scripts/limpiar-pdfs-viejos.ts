// scripts/limpiar-pdfs-viejos.ts
import { prisma } from '@/backend/db';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
dotenv.config();

async function main() {
  console.log('🔍 Buscando propiedades con PDFs rotos de la carpeta /uploads...');

  // 1. Buscamos todas las propiedades cuyo pdfUrl contenga "/uploads"
  const afectadas = await prisma.propiedad.findMany({
    where: {
      pdfUrl: {
        contains: '/uploads',
      },
    },
    select: {
      id: true,
      codigo: true,
      titulo: true,
      pdfUrl: true,
    },
  });

  console.log(`📌 Se encontraron ${afectadas.length} propiedades con enlaces obsoletos de /uploads:`);

  afectadas.forEach((p) => {
    console.log(` - [CÓDIGO: ${p.codigo}] ${p.titulo} -> PDF: ${p.pdfUrl}`);
  });

  if (afectadas.length === 0) {
    console.log('✅ No hay PDFs viejos para limpiar.');
    return;
  }

  // 2. Limpiamos esos registros seteando pdfUrl a null
  const resultado = await prisma.propiedad.updateMany({
    where: {
      pdfUrl: {
        contains: '/uploads',
      },
    },
    data: {
      pdfUrl: null, // Pasa a null para usar el PDF dinámico
    },
  });

  console.log(`\n🎉 ¡Listo! Se actualizaron ${resultado.count} propiedades en la Base de Datos.`);
  console.log('💡 Ahora esas propiedades generarán su PDF dinámico automáticamente hasta que les subas uno nuevo a Supabase desde el admin.');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });