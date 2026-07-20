// backend/db/seed.ts
import { prisma } from './index';
import { TipoOperacionEnum, TipoPropiedadEnum, UserRoleEnum } from '@/prisma/generated/enums'

async function main() {
  console.log('🌱 Iniciando la carga de Zonas y Localidades...');

  // 1. Limpiamos datos viejos respetando las dependencias de claves foráneas
  await prisma.propiedad.deleteMany();
  await prisma.zona.deleteMany();
  await prisma.agente.deleteMany(); // 🆕 Limpiamos agentes viejos

  // 2. Creamos un Agente Obligatorio de prueba para asignarle las naves
  const agenteAdmin = await prisma.agente.create({
    data: {
      nombre: 'Matías',
      apellido: 'Settecerze',
      email: 'matias@mspropiedades.com',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456', // Un hash de prueba simulado
      rol: UserRoleEnum.admin
    }
  });
  console.log('👤 Agente administrador de prueba creado.');

  // 3. Creamos las Zonas "Padre" principales
  const gbaSur = await prisma.zona.create({ data: { nombre: 'GBA Sur' } });
  const caba = await prisma.zona.create({ data: { nombre: 'CABA' } });
  const gbaOeste = await prisma.zona.create({ data: { nombre: 'GBA Oeste' } });
  const gbaNorte = await prisma.zona.create({ data: { nombre: 'GBA Norte' } });

  // 4. Creamos las Localidades asociadas a sus respectivos padres
  const canning = await prisma.zona.create({ data: { nombre: 'Canning', padreId: gbaSur.id } });
  const ezeiza = await prisma.zona.create({ data: { nombre: 'Ezeiza', padreId: gbaSur.id } });
  const hudson = await prisma.zona.create({ data: { nombre: 'Hudson', padreId: gbaSur.id } });
  const varela = await prisma.zona.create({ data: { nombre: 'Florencio Varela', padreId: gbaSur.id } });
  await prisma.zona.create({ data: { nombre: 'Burzaco', padreId: gbaSur.id } });

  const pPatricios = await prisma.zona.create({ data: { nombre: 'Parque Patricios', padreId: caba.id } });
  await prisma.zona.create({ data: { nombre: 'Villa Soldati', padreId: caba.id } });
  await prisma.zona.create({ data: { nombre: 'Nueva Pompeya', padreId: caba.id } });

  const moreno = await prisma.zona.create({ data: { nombre: 'Moreno', padreId: gbaOeste.id } });
  const tigre = await prisma.zona.create({ data: { nombre: 'Tigre', padreId: gbaNorte.id } });

  console.log('✅ ¡Zonas y Localidades cargadas con éxito!');
  console.log('🏢 Insertando naves industriales de prueba...');

  // 5. El Mock con todos los campos obligatorios del esquema asignados
  const propiedadesMock = [
    {
      titulo: 'Lote Premium en Parque Industrial Hudson - 3088 m2',
      descripcion: 'Excelente fracción industrial apta para logística pesada.',
      isPublished: true,
      isDestacada: true,
      zonaId: hudson.id,
      slug: 'lote-premium-parque-industrial-hudson-3088',
      tipo: TipoPropiedadEnum.industrial,
      categoria: TipoOperacionEnum.alquiler,
      precio: 5000, // 💡 Cambiado a número para cumplir con el tipo Decimal de Postgres
      agenteId: agenteAdmin.id // 🆕 Asignamos el agente obligatorio
    },
    {
      titulo: 'Nave Logística Triple A en Polo Industrial Canning',
      descripcion: 'Nave de 5000m2 cubiertos con oficinas corporativas y docks de carga.',
      isPublished: true,
      isDestacada: true,
      zonaId: canning.id,
      slug: 'nave-logistica-triple-a-polo-industrial-canning',
      tipo: TipoPropiedadEnum.industrial,
      categoria: TipoOperacionEnum.alquiler,
      precio: 12000,
      agenteId: agenteAdmin.id
    },
    {
      titulo: 'Depósito Industrial de Estructura Metálica en Parque Patriciosll lll ll lll llllll llll llllll lllllll lllllllll llllllllllllllllllllllll lllllllllllll',
      descripcion: 'Depósito ideal para distribución de última milla en el distrito tecnológico.',
      isPublished: true,
      isDestacada: true,
      zonaId: pPatricios.id,
      slug: 'deposito-industrial-estructura-metalica-parque-patricios',
      tipo: TipoPropiedadEnum.industrial,
      categoria: TipoOperacionEnum.venta,
      precio: 450000000,
      agenteId: agenteAdmin.id
    },
    {
      titulo: 'Fracción Industrial sobre Colectora Acceso Oeste',
      descripcion: 'Excelente lote comercial/industrial con gran visibilidad.',
      isPublished: true,
      isDestacada: false,
      zonaId: moreno.id,
      slug: 'fraccion-industrial-sobre-colectora-acceso-oeste',
      tipo: TipoPropiedadEnum.industrial,
      categoria: TipoOperacionEnum.alquiler,
      precio: 3500,
      agenteId: agenteAdmin.id
    }
  ];

  // 6. Inserción controlada
  for (const item of propiedadesMock) {
    try {
      await prisma.propiedad.create({
        data: {
          titulo: item.titulo,
          descripcion: item.descripcion,
          isPublished: item.isPublished,
          isDestacada: item.isDestacada,
          zonaId: item.zonaId,
          slug: item.slug,
          tipo: item.tipo,
          categoria: item.categoria,
          precio: item.precio,
          agenteId: item.agenteId // 🆕 Enviamos el agenteId a Postgres
        }
      });
      console.log(`✅ Propiedad cargada: "${item.titulo.substring(0, 30)}..."`);
    } catch (error: any) {
      console.error(`❌ Error al cargar la propiedad: "${item.titulo.substring(0, 30)}..."`);
      console.error(`📌 Detalles del fallo:`, error.message);
      process.exit(1); 
    }
  }

  console.log('🚀 ¡Seed completado con stock inicial simulado con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });