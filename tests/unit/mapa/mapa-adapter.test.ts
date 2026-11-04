// tests/unit/mapa/mapa-adapter.test.ts
import { describe, it, expect } from 'vitest';
import { toPropiedadesMapa, esCoordenadaValida } from '@/features/mapa/utils/mapa-adapter';
import type { PropiedadRawItem } from '@/features/mapa/types/mapa-types';

describe('mapa-adapter', () => {
  it('esCoordenadaValida debe identificar coordenadas válidas e inválidas', () => {
    expect(esCoordenadaValida(-34.88)).toBe(true);
    expect(esCoordenadaValida(0)).toBe(false);
    expect(esCoordenadaValida(null)).toBe(false);
    expect(esCoordenadaValida(undefined)).toBe(false);
    expect(esCoordenadaValida(NaN)).toBe(false);
  });

  it('toPropiedadesMapa debe filtrar inmuebles sin coordenadas y formatear para público', () => {
    const raw: PropiedadRawItem[] = [
      {
        id: 1,
        codigo: 'IND-1',
        slug: 'galpon-1',
        titulo: 'Galpón 1',
        precio: 150000,
        moneda: 'USD',
        latitud: -34.88,
        longitud: -58.38,
        propietarioId: 99,
        zona: { nombre: 'Berazategui' },
        agente: {
          nombre: 'Carlos Agente',
          telefono: '1199887766',
        },
      },
      {
        id: 2,
        codigo: 'IND-2',
        slug: 'sin-latitud',
        titulo: 'Sin Latitud',
        precio: 120000,
        moneda: 'USD',
        latitud: null,
        longitud: -58.38,
        agente: {
          nombre: 'Carlos Agente',
          telefono: '1199887766',
        },
      },
    ];

    const adaptadas = toPropiedadesMapa(raw, false);

    expect(adaptadas).toHaveLength(1);
    expect(adaptadas[0].id).toBe(1);
    expect(adaptadas[0].precio).toBe(150000);
    expect(adaptadas[0].zonaNombre).toBe('Berazategui');
    expect(adaptadas[0].propietarioId).toBeUndefined(); // Se oculta en vista pública
    expect(adaptadas[0].agente).toEqual({
      nombre: 'Carlos Agente',
      telefono: '1199887766',
    });
  });

  it('toPropiedadesMapa debe incluir campos de CRM cuando esAdmin es true', () => {
    const raw: PropiedadRawItem[] = [
      {
        id: 3,
        codigo: 'IND-3',
        slug: 'galpon-admin',
        titulo: 'Galpón Admin',
        precio: 200000,
        moneda: 'USD',
        latitud: -34.88,
        longitud: -58.38,
        origen: 'fromColleague',
        propietarioId: 10,
        colegaId: 20,
        colega: { inmobiliaria: 'Inmo Colega', telefono: '11223344' },
        direccionPersonalizada: 'Calle Falsa 123',
        agente: {
          nombre: 'Lucía Agente',
          telefono: '1144556677',
        },
      },
    ];

    const adaptadas = toPropiedadesMapa(raw, true);

    expect(adaptadas).toHaveLength(1);
    expect(adaptadas[0].propietarioId).toBe(10);
    expect(adaptadas[0].colegaId).toBe(20);
    expect(adaptadas[0].colegaInmobiliaria).toBe('Inmo Colega');
    expect(adaptadas[0].zonaNombre).toBe('Calle Falsa 123');
    expect(adaptadas[0].agente).toEqual({
      nombre: 'Lucía Agente',
      telefono: '1144556677',
    });
  });
});