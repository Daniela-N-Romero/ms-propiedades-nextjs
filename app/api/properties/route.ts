// app/api/properties/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/backend/db';
import { verifySession } from '@/lib/utils-auth';
import { cookies } from 'next/headers';
import { Prisma } from '@prisma-client';

export async function GET(request: Request) {
  try {
    // 1. Validar sesión
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const session = token ? await verifySession(token) : null;

    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    // 2. Extraer parámetros de URL
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'activas';
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.max(1, Number(searchParams.get('limit')) || 25); // Default 25 por página
    const search = searchParams.get('search')?.trim() || '';
    const mercado = searchParams.get('mercado') || '';
    const missingMedia = searchParams.get('missingMedia') || 'all';
    const source = searchParams.get('source') || 'all'; // 'ms_propia' | 'colega' | 'all'
    const sortBy = searchParams.get('sortBy') || 'updatedAt_desc';

    // 3. Construir cláusula WHERE dinámica
    const andConditions: Prisma.PropiedadWhereInput[] = [
      { deletedAt: tab === 'papelera' ? { not: null } : null },
    ];

    // Filtro por origen (Cartera propia vs Colega)
    if (source === 'colega') {
      andConditions.push({
        OR: [{ origen: 'fromColleague' }, { colegaId: { not: null } }],
      });
    } else if (source === 'ms_propia') {
      andConditions.push({
        AND: [{ origen: { not: 'fromColleague' } }, { colegaId: null }],
      });
    }

    // 2. Filtro por Búsqueda de Texto
    if (search) {
      andConditions.push({
        OR: [
          { titulo: { contains: search, mode: 'insensitive' } },
          { codigo: { contains: search, mode: 'insensitive' } },
          { zona: { nombre: { contains: search, mode: 'insensitive' } } },
        ],
      });
    }

    // 3. Filtro por Mercado
    if (mercado) {
      andConditions.push({
        tipoInmueble: {
          OR: [{ slug: mercado }, { padre: { slug: mercado } }],
        },
      });
    }

    // 4. Filtro BBDD de Faltantes / Calidad
    if (missingMedia === 'no_images') {
      andConditions.push({ imagenes: { none: {} } });
    } else if (missingMedia === 'no_video') {
      andConditions.push({ OR: [{ videoUrl: null }, { videoUrl: '' }] });
    } else if (missingMedia === 'no_pdf') {
      andConditions.push({ OR: [{ pdfUrl: null }, { pdfUrl: '' }] });
    }

    // Unificamos todo en la condición principal
    const whereConditions: Prisma.PropiedadWhereInput = {
      AND: andConditions,
    };

    // Ordenamiento Dinámico
    let orderByCondition: Prisma.PropiedadOrderByWithRelationInput = { updatedAt: 'desc' };
    if (sortBy === 'updatedAt_asc') orderByCondition = { updatedAt: 'asc' };
    if (sortBy === 'precio_asc') orderByCondition = { precio: 'asc' };
    if (sortBy === 'precio_desc') orderByCondition = { precio: 'desc' };
    if (sortBy === 'titulo_asc') orderByCondition = { titulo: 'asc' };

    // 4. Consulta Paralela: Datos Paginados + Conteo Total
    const [propiedadesRaw, total] = await Promise.all([
      prisma.propiedad.findMany({
        where: whereConditions,
        take: limit,
        skip: (page - 1) * limit,
        select: {
          id: true,
          codigo: true,
          titulo: true,
          slug: true,
          precio: true,
          moneda: true,
          isPublished: true,
          isUnlisted: true,
          isDestacada: true,
          origen: true,
          videoUrl: true,
          pdfUrl: true,
          categoria: true,
          updatedAt: true,
          deletedAt: true,
          propietarioId: true,
          colegaId: true,
          zonaId: true,
          zona: {
            select: {
              id: true,
              nombre: true,
              padre: {
                select: {
                  id: true,
                  nombre: true,
                  padreId: true,
                  padre: { select: { id: true, nombre: true, padreId: true } },
                },
              },
            },
          },
          tipoInmueble: {
            select: {
              nombre: true,
              padre: { select: { slug: true } },
            },
          },
          imagenes: {
            take: 1,
            orderBy: { orden: 'asc' },
            select: { url: true },
          },
        },
        orderBy: orderByCondition,
      }),
      prisma.propiedad.count({ where: whereConditions }),
    ]);

    // Sanitizado de números
    const propiedades = propiedadesRaw.map((p) => ({
      ...p,
      precio: Number(p.precio || 0),
    }));

    return NextResponse.json({
      propiedades,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error al obtener propiedades en Dashboard:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}