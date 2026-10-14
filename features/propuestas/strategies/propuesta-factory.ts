import { LogisticaStrategy } from './logistica-strategy';
import { InversionStrategy } from './inversion-strategy';
import { PropuestaStrategy } from './propuesta-strategy.interface';

export class PropuestaFactory {
  private static strategies: Record<string, PropuestaStrategy> = {
    LOGISTICA_RUTAS: new LogisticaStrategy(),
    INVERSION_DESARROLLO: new InversionStrategy(),
  };

  static getStrategy(tipo?: string): PropuestaStrategy {
    if (!tipo || !this.strategies[tipo]) {
      return this.strategies['LOGISTICA_RUTAS'];
    }
    return this.strategies[tipo];
  }
}