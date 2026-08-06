import 'dotenv/config';
import { prisma } from '@/backend/db';
import { generarCodigoRef, slugify } from '@/lib/utils-formatting'
import { readLegacyJson } from '@/lib/utils-server'
import { seedZonas } from './seed-zonas';
import { seedTipos } from './seed-tipos';
import bcrypt from 'bcryptjs';
import {
    UserRoleEnum,
    MonedaEnum,
    TipoOperacionEnum,
    OrigenPropiedadEnum,
} from '@/prisma/generated/enums';

async function main() {

    console.log('🚀 Iniciando Migración Completa de Base Legacy...');

    const passwordHash = await bcrypt.hash('admin123', 10);

    //  Ejecutar el Seed de Zonas, tipos y admin
    await seedZonas();
    await seedTipos();

    const admin = await prisma.agente.upsert({
        where: { email: 'admin@mspropiedades.com.ar' },
        update: {},
        create: {
            nombre: 'Admin',
            apellido: 'MS',
            email: 'admin@mspropiedades.com.ar',
            telefono: '1112345678',
            passwordHash: passwordHash,
            rol: UserRoleEnum.admin
        },
    });

    // Traer todas las zonas cargadas con sus padres para las búsquedas
    const todasLasZonas = await prisma.zona.findMany();
    const zonaFallback =
        todasLasZonas.find((z) => z.nombre === 'Berazategui' || z.nombre === 'GBA Sur') ||
        todasLasZonas[0];

    // -------------------------------------------------------------
    // 1. MIGRACIÓN DE AGENTES (Agente en Prisma)
    // -------------------------------------------------------------
    console.log('1️⃣ Migrando Agentes...');
    const legacyAgents = readLegacyJson('backend/db/seed/agents_legacy.json');
    const agentMap = new Map<number, number>(); // ID viejo -> ID nuevo

    for (const a of legacyAgents) {
        // Desglosamos Nombre y Apellido
        const parts = a.fullName.trim().split(' ') || '?';
        const nombre = parts[0] || '?';
        const apellido = parts.slice(1).join(' ') || '?';
        const emailCalculado = `${nombre.toLowerCase()}.${apellido.toLowerCase().replace(/ /g, '')}@mspropiedades.com.ar`;

        const agente = await prisma.agente.upsert({
            where: { email: emailCalculado },
            update: {
                nombre,
                apellido,
                telefono: a.phoneNumber || null,
            },
            create: {
                nombre,
                apellido,
                telefono: a.phoneNumber || null,
                email: emailCalculado,
                passwordHash: '$2a$10$wN1eK9X7A0j3B0yZ7n9uA.H6rR3iX2yB0n1u2v3w4x5y6z7a8b9c0', // 'admin123'
                rol: 'agente',
            },
        });

        agentMap.set(a.id, agente.id);
    }
    console.log(`✅ Agentes procesados: ${agentMap.size}`);

    // -------------------------------------------------------------
    // 2. MIGRACIÓN DE PROPIETARIOS (Propietario en Prisma)
    // -------------------------------------------------------------
    console.log('2️⃣ Migrando Propietarios...');
    const legacyOwners = readLegacyJson('backend/db/seed/owners_legacy.json');
    const ownerMap = new Map<number, number>();

    for (const o of legacyOwners) {
        const parts = o.fullName.trim().split(' ');
        const nombre = parts[0];
        const apellido = parts.slice(1).join(' ');

        const propietario = await prisma.propietario.create({
            data: {
                nombre: nombre || '?',
                apellido: apellido || '?',
                telefono: o.phoneNumber || null,
                email: o.email || null,
                notasPrivadas: o.privateNotes || null,
            },
        });

        ownerMap.set(o.id, propietario.id);
    }
    console.log(`✅ Propietarios procesados: ${ownerMap.size}`);

    // -------------------------------------------------------------
    // 3. MIGRACIÓN DE COLEGAS (Colega en Prisma)
    // -------------------------------------------------------------
    console.log('3️⃣ Migrando Inmobiliarias Colegas...');
    const legacyColleagues = readLegacyJson('backend/db/seed/colleagues_legacy.json');
    const colleagueMap = new Map<number, number>();

    for (const c of legacyColleagues) {
        const parts = c.fullName.trim().split(' ');
        const nombre = parts[0];
        const apellido = parts.slice(1).join(' ')
        const colega = await prisma.colega.create({
            data: {
                nombre: nombre || '?',
                apellido: apellido || '?',
                inmobiliaria: c.agencyName || '?',
                telefono: c.phoneNumber || null,
                email: c.email || null,
                notasPrivadas: c.privateNotes || null,
            },
        });

        colleagueMap.set(c.id, colega.id);
    }
    console.log(`✅ Colegas procesados: ${colleagueMap.size}`);

    // -------------------------------------------------------------
    // 4. GARANTIZAR ZONAS Y TIPOS DE INMUEBLE BASE
    // -------------------------------------------------------------
    // 5. MIGRAR TIPOS BASE
    const tiposExistentes = await prisma.tipoInmueble.findMany();
    let tipoDefault = tiposExistentes[0];

    // 6. MIGRAR PROPIEDADES REALES
    console.log('🏠 Migrando Propiedades...');
    const legacyProps = readLegacyJson('backend/db/seed/propiedades_legacy.json');

    let creadasCount = 0;
    let erroresCount = 0;

    // Agente por defecto si el ID del legacy no existe o viene null
    const agenteDefaultId = admin.id;

    for (const prop of legacyProps) {
        try {
            const codigoRef = generarCodigoRef(prop);
            const baseSlug = slugify(prop.name || `propiedad-${prop.id}`);
            const slugRef = `${baseSlug}-${codigoRef.toLowerCase()}`;

            // BUSCADOR INTELIGENTE DE ZONA
            const barrio = prop.neighbourhood ? prop.neighbourhood.toLowerCase().trim() : '';
            const partido = prop.locality ? prop.locality.toLowerCase().trim() : '';

            let zonaMatch = todasLasZonas.find((z) => {
                const zNombre = z.nombre.toLowerCase();
                return (barrio && zNombre === barrio) || (partido && zNombre === partido);
            });

            if (!zonaMatch) {
                zonaMatch = todasLasZonas.find((z) => {
                    const zNombre = z.nombre.toLowerCase();
                    return (barrio && zNombre.includes(barrio)) || (partido && zNombre.includes(partido));
                });
            }

            const zonaIdToUse = zonaMatch ? zonaMatch.id : zonaFallback.id;

            // Buscar Tipo de Inmueble
            let tipoMatch = tiposExistentes.find((t) => t.slug === prop.subtype);
            if (!tipoMatch) {
                tipoMatch = tiposExistentes.find((t) => t.slug === prop.type);
            }
            const tipoIdToUse = tipoMatch ? tipoMatch.id : tipoDefault.id;

            // Mapear Relaciones (Asegurando Agente obligatorio)
            const nuevoAgenteId = prop.agentId ? (agentMap.get(prop.agentId) || agenteDefaultId) : agenteDefaultId;
            const nuevoPropietarioId = prop.ownerId ? (ownerMap.get(prop.ownerId) || null) : null;
            const nuevoColegaId = prop.colleagueId ? (colleagueMap.get(prop.colleagueId) || null) : null;

            // Determinar origen, moneda y categoría
            const origenEnum = (prop.propertySource === 'colega' || prop.colleagueId)
                ? OrigenPropiedadEnum.fromColleague
                : OrigenPropiedadEnum.own;

            const monedaEnum = prop.currency === 'ARS' ? MonedaEnum.ARS : MonedaEnum.USD;
            const categoriaEnum = prop.category === 'alquiler' ? TipoOperacionEnum.alquiler : TipoOperacionEnum.venta;

            // Tratamiento de imágenes
            let arrayImagenes: string[] = [];
            if (Array.isArray(prop.images) && prop.images.length > 0) {
                arrayImagenes = prop.images;
            } else {
                arrayImagenes = ['/images/placeholder.png'];
            }

            // Coordenadas
            const latNum = parseFloat(prop.latitude);
            const lngNum = parseFloat(prop.longitude);

            await prisma.propiedad.upsert({
                where: { codigo: codigoRef },
                update: {
                    titulo: prop.name || 'Propiedad sin nombre',
                    precio: parseFloat(prop.price) || 0,
                    moneda: monedaEnum,
                    isPublished: prop.isPublished !== undefined ? Boolean(prop.isPublished) : true,
                    caracteristicas: prop.specificCharacteristics || undefined,
                    agenteId: nuevoAgenteId,
                },
                create: {
                    codigo: codigoRef,
                    titulo: prop.name || 'Propiedad en Venta/Alquiler',
                    slug: slugRef,
                    descripcion: prop.description || 'Sin descripción disponible.',
                    precio: parseFloat(prop.price) || 0,
                    moneda: monedaEnum,
                    categoria: categoriaEnum,
                    origen: origenEnum,

                    latitud: !isNaN(latNum) ? latNum : null,
                    longitud: !isNaN(lngNum) ? lngNum : null,
                    direccionPersonalizada: prop.address || null,

                    superficieTotal: parseFloat(prop.totalSurface) || null,
                    superficieCubierta: parseFloat(prop.coveredSurface) || null,

                    videoUrl: prop.videoUrl || null,
                    pdfUrl: prop.pdfUrl || null,

                    isPublished: prop.isPublished !== undefined ? Boolean(prop.isPublished) : true,
                    notasPrivadas: prop.privateNotes || null,
                    caracteristicas: prop.specificCharacteristics || undefined,

                    // Relaciones clave
                    zonaId: zonaIdToUse,
                    tipoInmuebleId: tipoIdToUse,
                    agenteId: nuevoAgenteId, // Siempre garantiza un ID entero válido
                    propietarioId: nuevoPropietarioId,
                    colegaId: nuevoColegaId,

                    imagenes: {
                        create: arrayImagenes.map((urlImg: string, index: number) => ({
                            url: urlImg,
                            orden: index,
                        })),
                    },
                },
            });

            creadasCount++;
            console.log(`Propidedades creadas:`, creadasCount)

        } catch (err) {
            erroresCount++;
            console.error(`⚠️ Error al migrar propiedad ID legacy ${prop.id}:`, err);
        }
    }
}

main()
    .catch((e) => {
        console.error('❌ Error en el proceso:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });