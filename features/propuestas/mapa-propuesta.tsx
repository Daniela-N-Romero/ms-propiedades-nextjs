"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapController({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(coords, 10, { duration: 1.5 });
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
}

export default function MapaPropuesta({
  selectedProp,
  destinoCoords,
  puntoInteresNombre = "Punto de Interés",
}: MapaPropuestaProps) {
  const propCoords: [number, number] = [selectedProp.lat, selectedProp.lng];
  const [routeCoords, setRouteCoords] = useState<LatLngExpression[]>([]);

  // Trazar Ruta Real por Carretera usando la API de OSRM
  useEffect(() => {
    if (!selectedProp.lat || !selectedProp.lng || !destinoCoords[0] || !destinoCoords[1]) return;

    const fetchRoute = async () => {
      try {
        // OSRM usa longitud,latitud
        const url = `https://router.project-osrm.org/route/v1/driving/${selectedProp.lng},${selectedProp.lat};${destinoCoords[1]},${destinoCoords[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.routes && data.routes[0]) {
          // OSRM devuelve [lng, lat], convertimos a [lat, lng] para Leaflet
          const points: LatLngExpression[] = data.routes[0].geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]]
          );
          setRouteCoords(points);
        } else {
          // Fallback a línea recta si falla el servicio
          setRouteCoords([propCoords, destinoCoords]);
        }
      } catch (err) {
        console.error("Error al obtener ruta real:", err);
        setRouteCoords([propCoords, destinoCoords]);
      }
    };

    fetchRoute();
  }, [selectedProp.lat, selectedProp.lng, destinoCoords]);

  return (
    <MapContainer center={propCoords} zoom={10} className="w-full h-full" scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController coords={propCoords} />

      <Marker position={propCoords} icon={defaultIcon}>
        <Popup>
          <strong>{selectedProp.title}</strong>
          {selectedProp.precioM2 && (
            <>
              <br />
              {selectedProp.precioM2}
            </>
          )}
        </Popup>
      </Marker>

      <Marker position={destinoCoords} icon={defaultIcon}>
        <Popup>
          <strong>Destino: {puntoInteresNombre}</strong>
        </Popup>
      </Marker>

      {/* Trazo de la Ruta Real trazada por carretera */}
      {routeCoords.length > 0 && (
        <Polyline
          positions={routeCoords}
          color={selectedProp.prioritaria ? "#059669" : "#2563eb"}
          weight={5}
          opacity={0.8}
        />
      )}
    </MapContainer>
  );
}