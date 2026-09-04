import { prisma } from "@/backend/db";
import { notFound } from "next/navigation";
import PropuestaInteractiveView from "@/features/propuestas/propuesta-interactive-view";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PropuestaDinamicaPage({ params }: Props) {
  const { slug } = await params;

  // 1. Buscar la propuesta con sus propiedades relacionadas desde la BBDD
  const propuesta = await prisma.propuestaComercial.findUnique({
    where: { slug },
    include: {
      items: {
        include: {
          propiedad: {
            include: {
              imagenes: true,
              zona: true,
            },
          },
        },
        orderBy: { orden: "asc" },
      },
    },
  });

  if (!propuesta) notFound();

  // 2. Mapear datos a la vista interactiva
const propiedadesParaVista = propuesta.items.map((item) => {
  const p = item.propiedad;

  // Calculamos el valor por m² si existen precio y superficie cubierta
  let precioM2Calculado = "Consulte";
  if (p.precio && p.superficieCubierta && Number(p.superficieCubierta) > 0) {
    const m2 = Number(p.superficieCubierta);
    const precioNum = Number(p.precio);
    const valorM2 = (precioNum / m2).toLocaleString("es-AR", {
      maximumFractionDigits: 2,
    });
    precioM2Calculado = `${p.moneda} ${valorM2} / m²`;
  }

  return {
    id: String(p.id), // Convertimos el ID numérico a string
    slug: p.slug,
    title: p.titulo,
    localidad: p.zona?.nombre || "Ubicación Industrial",
    lat: p.latitud ? Number(p.latitud) : 0, // Convertimos Decimal de Prisma a number de JS
    lng: p.longitud ? Number(p.longitud) : 0, // Convertimos Decimal de Prisma a number de JS
    precio: `${p.moneda} ${Number(p.precio).toLocaleString("es-AR")}`,
    precioM2: precioM2Calculado, // Valor por m² o "Consulte"
    supCubierta: p.superficieCubierta ? `${p.superficieCubierta} m²` : "Sin especificar",
    supTerreno: p.superficieTotal ? `${p.superficieTotal} m²` : "Sin especificar",
    tiempoRuta: item.tiempoEstimadoString || "Ruta directa",
    ahorroTiempo: item.notaLogistica || "",
    aptitud: p.descripcion ? `${p.descripcion.substring(0, 120)}...` : "Apto para logística y depósito",
    prioritaria: item.esPrioritaria,
    orden: item.orden,
    imagen: p.imagenes && p.imagenes.length > 0 ? p.imagenes[0].url : "/images/placeholder.png",
  };
});


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Encabezado Personalizado */}
<header className="bg-slate-900 text-white p-5 shadow-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-blue-400">MS PROPIEDADES INDUSTRIALES</h1>
              <span className="bg-emerald-600/30 text-emerald-400 text-xs px-2.5 py-0.5 rounded border border-emerald-500/30">
                Propuesta Interactiva
              </span>
            </div>
            <p className="text-sm text-gray-300 mt-1">
              Presentado para: <strong className="text-white">{propuesta.clienteNombre}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="bg-slate-800/80 border border-slate-700 text-blue-200 text-xs px-3 py-1.5 rounded-lg">
              📍 Destino: <strong>{propuesta.puntoInteresNombre}</strong>
            </div>

            {/* Navegación rápida hacia el sitio principal */}
            <Link
              href="/"
              target="_blank"
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 font-semibold"
            >
              Ir a MS Propiedades 🌐
            </Link>
          </div>
        </div>
      </header>

      {/* Componente de la vista interactiva del mapa */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        <PropuestaInteractiveView
          propiedades={propiedadesParaVista}
          destinoCoords={[propuesta.puntoInteresLat, propuesta.puntoInteresLng]}
          puntoInteresNombre={propuesta.puntoInteresNombre}
        />
      </main>
    </div>
  );
}