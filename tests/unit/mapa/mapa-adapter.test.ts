import { describe, it, expect } from 'vitest';
import { toPropiedadesMapa, esCoordenadaValida } from '@/features/mapa/utils/mapa-adapter';

describe('mapa-adapter', () => {
  it('esCoordenadaValida debe identificar coordenadas válidas e inválidas', () => {
    expect(esCoordenadaValida(-34.88)).toBe(true);
    expect(esCoordenadaValida('-34.88')).toBe(true);
    expect(esCoordenadaValida(0)).toBe(false);
    expect(esCoordenadaValida(null)).toBe(false);
    expect(esCoordenadaValida(undefined)).toBe(false);
    expect(esCoordenadaValida('invalido')).toBe(false);
  });

  it('toPropiedadesMapa debe filtrar inmuebles sin coordenadas y formatear para público', () => {
    const raw = [
      {
        id: 1,
        codigo: 'IND-1',
        slug: 'galpon-1',
        titulo: 'Galpón 1',
        precio: '150000',
        moneda: 'USD',
        latitud: -34.88,
        longitud: -58.38,
        propietarioId: 99, // Sensible
        zona: { nombre: 'Berazategui' },
      },
      {
        id: 2,
        codigo: 'IND-2',
        titulo: 'Sin Latitud',
        latitud: null,
        longitud: -58.38,
      },
    ];

    const adaptadas = toPropiedadesMapa(raw, false);

    expect(adaptadas).toHaveLength(1);
    expect(adaptadas[0].id).toBe(1);
    expect(adaptadas[0].precio).toBe(150000);
    expect(adaptadas[0].zonaNombre).toBe('Berazategui');
    expect(adaptadas[0].propietarioId).toBeUndefined(); // Se omite en público
  });

  it('toPropiedadesMapa debe incluir campos de CRM cuando esAdmin es true', () => {
    const raw = [
      {
        id: 3,
        codigo: 'IND-3',
        slug: 'galpon-admin',
        titulo: 'Galpón Admin',
        precio: 200000,
        latitud: -34.88,
        longitud: -58.38,
        origen: 'fromColleague',
        propietarioId: 10,
        colegaId: 20,
        colega: { inmobiliaria: 'Inmo Colega', telefono: '11223344' },
        direccionPersonalizada: 'Calle Falsa 123',
      },
    ];

    const adaptadas = toPropiedadesMapa(raw, true);

    expect(adaptadas).toHaveLength(1);
    expect(adaptadas[0].propietarioId).toBe(10);
    expect(adaptadas[0].colegaId).toBe(20);
    expect(adaptadas[0].colegaInmobiliaria).toBe('Inmo Colega');
    expect(adaptadas[0].zonaNombre).toBe('Calle Falsa 123'); // Prioriza dirección personalizada
  });
});