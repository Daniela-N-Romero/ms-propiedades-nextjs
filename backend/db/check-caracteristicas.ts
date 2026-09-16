// scripts/check-caracteristicas.ts
import 'dotenv/config';
import { prisma } from '@/backend/db';

async function verificarCaracteristicasViejas() {
  console.log('🔍 Buscando propiedades con formato antiguo de características...\n');

  const propiedades = await prisma.propiedad.findMany({
    select: {
      id: true,
      titulo: true,
      slug: true,
      caracteristicas: true,
    },
  });

  const afectadas = propiedades.filter((p) => {
    const carac = (p.caracteristicas as Record<string, any>) || {};
    
    // Verificamos si tiene alguna de las claves o formatos viejos
    const tieneOficinasViejas = carac.oficinasM2 !== undefined;
    const tieneBanoViejo = carac.bano !== undefined;
    const tieneBanosNumero = typeof carac.banos === 'number';
    const tienePotenciaVieja = carac.tienePotencia !== undefined || carac.trifasica !== undefined;

    return tieneOficinasViejas || tieneBanoViejo || tieneBanosNumero || tienePotenciaVieja;
  });

  console.log(`📌 Se encontraron ${afectadas.length} propiedades para corregir:\n`);

  afectadas.forEach((p) => {
    const carac = p.caracteristicas as Record<string, any>;
    console.log(`🏠 [ID ${p.id}] - ${p.titulo}`);
    console.log(`   🔗 Slug: /propiedades/${p.slug}`);
    console.log(`   ⚠️ Campos viejos encontrados:`, {
      ...(carac.oficinasM2 !== undefined && { oficinasM2: carac.oficinasM2 }),
      ...(carac.bano !== undefined && { bano: carac.bano }),
      ...(typeof carac.banos === 'number' && { banos_numero: carac.banos }),
      ...(carac.tienePotencia !== undefined && { tienePotencia: carac.tienePotencia }),
      ...(carac.trifasica !== undefined && { trifasica: carac.trifasica }),
    });
    console.log('--------------------------------------------------');
  });

  await prisma.$disconnect();
}

verificarCaracteristicasViejas();