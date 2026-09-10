"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Tooltip } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function isValidLatLng(coords: [number, number]): boolean {
  return (
    Array.isArray(coords) &&
    coords.length === 2 &&
    typeof coords[0] === "number" &&
    typeof coords[1] === "number" &&
    !isNaN(coords[0]) &&
    !isNaN(coords[1]) &&
    coords[0] !== 0 &&
    coords[1] !== 0
  );
}

function MapController({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    // Módulo de seguridad: Solo volamos si el par es LatLng válido
    if (isValidLatLng(coords)) {
      map.flyTo(coords, 10, { duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}

interface MapaPropuestaProps {
  selectedProp: {
    title: string;
    precioM2?: string;
    lat: number;
    lng: number;
    prioritaria?: boolean;
  };
  destinoCoords: [number, number];
  puntoInteresNombre?: string;
  onVerEnLista?: () => void;
}

export default function MapaPropuesta({
  selectedProp,
  destinoCoords,
  puntoInteresNombre = "Punto de Interés",
  onVerEnLista,
}: MapaPropuestaProps) {
  const latProp = Number(selectedProp?.lat) || -34.6037;
  const lngProp = Number(selectedProp?.lng) || -58.3816;
  const propCoords: [number, number] = [latProp, lngProp];

  const latDest = Number(destinoCoords?.[0]) || -34.6037;
  const lngDest = Number(destinoCoords?.[1]) || -58.3816;
  const safeDestinoCoords: [number, number] = [latDest, lngDest];

  const [routeCoords, setRouteCoords] = useState<LatLngExpression[]>([]);
  const [distanciaTexto, setDistanciaTexto] = useState<string>("");
  const [tiempoTexto, setTiempoTexto] = useState<string>("");

  // Trazar Ruta Real por Carretera usando la API de OSRM
  useEffect(() => {
    if (!isValidLatLng(propCoords) || !isValidLatLng(safeDestinoCoords)) return;

    const fetchRoute = async () => {
      try {
        // OSRM usa longitud,latitud
        const url = `https://router.project-osrm.org/route/v1/driving/${selectedProp.lng},${selectedProp.lat};${destinoCoords[1]},${destinoCoords[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.routes && data.routes[0]) {
          const route = data.routes[0];

          // 1. Coordenadas de la trayectoria
          const points: LatLngExpression[] = route.geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]]
          );
          setRouteCoords(points);

          // 2. Cálculo de Distancia en km
          const km = (route.distance / 1000).toFixed(1);
          setDistanciaTexto(`${km} km`);

          // 3. Cálculo de Tiempo estimado (OSRM lo devuelve en segundos)
          const totalMinutos = Math.round(route.duration / 60);
          if (totalMinutos >= 60) {
            const horas = Math.floor(totalMinutos / 60);
            const mins = totalMinutos % 60;
            setTiempoTexto(`${horas}h ${mins}min`);
          } else {
            setTiempoTexto(`${totalMinutos} min`);
          }
        } else {
          setRouteCoords([propCoords, destinoCoords]);
        }
      } catch (err) {
        console.error("Error al obtener ruta real:", err);
        setRouteCoords([propCoords, destinoCoords]);
      }
    };

    fetchRoute();
  }, [selectedProp.lat, selectedProp.lng, destinoCoords]);

  // Obtener el punto medio de la ruta para posicionar la etiqueta flotante
  const puntoMedioRuta =
    routeCoords.length > 0 ? routeCoords[Math.floor(routeCoords.length / 2)] : null;

  return (
    <div className="relative w-full h-full">
      {/* Cajas flotantes con Info de Viaje sobre el mapa */}
      {tiempoTexto && (
        <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 text-white text-xs px-3.5 py-2 rounded-xl shadow-xl backdrop-blur-md border border-slate-700 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span>⏱️</span>
            <div>
              <span className="text-gray-400 block text-[10px]">Tiempo estimado</span>
              <strong className="text-emerald-400 text-sm">{tiempoTexto}</strong>
            </div>
          </div>
          <div className="h-6 w-[1px] bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <span>🛣️</span>
            <div>
              <span className="text-gray-400 block text-[10px]">Distancia</span>
              <strong className="text-white text-sm">{distanciaTexto}</strong>
            </div>
          </div>
        </div>
      )}

      <MapContainer center={propCoords} zoom={10} className="w-full h-full" scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController coords={propCoords} />

        {/* Marcador de la Propiedad con Etiqueta Superior Permanente */}
        {isValidLatLng(propCoords) && (
          <Marker position={propCoords} icon={defaultIcon}>
            <Tooltip permanent direction="top" offset={[0, -40]} interactive={true} className="shadow-lg border-0 bg-transparent">
              <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-2xl border border-slate-700 max-w-[220px] text-center flex flex-col gap-1.5">
                <p className="font-bold text-xs leading-snug line-clamp-2 text-blue-200">
                  {selectedProp.title}
                </p>
                {onVerEnLista && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onVerEnLista();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg transition-all shadow pointer-events-auto cursor-pointer md:hidden"
                  >
                    📋 Ver detalles en lista
                  </button>
                )}
              </div>
            </Tooltip>
          </Marker>
        )}

        {isValidLatLng(safeDestinoCoords) && (
          <Marker position={safeDestinoCoords} icon={defaultIcon}>
            <Popup>
              <strong>Destino: {puntoInteresNombre}</strong>
            </Popup>
          </Marker>
        )}

        {routeCoords.length > 0 && (
          <>
            <Polyline
              positions={routeCoords}
              color={selectedProp.prioritaria ? "#059669" : "#2563eb"}
              weight={5}
              opacity={0.8}
            />

            {puntoMedioRuta && tiempoTexto && (
              <Tooltip position={puntoMedioRuta} permanent direction="center" className="custom-route-tooltip">
                <div className="bg-slate-900 text-white font-bold text-[11px] px-2 py-1 rounded shadow-lg border border-slate-700">
                  🚗 ~{tiempoTexto} ({distanciaTexto})
                </div>
              </Tooltip>
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
}