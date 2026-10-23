"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePropuestaFormState } from "../hooks/use-propuesta-form-state";
import { ClienteSection } from "./form-sections/cliente-section";
import { PremisasInversionSection } from "./form-sections/premisas-inversion-section";
import { RecomendacionesSection } from "./form-sections/recomendaciones-section";
import { InmueblesSeleccionadosSection } from "./form-sections/inmuebles-seleccionados-section";
import { BuscadorCatalogoSection } from "./form-sections/buscador-catalogo-section";

const LocationPickerDestino = dynamic(
  () => import("@/features/propuestas/components/location-picker-destino"),
  { ssr: false, loading: () => <div className="p-4 text-xs text-slate-500">Cargando mapa...</div> }
);

interface Props {
  initialData?: any;
  propuestaId?: string;
  defaultTipo?: "LOGISTICA_RUTAS" | "INVERSION_DESARROLLO";
}

export default function PropuestaForm({ initialData, propuestaId, defaultTipo = "LOGISTICA_RUTAS" }: Props) {
  const form = usePropuestaFormState(initialData, propuestaId, defaultTipo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteNombre || !form.slug || form.itemsSeleccionados.length === 0) {
      alert("Por favor completa el cliente y selecciona al menos una propiedad.");
      return;
    }

    form.setLoading(true);
    const endpoint = form.isEdit ? `/api/propuestas/${propuestaId}` : "/api/propuestas";
    const method = form.isEdit ? "PUT" : "POST";

    const payloadJson = form.esInversion
      ? {
          costoObraMercadoM2: form.costoObraMercado,
          costoObraPreferencialM2: form.tieneTarifaPreferencial ? form.costoObraPreferencial : null,
          tieneTarifaPreferencial: form.tieneTarifaPreferencial,
          recomendaciones: {
            mostrarSeccion: form.recomMostrar,
            tituloGeneral: form.recomTituloGeneral,
            tarjetas: form.tarjetasRecom,
          },
        }
      : undefined;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: form.tipo,
          clienteNombre: form.clienteNombre,
          clienteEmpresa: form.clienteEmpresa,
          slug: form.slug,
          puntoInteresNombre: form.esInversion ? null : form.puntoNombre,
          puntoInteresLat: form.esInversion ? null : Number(form.puntoLat),
          puntoInteresLng: form.esInversion ? null : Number(form.puntoLng),
          payloadJson,
          items: form.itemsSeleccionados,
        }),
      });

      if (res.ok) {
        form.router.push("/admin/propuestas");
      } else {
        alert("Error al guardar la propuesta.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de red.");
    } finally {
      form.setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      <div className="bg-slate-900 text-white py-4 px-6 mb-8 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/admin/propuestas"
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase transition-all"
          >
            ← Menú Propuestas
          </Link>
          <h1 className="text-base font-bold flex items-center gap-2">
            {form.isEdit ? "✏️ Editar" : "✨ Crear"}{" "}
            {form.esInversion ? (
              <span className="text-amber-400">Propuesta de Inversión y ROI</span>
            ) : (
              <span className="text-blue-400">Propuesta Logística & Rutas</span>
            )}
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <ClienteSection
            clienteNombre={form.clienteNombre}
            setClienteNombre={form.setClienteNombre}
            clienteEmpresa={form.clienteEmpresa}
            setClienteEmpresa={form.setClienteEmpresa}
            slug={form.slug}
            setSlug={form.setSlug}
            isEdit={form.isEdit}
            esInversion={form.esInversion}
          />

          {form.esInversion ? (
            <div className="space-y-6">
              <PremisasInversionSection
                costoObraMercado={form.costoObraMercado}
                setCostoObraMercado={form.setCostoObraMercado}
                costoObraPreferencial={form.costoObraPreferencial}
                setCostoObraPreferencial={form.setCostoObraPreferencial}
                tieneTarifaPreferencial={form.tieneTarifaPreferencial}
                setTieneTarifaPreferencial={form.setTieneTarifaPreferencial}
              />

              <RecomendacionesSection
                recomMostrar={form.recomMostrar}
                setRecomMostrar={form.setRecomMostrar}
                recomTituloGeneral={form.recomTituloGeneral}
                setRecomTituloGeneral={form.setRecomTituloGeneral}
                tarjetasRecom={form.tarjetasRecom}
                itemsSeleccionados={form.itemsSeleccionados}
                agregarTarjetaRecom={form.agregarTarjetaRecom}
                eliminarTarjetaRecom={form.eliminarTarjetaRecom}
                actualizarTarjetaRecom={form.actualizarTarjetaRecom}
				        calcularMetricasItem={form.calcularMetricasItem}
				        maxRoiCalculado={form.maxRoiCalculado}
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 border-b border-slate-100 pb-2">
                📍 Punto de Referencia Logístico
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5 space-y-3">
                  <label className="block text-xs font-bold text-slate-700">Nombre del Destino</label>
                  <input
                    type="text"
                    value={form.puntoNombre}
                    onChange={(e) => form.setPuntoNombre(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="lg:col-span-7 h-48 rounded-xl overflow-hidden border border-slate-200">
                  <LocationPickerDestino
                    lat={form.puntoLat}
                    lng={form.puntoLng}
                    onSelect={(lat, lng) => {
                      form.setPuntoLat(lat);
                      form.setPuntoLng(lng);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <InmueblesSeleccionadosSection
            itemsSeleccionados={form.itemsSeleccionados}
            setItemsSeleccionados={form.setItemsSeleccionados}
            propiedadesBD={form.propiedadesBD}
            extraerSuperficieLote={form.extraerSuperficieLote}
            togglePropiedad={form.togglePropiedad}
            esInversion={form.esInversion}
            calcularMetricasItem={form.calcularMetricasItem}
            extraerMesesEntrega={form.extraerMesesEntrega}
          />

          <BuscadorCatalogoSection
            busqueda={form.busqueda}
            setBusqueda={form.setBusqueda}
            catalogoFiltrado={form.catalogoFiltrado}
            itemsSeleccionados={form.itemsSeleccionados}
            togglePropiedad={form.togglePropiedad}
            parseSeguro={form.parseSeguro}
            extraerSuperficieLote={form.extraerSuperficieLote}
          />

          <button
            type="submit"
            disabled={form.loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3.5 rounded-2xl shadow-md transition-all cursor-pointer disabled:opacity-50 text-sm"
          >
            {form.loading ? "Guardando Propuesta..." : "🚀 Guardar Propuesta Comercial"}
          </button>
        </form>
      </div>
    </div>
  );
}