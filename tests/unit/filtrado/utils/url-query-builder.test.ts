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

  it('preserva el parámetro de mercado y descarta la paginación previa al aplicar nuevos filtros', () => {
    const query = buildFilterQueryString(
      { categoria: 'venta' },
      { currentSearchParams: new URLSearchParams('mercado=industrial&page=3') }
    );

    // Debe conservar el mercado intacto
    expect(query).toContain('mercado=industrial');
    expect(query).toContain('categoria=venta');
    // Debe omitir page=3 para que la nueva búsqueda inicie en la página 1
    expect(query).not.toContain('page=3');
  });

  it('parsea correctamente searchParams a FiltrosState', () => {
    const params = new URLSearchParams('subtipo=lote&localidad=10&precioMin=50000');
    const parsed = parseSearchParamsToFilters(params);

    expect(parsed.subtipo).toEqual(['lote']);
    expect(parsed.localidad).toEqual([10]);
    expect(parsed.precioMin).toBe(50000);
    expect(parsed.supMax).toBeUndefined();
  });
});