import React from 'react';
import PropuestaLogisticaView from '../views/propuesta-logistica-view';
import { PropuestaStrategy } from './propuesta-strategy.interface';

export class LogisticaStrategy implements PropuestaStrategy {
  type = 'LOGISTICA_RUTAS' as const;

  calcularMetricas(items: any[]) {
    return items.map((item) => {
      const p = item.propiedad;

      let precioM2Calculado = 'Consulte';
      if (p.precio && p.superficieTotal && Number(p.superficieTotal) > 0) {
        const valorM2 = (Number(p.precio) / Number(p.superficieTotal)).toLocaleString('es-AR', {
          maximumFractionDigits: 2,
        });
        precioM2Calculado = `${p.moneda} ${valorM2} / m²`;
      }

      return {
        id: String(p.id),
        slug: p.slug,
        title: p.titulo,
        localidad: p.zona?.nombre || 'Ubicación Industrial',
        lat: Number(p.latitud || 0),
        lng: Number(p.longitud || 0),
        precio: `${p.moneda} ${Number(p.precio).toLocaleString('es-AR')}`,
        precioM2: precioM2Calculado,
        supCubierta: p.superficieCubierta ? `${p.superficieCubierta} m²` : 'Sin especificar',
        supTerreno: p.superficieTotal ? `${p.superficieTotal} m²` : 'Sin especificar',
        tiempoRuta: item.tiempoEstimado || 'Ruta directa',
        ahorroTiempo: item.notaLogistica || '',
        aptitud: p.descripcion ? `${p.descripcion.substring(0, 120)}...` : 'Apto para logística',
        prioritaria: item.esPrioritaria,
        orden: item.orden,
        imagen: p.imagenes?.[0]?.url || '/images/placeholder.png',
      };
    });
  }

  renderView({ propuesta, metricas }: { propuesta: any; metricas: any }) {
    const destinoLat = propuesta.puntoInteresLat ? Number(propuesta.puntoInteresLat) : -34.6037;
    const destinoLng = propuesta.puntoInteresLng ? Number(propuesta.puntoInteresLng) : -58.3816;

    return (
      <PropuestaLogisticaView
        propiedades={metricas}
        destinoCoords={[destinoLat, destinoLng]}
        puntoInteresNombre={propuesta.puntoInteresNombre || 'Destino'}
      />
    );
  }
}