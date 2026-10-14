import 'dotenv/config';
import { prisma } from '@/backend/db';

interface ParqueSeedInput {
  nombre: string;
  slug: string;
  partido: string;       // Ej: "Ezeiza", "Berazategui", "Esteban Echeverría"
  localidad: string;     // Ej: "Carlos Spegazzini", "Hudson", "Canning"
  direccionAcceso: string;
  conectividad: string;
  alquilerM2Referencial: number;
  precioTierraM2Ref: number;
  latitud: number;
  longitud: number;
}

const parquesData: ParqueSeedInput[] = [
  // --- EZEIZA Y SUS LOCALIDADES ---
  {
    nombre: 'Polo Industrial Spegazzini',
    slug: 'polo-industrial-spegazzini',
    partido: 'Ezeiza',
    localidad: 'Carlos Spegazzini',
    direccionAcceso: 'Autopista Ezeiza-Cañuelas km 40',
    conectividad: 'Ubicado sobre Au. Ezeiza-Cañuelas, a metros del cruce con Au. Presidente Perón y conexión directa al Aeropuerto de Ezeiza.',
    alquilerM2Referencial: 5.0,
    precioTierraM2Ref: 110,
    latitud: -34.9082,
    longitud: -58.5521,
  },
  {
    nombre: 'Polo Industrial Ezeiza',
    slug: 'polo-industrial-ezeiza',
    partido: 'Ezeiza',
    localidad: 'Carlos Spegazzini', // Ubicación exacta dentro del partido
    direccionAcceso: 'Autopista Ezeiza-Cañuelas y Au. Presidente Perón',
    conectividad: 'Posición estratégica dentro del nudo logístico de Ezeiza con rápido acceso hacia CABA y el conurbano.',
    alquilerM2Referencial: 5.0,
    precioTierraM2Ref: 80,
    latitud: -34.9125,
    longitud: -58.5843,
  },
  {
    nombre: 'Polo Industrial Tristán Suárez',
    slug: 'polo-industrial-tristan-suarez',
    partido: 'Ezeiza',
    localidad: 'Tristán Suárez',
    direccionAcceso: 'Distribuidor vial Au. Ezeiza-Cañuelas',
    conectividad: 'Frente a distribuidor de autopista, conectividad inmediata al Aeropuerto Internacional de Ezeiza.',
    alquilerM2Referencial: 4.5,
    precioTierraM2Ref: 70,
    latitud: -34.9011,
    longitud: -58.5712,
  },
  {
    nombre: 'Parque Industrial Bayres Connect',
    slug: 'parque-industrial-bayres-connect',
    partido: 'Ezeiza',
    localidad: 'Tristán Suárez',
    direccionAcceso: 'Autopista Ezeiza-Cañuelas',
    conectividad: 'Complejo logístico de última generación con seguridad e infraestructura sustentable.',
    alquilerM2Referencial: 5.5,
    precioTierraM2Ref: 90,
    latitud: -34.908,
    longitud: -58.562,
  },

  // --- ESTEBAN ECHEVERRÍA & CANNING ---
  {
    nombre: 'Parque Industrial Espacio Nova',
    slug: 'parque-industrial-espacio-nova',
    partido: 'Esteban Echeverría',
    localidad: 'Canning',
    direccionAcceso: 'Calle Perito Moreno 1200, Canning',
    conectividad: 'Ubicado sobre Calle Perito Moreno a la altura 1200, en el corazón del Polo Industrial Canning, con rápida salida a Ruta 58, Au. Ezeiza-Cañuelas y Au. Presidente Perón.',
    alquilerM2Referencial: 7.0,
    precioTierraM2Ref: 150,
    latitud: -34.9351,
    longitud: -58.5122,
  },
  {
    nombre: 'Canning Industrial Parque Privado Etapa I',
    slug: 'canning-industrial-parque-privado-etapa-i',
    partido: 'Esteban Echeverría',
    localidad: 'Canning',
    direccionAcceso: 'Calle Perito Moreno 375, Canning',
    conectividad: 'Parque industrial privado de alta categoría sobre el corredor Canning.',
    alquilerM2Referencial: 6.5,
    precioTierraM2Ref: 140,
    latitud: -34.941,
    longitud: -58.515,
  },
  {
    nombre: 'Canning Industrial Parque Privado Etapa II',
    slug: 'canning-industrial-parque-privado-etapa-ii',
    partido: 'Esteban Echeverría',
    localidad: 'Canning',
    direccionAcceso: 'Calle Perito Moreno 700, Canning',
    conectividad: 'Segunda etapa del complejo industrial Canning de alta categoría sobre el corredor Canning.',
    alquilerM2Referencial: 6.5,
    precioTierraM2Ref: 135,
    latitud: -34.9442,
    longitud: -58.5185,
  },
  {
    nombre: 'Canning Industrial Parque Privado Etapa III',
    slug: 'canning-industrial-parque-privado-etapa-iii',
    partido: 'Esteban Echeverría',
    localidad: 'Canning',
    direccionAcceso: 'Calle Perito Moreno 700, Canning',
    conectividad: 'Tercera etapa del complejo industrial Canning de alta categoría sobre el corredor Canning.',
    alquilerM2Referencial: 6.0,
    precioTierraM2Ref: 125,
    latitud: -34.948,
    longitud: -58.522,
  },
  {
    nombre: 'Parque Industrial EBAPI',
    slug: 'parque-industrial-ebapi',
    partido: 'Esteban Echeverría',
    localidad: '9 de Abril',
    direccionAcceso: 'Camino de Cinturón y Au. Riccheri',
    conectividad: 'Proximidad inmediata a la Autopista Riccheri y al Mercado Central.',
    alquilerM2Referencial: 5.5,
    precioTierraM2Ref: 130,
    latitud: -34.7521,
    longitud: -58.5112,
  },

  // --- BERAZATEGUI Y SUS LOCALIDADES ---
  {
    nombre: 'Parque Industrial Hudson',
    slug: 'parque-industrial-hudson',
    partido: 'Berazategui',
    localidad: 'Guillermo E. Hudson',
    direccionAcceso: 'Autopista Buenos Aires - La Plata km 32',
    conectividad: 'Bajada directa desde la Autopista Bs As - La Plata y empalme inmediato con Ruta Provincial 2.',
    alquilerM2Referencial: 4.5,
    precioTierraM2Ref: 120,
    latitud: -34.7915,
    longitud: -58.1582,
  },
  {
    nombre: 'Hudson Polo Design',
    slug: 'hudson-polo-design',
    partido: 'Berazategui',
    localidad: 'Guillermo E. Hudson',
    direccionAcceso: 'Autopista Buenos Aires - La Plata y Calle 148',
    conectividad: 'Predio industrial y comercial enfocado en pymes y diseño.',
    alquilerM2Referencial: 5.5,
    precioTierraM2Ref: 130,
    latitud: -34.788,
    longitud: -58.162,
  },
  {
    nombre: 'Parque Industrial Intepark',
    slug: 'parque-industrial-intepark',
    partido: 'Berazategui',
    localidad: 'Berazategui',
    direccionAcceso: 'Autopista Buenos Aires - La Plata',
    conectividad: 'A metros de la Autopista Bs As - La Plata, a 20 minutos del centro de CABA.',
    alquilerM2Referencial: 6.0,
    precioTierraM2Ref: 200,
    latitud: -34.7721,
    longitud: -58.2031,
  },
  {
    nombre: 'Parque Industrial Plátanos',
    slug: 'parque-industrial-platanos',
    partido: 'Berazategui',
    localidad: 'Plátanos',
    direccionAcceso: 'Av. Néstor Kirchner',
    conectividad: 'Rápido acceso a la Autopista Buenos Aires - La Plata.',
    alquilerM2Referencial: 4.8,
    precioTierraM2Ref: 110,
    latitud: -34.7801,
    longitud: -58.1812,
  },
  {
    nombre: 'Parque Industrial Pibera',
    slug: 'parque-industrial-pibera',
    partido: 'Berazategui',
    localidad: 'El Pato',
    direccionAcceso: 'Ruta Provincial 2 km 38',
    conectividad: 'Ubicado estratégicamente sobre Ruta 2.',
    alquilerM2Referencial: 4.5,
    precioTierraM2Ref: 75,
    latitud: -34.841,
    longitud: -58.145,
  },

  // --- QUILMES Y SUS LOCALIDADES ---
  {
    nombre: 'Parque Industrial de Quilmes',
    slug: 'parque-industrial-de-quilmes',
    partido: 'Quilmes',
    localidad: 'Bernal',
    direccionAcceso: 'Camino General Belgrano y Av. Calchaquí',
    conectividad: 'Excelente ubicación urbana con conectividad fluida hacia CABA y puerto.',
    alquilerM2Referencial: 5.0,
    precioTierraM2Ref: 150,
    latitud: -34.7312,
    longitud: -58.2841,
  },
  {
    nombre: 'La Bernalesa',
    slug: 'la-bernalesa',
    partido: 'Quilmes',
    localidad: 'Bernal',
    direccionAcceso: 'Av. San Martín y Zapiola',
    conectividad: 'Parque industrial privado urbano reconvertido para pymes y tecnología.',
    alquilerM2Referencial: 6.0,
    precioTierraM2Ref: 180,
    latitud: -34.7088,
    longitud: -58.2792,
  },

  // --- OTROS PARQUES ---
  {
    nombre: 'Parque Industrial Cañuelas (PIC I y II)',
    slug: 'parque-industrial-canuelas',
    partido: 'Cañuelas',
    localidad: 'Cañuelas',
    direccionAcceso: 'Ruta Nacional 3 y Ruta Provincial 6',
    conectividad: 'Nudo neurálgico logístico conectando el puerto y el interior del país.',
    alquilerM2Referencial: 4.5,
    precioTierraM2Ref: 60,
    latitud: -35.0531,
    longitud: -58.741,
  },
  {
    nombre: 'Parque Industrial La Plata',
    slug: 'parque-industrial-la-plata',
    partido: 'La Plata',
    localidad: 'Abasto',
    direccionAcceso: 'Ruta Provincial 2 km 50',
    conectividad: 'Sobre Ruta 2 con fácil llegada al puerto de La Plata y conexión a CABA.',
    alquilerM2Referencial: 4.0,
    precioTierraM2Ref: 50,
    latitud: -35.0012,
    longitud: -58.0821,
  },
  {
    nombre: 'Parque Industrial Almirante Brown',
    slug: 'parque-industrial-almirante-brown',
    partido: 'Almirante Brown',
    localidad: 'Burzaco',
    direccionAcceso: 'Ruta Provincial 4 (Camino de Cinturón) y Ruta 210',
    conectividad: 'Uno de los parques industriales más grandes del Gran Buenos Aires.',
    alquilerM2Referencial: 5.0,
    precioTierraM2Ref: 110,
    latitud: -34.8492,
    longitud: -58.3912,
  },
  {
    nombre: 'Parque Industrial San Vicente',
    slug: 'parque-industrial-san-vicente',
    partido: 'San Vicente',
    localidad: 'San Vicente',
    direccionAcceso: 'Ruta Provincial 6 y Ruta 58',
    conectividad: 'Eje del tercer anillo industrial con fuerte proyección agroindustrial.',
    alquilerM2Referencial: 4.0,
    precioTierraM2Ref: 45,
    latitud: -35.021,
    longitud: -58.428,
  },
  {
    nombre: 'Parque Industrial Presidente Perón',
    slug: 'parque-industrial-presidente-peron',
    partido: 'Presidente Perón',
    localidad: 'Guernica',
    direccionAcceso: 'Ruta Provincial 210',
    conectividad: 'Conexión estratégica con la nueva Autopista Presidente Perón.',
    alquilerM2Referencial: 4.2,
    precioTierraM2Ref: 55,
    latitud: -34.9215,
    longitud: -58.3812,
  },
  {
    nombre: 'Cir2',
    slug: 'cir2',
    partido: 'Florencio Varela',
    localidad: 'Florencio Varela',
    direccionAcceso: 'Ruta Provincial 36 km 33',
    conectividad: 'Centro Industrial y Logístico sobre la Ruta 36.',
    alquilerM2Referencial: 4.5,
    precioTierraM2Ref: 70,
    latitud: -34.821,
    longitud: -58.231,
  },
  {
    nombre: 'Goodpark Garín',
    slug: 'goodpark-garin',
    partido: 'Escobar',
    localidad: 'Garín',
    direccionAcceso: 'Panamericana Ramal Campana km 38',
    conectividad: 'Corredor industrial norte de máxima liquidez sobre la Ruta Panamericana.',
    alquilerM2Referencial: 6.5,
    precioTierraM2Ref: 160,
    latitud: -34.4215,
    longitud: -58.718,
  },
  {
    nombre: 'Centro Logístico Munro',
    slug: 'centro-logistico-munro',
    partido: 'Vicente López',
    localidad: 'Munro',
    direccionAcceso: 'Av. Mitre y Panamericana',
    conectividad: 'Ubicación urbana de primera milla a minutos de CABA.',
    alquilerM2Referencial: 8.0,
    precioTierraM2Ref: 250,
    latitud: -34.5291,
    longitud: -58.521,
  },
  {
    nombre: 'Goodpark Hurlingham',
    slug: 'goodpark-hurlingham',
    partido: 'Hurlingham',
    localidad: 'Hurlingham',
    direccionAcceso: 'Camino del Buen Ayre',
    conectividad: 'Salida directa al Camino del Buen Ayre y empalme con Acceso Oeste y Panamericana.',
    alquilerM2Referencial: 6.0,
    precioTierraM2Ref: 140,
    latitud: -34.5821,
    longitud: -58.6412,
  },
  {
    nombre: 'Goodpark Pablo Podestá',
    slug: 'goodpark-pablo-podesta',
    partido: 'Tres de Febrero',
    localidad: 'Pablo Podestá',
    direccionAcceso: 'Ruta Provincial 4 (Camino de Cinturón)',
    conectividad: 'Punto estratégico en zona noroeste sobre Camino de Cinturón.',
    alquilerM2Referencial: 5.5,
    precioTierraM2Ref: 130,
    latitud: -34.581,
    longitud: -58.5912,
  },
  {
    nombre: 'Goodpark Tres de Febrero',
    slug: 'goodpark-tres-de-febrero',
    partido: 'Tres de Febrero',
    localidad: 'Tres de Febrero',
    direccionAcceso: 'Av. Márquez y Au. Camino del Buen Ayre',
    conectividad: 'Excelente ubicación pyme logística en el noroeste del conurbano.',
    alquilerM2Referencial: 5.8,
    precioTierraM2Ref: 135,
    latitud: -34.5901,
    longitud: -58.582,
  },
];

async function main() {
  console.log('🌱 Poblando catálogo de Parques Industriales con búsqueda jerárquica de Zonas...');

  const zonasBD = await prisma.zona.findMany();

  for (const item of parquesData) {
    // 1. Intentamos encontrar primero la LOCALIDAD EXACTA (Hija)
    let zonaMatcheada = zonasBD.find(
      (z) => z.nombre.toLowerCase().trim() === item.localidad.toLowerCase().trim()
    );

    // 2. Si no existe la localidad exacta, intentamos matchear por el PARTIDO (Padre)
    if (!zonaMatcheada) {
      zonaMatcheada = zonasBD.find(
        (z) => z.nombre.toLowerCase().trim() === item.partido.toLowerCase().trim()
      );
    }

    // 3. Fallback: búsqueda de coincidencia parcial
    if (!zonaMatcheada) {
      zonaMatcheada = zonasBD.find((z) =>
        z.nombre.toLowerCase().includes(item.localidad.toLowerCase()) ||
        z.nombre.toLowerCase().includes(item.partido.toLowerCase())
      );
    }

    const dataAInsertar = {
      nombre: item.nombre,
      slug: item.slug,
      direccionAcceso: item.direccionAcceso,
      conectividad: item.conectividad,
      alquilerM2Referencial: item.alquilerM2Referencial,
      precioTierraM2Ref: item.precioTierraM2Ref,
      latitud: item.latitud,
      longitud: item.longitud,
      zonaId: zonaMatcheada ? zonaMatcheada.id : null,
    };

    await prisma.parqueIndustrial.upsert({
      where: { slug: item.slug },
      update: dataAInsertar,
      create: dataAInsertar,
    });

    if (zonaMatcheada) {
      console.log(`  ✓ ${item.nombre} → Asignado a Zona: "${zonaMatcheada.nombre}" (ID: ${zonaMatcheada.id})`);
    } else {
      console.log(`  ⚠ ${item.nombre} → No se encontró zona para "${item.localidad}, ${item.partido}". Quedó sin zonaId.`);
    }
  }

  console.log(`\n✅ ${parquesData.length} Parques Industriales cargados correctamente.`);
}

main()
  .catch((e) => {
    console.error('❌ Error en el Seed de Parques:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });