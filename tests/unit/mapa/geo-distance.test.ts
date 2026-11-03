import { describe, it, expect } from 'vitest';
import { calcularDistanciaMetros, formatPrecioCompacto } from '@/features/mapa/utils/geo-distance';
import { agruparPropiedadesPorProximidad } from '@/features/mapa/utils/geo-clustering';
import type { PropiedadMapaItem } from '@/features/mapa/types/mapa-types';

describe('geo-distance & geo-clustering (Fase 1)', () => {
  it('formatPrecioCompacto debe formatear millones y miles limpiamente', () => {
    expect(formatPrecioCompacto(450000, 'USD')).toBe('USD 450K');
    expect(formatPrecioCompacto(1200000, 'USD')).toBe('USD 1.2M');
    expect(formatPrecioCompacto(2000000, 'USD')).toBe('USD 2M');
    expect(formatPrecioCompacto(85000000, 'ARS')).toBe('$ 85M');
  });

  it('calcularDistanciaMetros debe devolver 0 para la misma coordenada exacta', () => {
    const dist = calcularDistanciaMetros(-34.88, -58.38, -34.88, -58.38);
    expect(dist).toBe(0);
  });

  it('agruparPropiedadesPorProximidad debe agrupar inmuebles a menos de 30 metros en un cluster multiunidad', () => {
    const props: PropiedadMapaItem[] = [
      {
        id: 1,
        codigo: 'P-1',
        slug: 'lote-1',
        titulo: 'Lote 1 en Parque',
        precio: 100000,
        moneda: 'USD',
        latitud: -34.8833,
        longitud: -58.3833,
        zonaNombre: 'El Pato',
        superficieTotal: 1000,
        superficieCubierta: null,
      },
      {
        id: 2,
        codigo: 'P-2',
        slug: 'lote-2',
        titulo: 'Lote 2 en Parque (Misma ubicación)',
        precio: 120000,
        moneda: 'USD',
        latitud: -34.88331, // Menos de 15 metros de distancia
        longitud: -58.38331,
        zonaNombre: 'El Pato',
        superficieTotal: 1200,
        superficieCubierta: null,
      },
      {
        id: 3,
        codigo: 'P-3',
        slug: 'galpon-lejano',
        titulo: 'Galpón a 5km',
        precio: 500000,
        moneda: 'USD',
        latitud: -34.85,
        longitud: -58.35,
        zonaNombre: 'Quilmes',
        superficieTotal: 2000,
        superficieCubierta: 1500,
      },
    ];

    const clusters = agruparPropiedadesPorProximidad(props, 30);

    // Deben quedar 2 marcadores: 1 cluster de 2 lotes y 1 individual
    expect(clusters).toHaveLength(2);

    const clusterMulti = clusters.find((c) => c.esMultiUnidad);
    expect(clusterMulti).toBeDefined();
    expect(clusterMulti?.propiedades).toHaveLength(2);

    const individual = clusters.find((c) => !c.esMultiUnidad);
    expect(individual).toBeDefined();
    expect(individual?.propiedades[0].codigo).toBe('P-3');
  });
});