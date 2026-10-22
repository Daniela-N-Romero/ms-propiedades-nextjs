import { notFound } from "next/navigation";
import Link from "next/link";
import { PropuestasService } from "@/features/propuestas/services/propuesta.service";
import PropuestaAdminTracker from "@/features/propuestas/components/propuesta-admin-tracker";
import { PropuestaFactory } from "@/features/propuestas/strategies/propuesta-factory";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PropuestaDinamicaPage({ params }: Props) {
  const { slug } = await params;

  // Consulta desacoplada a través del servicio
  const propuesta = await PropuestasService.obtenerPorSlug(slug);

  if (!propuesta) notFound();

  const strategy = PropuestaFactory.getStrategy(propuesta.tipo);
  const metricas = strategy.calcularMetricas(propuesta.items, propuesta.payloadJson);

  const esInversion = propuesta.tipo === "INVERSION_DESARROLLO";

  return (
    <div
      className={`min-h-screen flex flex-col font-sans ${
        esInversion ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"
      }`}
    >
      <PropuestaAdminTracker id={propuesta.id} />

      {/* CABECERA CON LOGO OFICIAL */}
      <header
        className={`border-b sticky top-0 z-50 backdrop-blur-md ${
          esInversion
            ? "bg-slate-900/90 border-slate-800 text-white"
            : "bg-white/95 border-slate-200 text-slate-900 shadow-xs"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 shrink-0">
              <img
                src={
                  esInversion
                    ? "/images/logos/ms-white-no-words.png"
                    : "/images/logos/ms-blue-no-words.png"
                }
                alt="MS Propiedades Industriales"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <h1 className="text-sm md:text-base font-bold tracking-tight flex items-center gap-2">
                <span>MS PROPIEDADES INDUSTRIALES</span>
                <span
                  className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${
                    esInversion
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {esInversion ? "📈 Informe de Rentabilidad & ROI" : "🚚 Propuesta Logística"}
                </span>
              </h1>
              <p
                className={`text-xs ${
                  esInversion ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Presentado para:{" "}
                <strong className={esInversion ? "text-white" : "text-slate-900"}>
                  {propuesta.clienteNombre}
                </strong>
                {propuesta.clienteEmpresa && (
                  <span className="font-semibold text-blue-600"> ({propuesta.clienteEmpresa})</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Link
              href="/"
              target="_blank"
              className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${
                esInversion
                  ? "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200"
              }`}
            >
              Ir a MS Propiedades 🌐
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL RENDERIZADO POR LA ESTRATEGIA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {strategy.renderView({ propuesta, metricas })}
      </main>
    </div>
  );
}