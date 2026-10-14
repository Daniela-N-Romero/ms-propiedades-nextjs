import { NextResponse } from "next/server";
import { PropuestasService } from "@/backend/services/propuesta.service";

export async function GET() {
  try {
    const propuestas = await PropuestasService.obtenerListadoAdmin();
    return NextResponse.json(propuestas);
  } catch (error) {
    console.error("Error al obtener propuestas:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const propuesta = await PropuestasService.crear(body);
    return NextResponse.json(propuesta);
  } catch (error) {
    console.error("Error al crear propuesta:", error);
    return NextResponse.json({ error: "Error al crear la propuesta" }, { status: 500 });
  }
}