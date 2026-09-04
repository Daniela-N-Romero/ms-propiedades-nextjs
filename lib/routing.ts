// lib/routing.ts
export async function obtenerRutaLogistica(
  origen: [number, number],
  destino: [number, number]
) {
  // OSRM acepta lng,lat ; lng,lat
  const url = `https://router.project-osrm.org/route/v1/driving/${origen[1]},${origen[0]};${destino[1]},${destino[0]}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes || data.routes.length === 0) return null;

  const route = data.routes[0];
  const distanciaKm = (route.distance / 1000).toFixed(0); // metros a km
  const duracionHoras = (route.duration / 3600).toFixed(1); // segundos a horas

  return {
    distanciaKm: `${distanciaKm} km`,
    duracionEstimada: `${duracionHoras} hs`,
    geometry: route.geometry, // GeoJSON de la carretera real para dibujar en Leaflet
  };
}