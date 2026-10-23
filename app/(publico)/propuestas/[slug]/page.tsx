//app\(publico)\propuestas\[slug]\page.tsx

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
        className={`border-b relative w-full z-10 ${
          esInversion
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-white border-slate-200 text-slate-900 shadow-xs"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3.5 py-3 sm:px-4 sm:py-3.5 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          
          {/* SECCIÓN IZQUIERDA: LOGO + MARCA + BADGE */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0">
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

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-base font-extrabold tracking-tight uppercase truncate">
                  MS Propiedades
                </span>
                <span
                  className={`text-[8px] sm:text-[10px] uppercase font-black px-2 py-0.5 rounded-full border shrink-0 ${
                    esInversion
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}
                >
                  {esInversion ? "📈 Informe ROI" : "🚚 Logística"}
                </span>
              </div>

              <p
                className={`text-[10px] sm:text-xs truncate mt-0.5 ${
                  esInversion ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Presentado para:{" "}
                <strong className={esInversion ? "text-white" : "text-slate-900"}>
                  {propuesta.clienteNombre}
                </strong>
                {propuesta.clienteEmpresa && (
                  <span className="font-semibold text-blue-500">
                    {" "}({propuesta.clienteEmpresa})
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* BOTÓN DE ACCIÓN EXTERNO */}
          <div className="flex items-center justify-end shrink-0">
            <Link
              href="/"
              target="_blank"
              className={`w-full sm:w-auto text-center text-[11px] sm:text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border transition-all ${
                esInversion
                  ? "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 active:bg-slate-600"
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