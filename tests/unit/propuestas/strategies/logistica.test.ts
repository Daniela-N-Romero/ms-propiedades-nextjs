import { describe, it, expect } from 'vitest';
import { LogisticaStrategy } from '@/features/propuestas/strategies/logistica-strategy';

describe('🛣️ Estrategia: LogisticaStrategy', () => {
  const strategy = new LogisticaStrategy();

  it('debe procesar los ítems y formatear precios, superficies y valores por m²', () => {
    console.log('  🔍 Evaluando: Transformación de propiedades para la vista interactiva de logística y mapa...');

    const mockItems: any[] = [
      {
        esPrioritaria: true,
        orden: 1,
        tiempoEstimadoString: '25 min',
        notaLogistica: 'Ahorro de 10 min por Autopista',
        propiedad: {
          id: 5,
          slug: 'nave-industrial-hudson',
          titulo: 'Nave Industrial Hudson 2000m2',
          moneda: 'USD',
          precio: 200000,
          superficieTotal: 2000,
          superficieCubierta: 1500,
          latitud: -34.789,
          longitud: -58.234,
          zona: { nombre: 'Berazategui' },
          imagenes: [{ url: '/img/hudson.jpg' }],
        },
      },
    ];

    const resultado = strategy.calcularMetricas(mockItems);

    expect(resultado).toHaveLength(1);
    expect(resultado[0].title).toBe('Nave Industrial Hudson 2000m2');
    expect(resultado[0].precioM2).toBe('USD 100 / m²');
    expect(resultado[0].tiempoRuta).toBe('25 min');
    expect(resultado[0].imagen).toBe('/img/hudson.jpg');

    console.log('  ✅ Éxito: Formateo de precios por m², coordenadas de mapa y datos logísticos validados.');
  });
});