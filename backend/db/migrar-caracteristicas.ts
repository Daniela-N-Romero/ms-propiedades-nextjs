import 'dotenv/config';
import { prisma } from './index'; // Ajustá el import si tu prisma client está en otra ruta

async function ejecutarMigracion() {
  console.log('🚀 Iniciando migración de características al nuevo formato...\n');

  const propiedades = await prisma.propiedad.findMany({
    select: {
      id: true,
      titulo: true,
      caracteristicas: true,
    },
  });

  let migradasCount = 0;

  for (const p of propiedades) {
    const original = (p.caracteristicas as Record<string, any>) || {};
    const updated = { ...original };
    let cambioRealizado = false;

    // 1. MIGRAR OFICINAS (de oficinasM2 -> oficinas)
    if ('oficinasM2' in updated) {
      const valOfi = updated.oficinasM2;
      delete updated.oficinasM2; // Borramos la clave vieja
      cambioRealizado = true;

      if (valOfi !== null && valOfi !== undefined && valOfi !== '') {
        const numVal = Number(valOfi);
        if (!isNaN(numVal) && numVal > 0) {
          // Si el valor era 1 o 2 probablemente cargaron cantidad, si era mayor (ej: 35, 150, 822) eran m²
          const modo = numVal <= 10 ? 'cant' : 'm2';
          updated.oficinas = { modo, valor: numVal };
        }
      }
    }

    // 2. MIGRAR BAÑOS (de bano o banos_numero -> banos)
    if ('bano' in updated || 'banos_numero' in updated) {
      const valBano = updated.bano ?? updated.banos_numero;
      delete updated.bano;
      delete updated.banos_numero;
      cambioRealizado = true;

      if (typeof valBano === 'boolean' && valBano === true) {
        updated.banos = { modo: 'cant', valor: 1 };
      } else if (typeof valBano === 'number' && valBano > 0) {
        updated.banos = { modo: 'cant', valor: valBano };
      }
    } else if (typeof updated.banos === 'number') {
      // Si banos era un número plano (ej: banos: 2)
      updated.banos = { modo: 'cant', valor: updated.banos };
      cambioRealizado = true;
    }

    // 3. MIGRAR POTENCIA ELECTRICA (de tienePotencia o trifasica -> potenciaElectrica)
    if ('tienePotencia' in updated || 'trifasica' in updated) {
      const tienePot = updated.tienePotencia;
      const tieneTri = updated.trifasica;
      delete updated.tienePotencia;
      delete updated.trifasica;
      cambioRealizado = true;

      if (tienePot === true || tieneTri === true) {
        // Asignamos Tarifa T3 por defecto para naves industriales con potencia
        updated.potenciaElectrica = 'Trifásica';
      }
    }

    // Guardar cambios en la BBDD solo si hubo modificaciones
    if (cambioRealizado) {
      await prisma.propiedad.update({
        where: { id: p.id },
        data: {
          caracteristicas: updated,
        },
      });
      console.log(`✅ [ID ${p.id}] "${p.titulo}" migrada correctamente.`);
      migradasCount++;
    }
  }

  console.log(`\n🎉 Migración finalizada con éxito. Se actualizaron ${migradasCount} propiedades.`);
  await prisma.$disconnect();
}

ejecutarMigracion().catch((err) => {
  console.error('❌ Error durante la migración:', err);
  prisma.$disconnect();
});