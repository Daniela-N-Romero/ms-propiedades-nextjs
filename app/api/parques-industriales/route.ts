import { NextResponse } from "next/server";
import { prisma } from "@/backend/db";

export async function GET() {
  try {
    const parques = await prisma.parqueIndustrial.findMany({
      orderBy: { nombre: "asc" },
      include: {
        zona: {
          select: { id: true, nombre: true },
        },
      },
    });

    return NextResponse.json(parques);
  } catch (error) {
    console.error("Error al obtener parques:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}