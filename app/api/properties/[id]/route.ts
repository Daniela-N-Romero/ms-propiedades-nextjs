import { NextResponse } from 'next/server';
import { prisma } from '@/backend/db';

// DELETE: Mover a la papelera (Soft Delete) o con force eliminar definitivamente (Hard Delete)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 👈 1. Tipado como Promise
) {
  try {
    const { id: paramId } = await params; // 👈 2. 'await' obligatorio en Next 15+
    const id = Number(paramId);

    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    if (!id) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    if (force) {
      // Borrado físico definitivo (SOLO en la papelera)
      await prisma.imagen.deleteMany({ where: { propiedadId: id } });
      await prisma.propiedad.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Propiedad eliminada definitivamente' });
    } else {
      // Soft Delete (Mover a la papelera)
      await prisma.propiedad.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isPublished: false, // Despublicamos automáticamente
        },
      });
      return NextResponse.json({ success: true, message: 'Propiedad enviada a la papelera' });
    }
  } catch (error) {
    console.error('Error al eliminar propiedad:', error);
    return NextResponse.json({ error: 'Error procesando la solicitud' }, { status: 500 });
  }
}

// PATCH: Restaurar desde la papelera
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 👈 1. Tipado como Promise
) {
  try {
    const { id: paramId } = await params; // 👈 2. await obligatorio en Next 15
    const id = Number(paramId);

    if (!id) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Intentamos leer el body si viniera, pero no bloqueamos si no hay
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Si no hay body JSON, continuamos
    }

    // Si viene action y no es 'restore', devolvemos error. De lo contrario restauramos.
    if (body.action && body.action !== 'restore') {
      return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }

    await prisma.propiedad.update({
      where: { id },
      data: { deletedAt: null },
    });

    return NextResponse.json({ success: true, message: 'Propiedad restaurada con éxito' });
  } catch (error) {
    console.error('Error al restaurar propiedad:', error);
    return NextResponse.json({ error: 'Error al restaurar propiedad' }, { status: 500 });
  }
}