import { prisma } from '@/backend/db'; // Ajustá la ruta a tu cliente de Prisma
import { slugify } from '@/lib/utils-formatting'; // Ajustá la ruta a tu helper

// Helper corregido para generar Códigos de Referencia Semánticos
function generarCodigoRefCorregido(prop: {
  id: number;
  mercadoSlug?: string | null;
  localidadNombre?: string | null;
}): string {
  let prefijo = 'PROP';
  const slug = (prop.mercadoSlug || '').toLowerCase();

  if (slug.includes('industrial')) prefijo = 'IND';
  else if (slug.includes('residencial')) prefijo = 'RES';
  else if (slug.includes('comercial')) prefijo = 'COM';

  // 1. Localidad limpia sin guiones intermedios
  const localidadRaw = prop.localidadNombre || 'GBA';
  const loc = slugify(localidadRaw)
    .replace(/-/g, '') // 👈 Limpia los guiones para que "La Plata" -> "LAP" y no "LA-"
    .substring(0, 3)
    .toUpperCase();

  // 2. Hash único basado en el ID
  const hashUnico = (prop.id + 1000).toString(36).toUpperCase();

  return `${prefijo}-${loc}-${hashUnico}`;
}

async function fixAllPropertyCodes() {
  console.log('🔍 Obteniendo todas las propiedades para recalcular sus códigos...');

  const propiedades = await prisma.propiedad.findMany({
    include: {
      zona: true,
      tipoInmueble: {
        include: {
          padre: true, // Para obtener el mercado principal (ej: Industrial, Comercial)
        },
      },
    },
  });

  console.log(`📌 Procesando ${propiedades.length} propiedades...`);

  for (const prop of propiedades) {
    // Detectamos el slug del mercado principal (ej: 'industrial', 'comercial', 'residencial')
    const mercadoSlug = prop.tipoInmueble?.padre?.slug || prop.tipoInmueble?.slug || '';
    const localidadNombre = prop.zona?.nombre || '';

    const codigoNuevo = generarCodigoRefCorregido({
      id: prop.id,
      mercadoSlug,
      localidadNombre,
    });

    // Solo actualizamos si el código cambió respecto al que tenía guardado
    if (prop.codigo !== codigoNuevo) {
      await prisma.propiedad.update({
        where: { id: prop.id },
        data: { codigo: codigoNuevo },
      });

      console.log(`✅ Propiedad #${prop.id}: ${prop.codigo} ➡️ ${codigoNuevo}`);
    }
  }

  console.log('🎉 ¡Todas las propiedades fueron corregidas con éxito!');
}

fixAllPropertyCodes()
  .catch((e) => {
    console.error('❌ Error al actualizar códigos:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });