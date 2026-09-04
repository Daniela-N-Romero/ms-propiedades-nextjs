"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const LocationPickerDestino = dynamic(
  () => import("@/features/propuestas/location-picker-destino"),
  { ssr: false, loading: () => <div className="p-4 text-xs text-gray-500">Cargando mapa de selección...</div> }
);

interface PropiedadSimple {
  id: number;
  codigo: string;
  titulo: string;
  precio: number;
  moneda: string;
  zona?: { nombre: string };
}

interface ItemSeleccionado {
  propiedadId: number;
  esPrioritaria: boolean;
  notaLogistica: string;
  tiempoEstimadoString: string;
  orden: number;
}

export default function CrearPropuestaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [propiedadesBD, setPropiedadesBD] = useState<PropiedadSimple[]>([]);
  const [busqueda, setBusqueda] = useState("");

  // Formulario
  const [clienteNombre, setClienteNombre] = useState("");
  const [slug, setSlug] = useState("");
  const [puntoNombre, setPuntoNombre] = useState("CABA / Puerto Buenos Aires");
  const [puntoLat, setPuntoLat] = useState(-34.617214895404395);
  const [puntoLng, setPuntoLng] = useState(-58.36189974950259);

  const [itemsSeleccionados, setItemsSeleccionados] = useState<ItemSeleccionado[]>([]);

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPropiedadesBD(data);
      })
      .catch((err) => console.error("Error al cargar propiedades:", err));
  }, []);

  const handleNombreChange = (v: string) => {
    setClienteNombre(v);
    setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
  };

  const togglePropiedad = (id: number) => {
    const existe = itemsSeleccionados.some((i) => i.propiedadId === id);
    if (existe) {
      const nuevosItems = itemsSeleccionados
        .filter((i) => i.propiedadId !== id)
        .map((it, idx) => ({
          ...it,
          orden: idx + 1,
          esPrioritaria: idx === 0,
        }));
      setItemsSeleccionados(nuevosItems);
    } else {
      const nuevoItem: ItemSeleccionado = {
        propiedadId: id,
        esPrioritaria: itemsSeleccionados.length === 0,
        notaLogistica: "",
        tiempoEstimadoString: "",
        orden: itemsSeleccionados.length + 1,
      };
      setItemsSeleccionados([...itemsSeleccionados, nuevoItem]);
    }
  };

  const moverArriba = (idx: number) => {
    if (idx <= 0) return;
    const copia = [...itemsSeleccionados];
    const temp = copia[idx - 1];
    copia[idx - 1] = copia[idx];
    copia[idx] = temp;

    setItemsSeleccionados(
      copia.map((it, index) => ({
        ...it,
        orden: index + 1,
        esPrioritaria: index === 0,
      }))
    );
  };

  const moverAbajo = (idx: number) => {
    if (idx >= itemsSeleccionados.length - 1) return;
    const copia = [...itemsSeleccionados];
    const temp = copia[idx + 1];
    copia[idx + 1] = copia[idx];
    copia[idx] = temp;

    setItemsSeleccionados(
      copia.map((it, index) => ({
        ...it,
        orden: index + 1,
        esPrioritaria: index === 0,
      }))
    );
  };

  const propiedadesFiltradas = propiedadesBD.filter(
    (p) =>
      p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.zona?.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteNombre || !slug || itemsSeleccionados.length === 0) {
      alert("Por favor completa el cliente y selecciona al menos una propiedad.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/propuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteNombre,
          slug,
          puntoInteresNombre: puntoNombre,
          puntoInteresLat: Number(puntoLat),
          puntoInteresLng: Number(puntoLng),
          items: itemsSeleccionados,
        }),
      });

      if (res.ok) {
        router.push(`/propuestas/${slug}`);
      } else {
        alert("Error al guardar la propuesta.");
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md my-8 border">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Crear Nueva Propuesta Comercial</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Cliente / Empresa</label>
            <input
              type="text"
              required
              value={clienteNombre}
              onChange={(e) => handleNombreChange(e.target.value)}
              placeholder="Ej: Transportes Patagónicos S.A."
              className="w-full border rounded-lg p-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">URL Personalizada (Slug)</label>
            <div className="flex items-center text-sm text-gray-500 bg-gray-50 border rounded-lg px-3 py-2">
              <span>/propuestas/</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-transparent border-none p-0 focus:outline-none text-slate-900 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* 2. Punto de Interés */}
        <div className="border-b pb-6">
          <h2 className="text-md font-bold text-slate-800 mb-2">📍 Punto de Referencia / Destino</h2>
          <p className="text-xs text-gray-500 mb-3">Haz clic en el mapa para marcar la ubicación exacta de destino.</p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre del Destino</label>
                <input
                  type="text"
                  required
                  value={puntoNombre}
                  onChange={(e) => setPuntoNombre(e.target.value)}
                  placeholder="Ej: Neuquén Capital / Puerto CABA"
                  className="w-full border rounded-lg p-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Latitud</label>
                  <input
                    type="number"
                    step="any"
                    value={puntoLat}
                    onChange={(e) => setPuntoLat(Number(e.target.value))}
                    className="w-full border rounded p-1.5 text-xs bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Longitud</label>
                  <input
                    type="number"
                    step="any"
                    value={puntoLng}
                    onChange={(e) => setPuntoLng(Number(e.target.value))}
                    className="w-full border rounded p-1.5 text-xs bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 h-48 rounded-lg overflow-hidden border">
              <LocationPickerDestino
                lat={puntoLat}
                lng={puntoLng}
                onSelect={(lat, lng) => {
                  setPuntoLat(lat);
                  setPuntoLng(lng);
                }}
              />
            </div>
          </div>
        </div>

        {/* 3. Selección y Reordenamiento de Propiedades */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-md font-bold text-slate-800">
              🏬 Seleccionar y Ordenar Propiedades ({itemsSeleccionados.length})
            </h2>
            <input
              type="text"
              placeholder="🔍 Buscar por código, título o zona..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-xs w-64"
            />
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 rounded-lg p-3 bg-gray-50">
            {propiedadesFiltradas.map((prop) => {
              const indexEnSeleccionados = itemsSeleccionados.findIndex((i) => i.propiedadId === prop.id);
              const isChecked = indexEnSeleccionados !== -1;
              const item = isChecked ? itemsSeleccionados[indexEnSeleccionados] : null;
              const posicion = indexEnSeleccionados + 1;

              return (
                <div
                  key={prop.id}
                  className={`p-3 rounded-lg border transition-all ${
                    isChecked ? "border-blue-500 bg-white shadow-sm" : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePropiedad(prop.id)}
                        className="h-4 w-4 text-blue-600 rounded cursor-pointer"
                      />
                      <div>
                        <p className="font-semibold text-sm text-slate-800">{prop.titulo}</p>
                        <p className="text-xs text-gray-500">
                          Cód: <strong>{prop.codigo}</strong> | Zona: {prop.zona?.nombre || "S/D"} | {prop.moneda} {prop.precio}
                        </p>
                      </div>
                    </div>

                    {isChecked && (
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                            posicion === 1
                              ? "bg-amber-100 text-amber-900 border-amber-300"
                              : posicion === 2
                              ? "bg-blue-100 text-blue-900 border-blue-300"
                              : "bg-slate-100 text-slate-700 border-slate-300"
                          }`}
                        >
                          {posicion === 1 ? "⭐ Opción 1 (Prioritaria)" : `Opción ${posicion}`}
                        </span>

                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            disabled={indexEnSeleccionados === 0}
                            onClick={() => moverArriba(indexEnSeleccionados)}
                            className="p-1 leading-none text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded"
                            title="Subir prioridad"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={indexEnSeleccionados === itemsSeleccionados.length - 1}
                            onClick={() => moverAbajo(indexEnSeleccionados)}
                            className="p-1 leading-none text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded"
                            title="Bajar prioridad"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {isChecked && item && (
                    <div className="mt-3 pl-7 grid grid-cols-1 md:grid-cols-2 gap-3 border-t pt-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
                          Nota Logística / Ventaja Competitiva:
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Ahorro de 2.5 hs al evitar el tráfico de AMBA"
                          value={item.notaLogistica}
                          onChange={(e) => {
                            const val = e.target.value;
                            setItemsSeleccionados(
                              itemsSeleccionados.map((i) =>
                                i.propiedadId === prop.id ? { ...i, notaLogistica: val } : i
                              )
                            );
                          }}
                          className="w-full border rounded p-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
                          Tiempo Estimado / Salida Vial:
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: ~11 hs / Salida directa a RN 3"
                          value={item.tiempoEstimadoString}
                          onChange={(e) => {
                            const val = e.target.value;
                            setItemsSeleccionados(
                              itemsSeleccionados.map((i) =>
                                i.propiedadId === prop.id ? { ...i, tiempoEstimadoString: val } : i
                              )
                            );
                          }}
                          className="w-full border rounded p-1.5 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all disabled:bg-gray-400"
        >
          {loading ? "Guardando Propuesta..." : "🚀 Guardar y Ver Propuesta Interactiva"}
        </button>
      </form>
    </div>
  );
}