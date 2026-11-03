# Arquitectura del Geocatálogo y Mapa Interactivo

## 1. Visión General
El módulo de mapas proporciona una experiencia de exploración geoespacial continua inspirada en el flujo de interacción móvil/desktop de Mercado Libre y Airbnb. Elimina los popups pesados de Leaflet en favor de marcadores livianos basados en HTML/Tailwind y un carrusel flotante inferior reactivo.

## 2. Flujo de Interacción y Selección
1. **Clustering de Proximidad (`geo-clustering.ts`):**  
   Agrupa inmuebles que comparten coordenadas exactas o que distan menos de 30 metros (fórmula de Haversine en `geo-distance.ts`).
2. **Marcadores HTML con DivIcon (`leaflet-custom-markers.ts`):**  
   Renderiza pastillas compactas tipo badge (`USD 420K` o `🏢 3 unid.`) centradas mediante clases de Tailwind (`-translate-x-1/2 -translate-y-1/2`), descartando estilos rígidos de Leaflet.
3. **Selección y Recentrado Suave:**  
   Al tocar un pin, el mapa ejecuta `panTo` suave sin reiniciar el zoom, resalta el marcador con alto contraste corporativo y abre el carrusel inferior (`mapa-bottom-carousel.tsx`).
4. **Carrusel Flotante:**  
   Muestra tarjetas compactas (`mapa-property-card-compact.tsx`) con scroll horizontal táctil y botones para desktop, centrado dinámico (`w-max min-w-full mx-auto`) y derivación directa a WhatsApp con analítica integrada (`useWhatsAppButtons`).

## 3. Mantenimiento y Extensión
- **Formatos de Precio:** Administrados centralmente en `features/mapa/utils/geo-distance.ts`.
- **Adaptador de Datos:** `features/mapa/utils/mapa-adapter.ts` sanitiza y mapea propiedades públicas y privadas antes de ingresar a la capa de UI.
