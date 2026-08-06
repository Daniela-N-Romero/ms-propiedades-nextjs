// backend/db/hacer-backup.ts
import { prisma } from '@/backend/db';
import * as fs from 'fs';

async function hacerBackupCompleto() {
  console.log('📦 Generando backup de TODAS las tablas...');

  try {
    const backup = {
      fechaGeneracion: new Date().toISOString(),
      agentes: await prisma.agente.findMany(),
      propietarios: await prisma.propietario.findMany(),
      colegas: await prisma.colega.findMany(),
      tiposInmueble: await prisma.tipoInmueble.findMany(),
      zonas: await prisma.zona.findMany(),
      propiedades: await prisma.propiedad.findMany({
        include: {
          imagenes: true,
        },
      }),
      imagenes: await prisma.imagen.findMany(),
      leads: await prisma.lead.findMany(),
      configuracionEmpresa: await prisma.configuracionEmpresa.findMany(),
    };

    fs.writeFileSync(
      'backup_mspropiedades_completo.json',
      JSON.stringify(backup, null, 2)
    );

    console.log('---------------------------------------------------------');
    console.log('✅ BACKUP COMPLETO GENERADO CON ÉXITO:');
    console.log(` - Agentes: ${backup.agentes.length}`);
    console.log(` - Propietarios: ${backup.propietarios.length}`);
    console.log(` - Colegas: ${backup.colegas.length}`);
    console.log(` - Tipos Inmueble: ${backup.tiposInmueble.length}`);
    console.log(` - Zonas: ${backup.zonas.length}`);
    console.log(` - Propiedades: ${backup.propiedades.length}`);
    console.log(` - Imágenes: ${backup.imagenes.length}`);
    console.log(` - Leads: ${backup.leads.length}`);
    console.log(` - Config Empresa: ${backup.configuracionEmpresa.length}`);
    console.log('---------------------------------------------------------');
    console.log('📁 Guardado en: backup_mspropiedades_completo.json');
  } catch (error) {
    console.error('❌ Error al generar el backup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

hacerBackupCompleto();