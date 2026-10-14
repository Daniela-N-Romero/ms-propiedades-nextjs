import { NextResponse } from "next/server";
import { PropuestasService } from "@/backend/services/propuesta.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const propuesta = await PropuestasService.obtenerPorId(id);
    if (!propuesta) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }
    return NextResponse.json(propuesta);
  } catch (error) {
    console.error("Error al obtener propuesta por ID:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  try {
    const propuestaActualizada = await PropuestasService.actualizar(id, body);
    return NextResponse.json(propuestaActualizada);
  } catch (error) {
    console.error("Error al actualizar propuesta:", error);
    return NextResponse.json(
      { error: "Error al actualizar la propuesta" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await PropuestasService.eliminarPorId(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al eliminar propuesta:", error);
    return NextResponse.json(
      { error: "Error al eliminar la propuesta" },
      { status: 500 }
    );
  }
}