/**
 * use-catalogo-propuestas: Se encarga de descargar las propiedades/parques desde la API y gestionar la búsqueda/filtrado del catálogo.
 */

import { useState, useEffect } from 'react';
import { PropiedadSimple } from '../types/propuesta.types';

export function useCatalogoPropuestas(esInversion: boolean) {
  const [propiedadesBD, setPropiedadesBD] = useState<PropiedadSimple[]>([]);
  const [parquesBD, setParquesBD] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/properties?tab=activas&limit=1000').then((r) => r.json()),
      fetch('/api/parques-industriales').then((r) => r.json()),
    ])
      .then(([propsData, parquesData]) => {
        if (Array.isArray(propsData?.propiedades)) setPropiedadesBD(propsData.propiedades);
        if (Array.isArray(parquesData)) setParquesBD(parquesData);
      })
      .catch((err) => console.error('Error al cargar catálogo:', err));
  }, []);

  const catalogoFiltrado = propiedadesBD.filter((p) => {
    const coincide =
      p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.zona?.nombre.toLowerCase().includes(busqueda.toLowerCase());

    if (!coincide) return false;

    if (esInversion) {
      return (
        p.titulo.toLowerCase().includes('lote') ||
        p.titulo.toLowerCase().includes('terreno') ||
        p.titulo.toLowerCase().includes('fraccion') ||
        p.titulo.toLowerCase().includes('parcela') ||
        (p.superficieTotal && Number(p.superficieTotal) > 0)
      );
    }

    return true;
  });

  return { propiedadesBD, parquesBD, busqueda, setBusqueda, catalogoFiltrado };
}