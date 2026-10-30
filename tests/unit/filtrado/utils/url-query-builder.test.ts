/**
 * @file url-query-builder.test.ts
 * @description Pruebas unitarias para el serializador y parser de URLs.
 * Valida la eliminación de duplicados, descarte de valores no numéricos y preservación de parámetros clave.
 */

import { describe, it, expect } from 'vitest';
import { buildFilterQueryString, parseSearchParamsToFilters } from '@/features/filtrado/utils/url-query-builder';

describe('url-query-builder', () => {
  it('serializa arrays sin duplicados y descarta valores NaN', () => {
    const query = buildFilterQueryString({
      localidad: [20, 20, 21], // 20 duplicado
      subtipo: ['nave-industrial', 'nave-industrial'], // duplicado
      precioMin: Number('invalido'), // NaN
      supMin: 2500,
    });

    // Debe contener las localidades sin repetir
    expect(query).toContain('localidad=20');
    expect(query).toContain('localidad=21');
    expect(query).not.toContain('localidad=20&localidad=20');

    // Debe contener el subtipo una sola vez
    expect(query).toContain('subtipo=nave-industrial');
    expect(query).not.toContain('subtipo=nave-industrial&subtipo=nave-industrial');

    // Debe contener superficie válida y omitir el precio inválido
    expect(query).toContain('supMin=2500');
    expect(query).not.toContain('precioMin');
  });

it('debe devolver string vacío si no hay filtros activos', () => {
    const qs = buildFilterQueryString({});
    expect(qs).toBe('');
  });

  it('debe incluir el prefijo "?" y serializar el parámetro mercado', () => {
    const qs = buildFilterQueryString({ mercado: 'industrial' });
    expect(qs).toBe('?mercado=industrial');
  });

  it('debe serializar múltiples filtros combinando mercado, categoría y rangos', () => {
    const qs = buildFilterQueryString({
      mercado: 'residencial',
      categoria: 'venta',
      precioMin: 50000,
    });

    expect(qs.startsWith('?')).toBe(true);
    expect(qs).toContain('mercado=residencial');
    expect(qs).toContain('categoria=venta');
    expect(qs).toContain('precioMin=50000');
  });

  it('debe parsear searchParams extrayendo el campo mercado correctamente', () => {
    const searchParams = new URLSearchParams('mercado=comercial&categoria=alquiler');
    const parsed = parseSearchParamsToFilters(searchParams);

    expect(parsed.mercado).toBe('comercial');
    expect(parsed.categoria).toBe('alquiler');
  });
});