import { describe, it, expect } from 'vitest';
import { InversionStrategy } from '@/features/propuestas/strategies/inversion-strategy';

describe('InversionStrategy - Cálculos Financieros', () => {
  const strategy = new InversionStrategy();

  it('debe calcular correctamente el ROI y la inversión total', () => {
    const mockItems: any[] = [
      {
        id: 'item-1',
        propiedadId: 1,
        supNaveProyectada: 1000,
        costoTierraCustom: 100000,
        costoObraM2: 400,
        alquilerM2Estimado: 5,
        fosAplicado: 0.6,
        esFinanciado: false,
        propiedad: { id: 1, precio: 100000, superficieTotal: 2000 },
      },
    ];

    const resultado = strategy.calcularMetricas(mockItems, { costoObraMercadoM2: 400 });

    // Costo Obra = 1000 * 400 = 400,000 | Inversión Total = 100,000 + 400,000 = 500,000
    // Ingreso Anual = 1000 * 5 * 12 = 60,000 | ROI = (60,000 / 500,000) * 100 = 12%
    expect(resultado.comparativa[0].inversionTotal).toBe(500000);
    expect(resultado.comparativa[0].ingresoAnualTotal).toBe(60000);
    expect(resultado.comparativa[0].roiAnual).toBe(12);
  });

  it('debe procesar los campos de Preventa correctamente', () => {
    const fechaFutura = new Date();
    fechaFutura.setDate(fechaFutura.getDate() + 375);
    const mockItems: any[] = [
      {
        id: 'item-2',
        propiedadId: 2,
        esPreventa: true,
        fechaEstimadaEntrega: fechaFutura.toISOString(),
        propiedad: { id: 2, precio: 50000 },
      },
    ];

    const resultado = strategy.calcularMetricas(mockItems, null);

    expect(resultado.comparativa[0].esPreventa).toBe(true);
    expect(resultado.comparativa[0].mesesEntrega).toBe(13);
  });

  it('debe calcular y redondear hacia arriba los meses de entrega de preventa', () => {


    // Simulamos una fecha a ~375 días de distancia (~12.3 meses -> debe redondear a 13)
    const fechaFutura = new Date();
    fechaFutura.setDate(fechaFutura.getDate() + 375);

    const mockItems: any[] = [
      {
        id: 'item-preventa',
        propiedadId: 100,
        esPreventa: true,
        fechaEstimadaEntrega: fechaFutura.toISOString(),
        propiedad: { id: 100, precio: 80000, superficieTotal: 1000 },
      },
    ];

    const resultado = strategy.calcularMetricas(mockItems, null);

    expect(resultado.comparativa[0].esPreventa).toBe(true);
    expect(resultado.comparativa[0].mesesEntrega).toBe(13);
  });
});