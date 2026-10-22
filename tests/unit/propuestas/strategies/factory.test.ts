import { describe, it, expect } from 'vitest';
import { PropuestaFactory } from '@/features/propuestas/strategies/propuesta-factory';
import { InversionStrategy } from '@/features/propuestas/strategies/inversion-strategy';
import { LogisticaStrategy } from '@/features/propuestas/strategies/logistica-strategy';

describe('PropuestaFactory', () => {
  it('debe devolver InversionStrategy para INVERSION_DESARROLLO', () => {
    const strategy = PropuestaFactory.getStrategy('INVERSION_DESARROLLO');
    expect(strategy).toBeInstanceOf(InversionStrategy);
  });

  it('debe devolver LogisticaStrategy para LOGISTICA_RUTAS o tipos desconocidos', () => {
    const strategyLogistica = PropuestaFactory.getStrategy('LOGISTICA_RUTAS');
    const strategyFallback = PropuestaFactory.getStrategy('TIPO_INEXISTENTE');

    expect(strategyLogistica).toBeInstanceOf(LogisticaStrategy);
    expect(strategyFallback).toBeInstanceOf(LogisticaStrategy);
  });
});