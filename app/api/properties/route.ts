import { NextResponse } from 'next/server';
import { prisma } from '@/backend/db';
import { verifySession } from '@/lib/utils-auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    // Validar sesión
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const session = token ? await verifySession(token) : null;

    if (!session) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    // Leer si estamos pidiendo activas o la papelera
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'activas';

    // Traer todas las propiedades ordenadas por fecha de actualización
    const propiedades = await prisma.propiedad.findMany({
      where: {
        deletedAt: tab === 'papelera' ? { not: null } : null,
      },
      include: {
        zona: {
          include: {
            padre: {
              include: {
                padre: true,
              },
            },
          },
        },
        tipoInmueble: {
          include: { padre: true },
        },
        agente: true,
        colega: true,
        propietario: true,
        imagenes: {
          orderBy: { orden: 'asc' },
          take: 1, // Solo la portada para la tabla
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(propiedades);
  } catch (error) {
    console.error('Error al obtener propiedades:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}