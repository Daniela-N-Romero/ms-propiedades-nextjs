import { NextResponse } from "next/server";
import { prisma } from "@/backend/db";

// GET: Listar todas las propuestas
export async function GET() {
  try {
    const propuestas = await prisma.propuestaComercial.findMany({
      include: {
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(propuestas);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener propuestas" }, { status: 500 });
  }
}

// POST: Crear propuesta
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clienteNombre, slug, puntoInteresNombre, puntoInteresLat, puntoInteresLng, items } = body;

    const nuevaPropuesta = await prisma.propuestaComercial.create({
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
            orden: item.orden ?? (index + 1),
          }))
        }
      }
    });

    return NextResponse.json(nuevaPropuesta, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear la propuesta" }, { status: 500 });
  }
}