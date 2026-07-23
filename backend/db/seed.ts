import { prisma } from './index';
import { TipoOperacionEnum, UserRoleEnum } from '@/prisma/generated/enums';

async function main() {
  console.log('🌱 Reseteando base de datos...');

  await prisma.propiedad.deleteMany();
  await prisma.zona.deleteMany();
  await prisma.tipoInmueble.deleteMany();
  await prisma.agente.deleteMany();

  // 1. Agente por defecto
  const agenteAdmin = await prisma.agente.create({
    data: {
      nombre: 'Matías',
      apellido: 'Settecerze',
      email: 'info@msconstruccion.net',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
      rol: UserRoleEnum.admin
    }
  });

  // 2. Jerarquía de Zonas
  const gbaSur = await prisma.zona.create({ data: { nombre: 'GBA Sur' } });
  const caba = await prisma.zona.create({ data: { nombre: 'CABA' } });
  const gbaOeste = await prisma.zona.create({ data: { nombre: 'GBA Oeste' } });

  const canning = await prisma.zona.create({ data: { nombre: 'Canning', padreId: gbaSur.id } });
  const hudson = await prisma.zona.create({ data: { nombre: 'Hudson', padreId: gbaSur.id } });
  const villaEspana = await prisma.zona.create({ data: { nombre: 'Villa España', padreId: gbaSur.id } });
  const platanos = await prisma.zona.create({ data: { nombre: 'Plátanos', padreId: gbaSur.id } });
  const pPatricios = await prisma.zona.create({ data: { nombre: 'Parque Patricios', padreId: caba.id } });
  const moreno = await prisma.zona.create({ data: { nombre: 'Moreno', padreId: gbaOeste.id } });

  // 3. Jerarquía de Tipos de Inmueble (Padres e Hijos)
  const catIndustrial = await prisma.tipoInmueble.create({
    data: { nombre: 'Industrial', slug: 'industrial' }
  });
  const catResidencial = await prisma.tipoInmueble.create({
    data: { nombre: 'Residencial', slug: 'residencial' }
  });

  // Subtipos de Industrial (Hijos)
  const naveIndustrial = await prisma.tipoInmueble.create({
    data: { nombre: 'Nave Industrial', slug: 'nave-industrial', padreId: catIndustrial.id }
  });
  const galpon = await prisma.tipoInmueble.create({
    data: { nombre: 'Galpón', slug: 'galpon', padreId: catIndustrial.id }
  });
  const loteIndustrial = await prisma.tipoInmueble.create({
    data: { nombre: 'Lote Industrial', slug: 'lote-industrial', padreId: catIndustrial.id }
  });

  // Subtipos de Residencial (Ejemplo para el futuro)
  await prisma.tipoInmueble.create({
    data: { nombre: 'Casa', slug: 'casa', padreId: catResidencial.id }
  });

  console.log('✅ ¡Tipos de inmueble cargados con éxito!');

  // 4. Mock de Propiedades
  const propiedadesMock = [
    {
      titulo: 'Lote Premium en Parque Industrial Hudson - 3088 m2',
      codigo: 'IND-HUD-001',
      descripcion: 'Excelente fracción industrial apta para logística pesada.',
      isPublished: true,
      isDestacada: true,
      zonaId: hudson.id,
      slug: 'lote-premium-parque-industrial-hudson-3088',
      tipoInmuebleId: loteIndustrial.id,
      categoria: TipoOperacionEnum.alquiler,
      precio: 5000,
      agenteId: agenteAdmin.id,
      latitud: -34.80115654799057,
      longitud: -58.17610372238949,
      superficieCubierta: 270,
      superficieTotal: 2000
    },
    {
      titulo: 'Nave Logística Triple A en Polo Industrial Canning',
      codigo: 'IND-CAN-002',
      descripcion: 'Nave de 5000m2 cubiertos con oficinas corporativas y docks de carga.',
      isPublished: true,
      isDestacada: true,
      zonaId: canning.id,
      slug: 'nave-logistica-triple-a-polo-industrial-canning',
      tipoInmuebleId: naveIndustrial.id,
      categoria: TipoOperacionEnum.alquiler,
      precio: 12000,
      agenteId: agenteAdmin.id,
      latitud: -34.789551185829175,
      longitud: -58.1580772850284,
      superficieCubierta: 250,
      superficieTotal: 300
    },
    {
      titulo: 'Depósito Industrial de Estructura Metálica en Parque Patricios',
      codigo: 'IND-PAT-003',
      descripcion: 'Depósito ideal para distribución de última milla.',
      isPublished: true,
      isDestacada: false,
      zonaId: pPatricios.id,
      slug: 'deposito-industrial-estructura-metalica-parque-patricios',
      tipoInmuebleId: galpon.id,
      categoria: TipoOperacionEnum.venta,
      precio: 450000,
      agenteId: agenteAdmin.id,
      latitud: -34.82094002593321,
      longitud: -58.188587518526106,
      superficieCubierta: 100,
      superficieTotal: 250
    }
  ];

  for (const item of propiedadesMock) {
    await prisma.propiedad.create({ data: item });
  }

  console.log('🚀 ¡Seed completado con éxito!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });