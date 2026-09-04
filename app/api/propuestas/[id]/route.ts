import { NextResponse } from "next/server";
import { prisma } from "@/backend/db";

// GET: Obtener propuesta por ID para editar
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const propuesta = await prisma.propuestaComercial.findUnique({
    where: { id },
    include: { items: true }
  });
  if (!propuesta) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json(propuesta);
}

// PUT: Actualizar propuesta
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { clienteNombre, slug, puntoInteresNombre, puntoInteresLat, puntoInteresLng, items } = body;

  try {
    // Usamos transacción para borrar los items viejos y crear los nuevos actualizados
    const propuestaActualizada = await prisma.$transaction(async (tx) => {
      await tx.propuestaItem.deleteMany({ where: { propuestaId: id } });

      return await tx.propuestaComercial.update({
        where: { id },
        data: {
          clienteNombre,
          slug,
          puntoInteresNombre,
          puntoInteresLat,
          puntoInteresLng,
          items: {
            create: items.map((item: any, index: number) => ({
              propiedadId: item.propiedadId,
              esPrioritaria: item.esPrioritaria || false,
              notaLogistica: item.notaLogistica || "",
              tiempoEstimadoString: item.tiempoEstimadoString || "",
              orden: index
            }))
          }
        }
      });
    });

    return NextResponse.json(propuestaActualizada);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

// DELETE: Eliminar propuesta
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.propuestaComercial.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}