import { describe, it, expect } from 'vitest';
import { buildListUrlFromMapParams } from '@/features/mapa/utils/mapa-navigation';

describe('buildListUrlFromMapParams', () => {
  it('debe limpiar lat, lng y zoom preservando mercado y filtros activos para la vista de lista', () => {
    const searchParams = new URLSearchParams(
      'mercado=industrial&categoria=venta&lat=-34.8833&lng=-58.3833&zoom=15&precioMin=100000'
    );

    const listaUrl = buildListUrlFromMapParams(searchParams);

    expect(listaUrl).toContain('/propiedades?');
    expect(listaUrl).toContain('mercado=industrial');
    expect(listaUrl).toContain('categoria=venta');
    expect(listaUrl).toContain('precioMin=100000');
    expect(listaUrl).not.toContain('lat=');
    expect(listaUrl).not.toContain('lng=');
    expect(listaUrl).not.toContain('zoom=');
  });

  it('debe devolver /propiedades limpio si los unicos parametros eran de coordenadas', () => {
    const searchParams = new URLSearchParams('lat=-34.8833&lng=-58.3833&zoom=15');
    const listaUrl = buildListUrlFromMapParams(searchParams);
    expect(listaUrl).toBe('/propiedades');
  });
});