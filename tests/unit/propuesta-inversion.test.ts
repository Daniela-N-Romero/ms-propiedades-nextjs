import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PropuestasService } from '@/backend/services/propuesta.service';
import { prisma } from '@/backend/db';
import { sanearItemsPropuesta, sanearPropuestaComercial } from '@/lib/sanitizers';
import { InversionStrategy } from '@/features/propuestas/strategies/inversion-strategy';

// ============================================================================
// 1. MOCKS / SIMULACIONES
// ============================================================================
vi.mock('@/backend/db', () => ({
  prisma: {
    propuestaComercial: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    propuestaItem: {
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

describe('PropuestasService e InversionStrategy - Unidad y Lógica de Inversión', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------------------------------------------------------------------
  // 1. PRUEBAS DE SANITIZACIÓN REAL
  // --------------------------------------------------------------------------
  describe('sanearItemsPropuesta() - Sanitización Real', () => {
    it('debe asignar valores respetando 0 como fallback cuando es enviado', () => {
      const rawItems = [
        {
          id: 'item-1',
          propuestaId: 'prop-1',
          propiedadId: 21,
          esFinanciado: false,
          porcentajeAnticipo: 0,
          cantidadCuotas: 0,
          mesesObra: 0,
          propiedad: {
            id: 21,
            codigo: 'P-21',
            titulo: 'Lote Spegazzini',
            precio: 250000,
          },
        },
      ];

      const resultado = sanearItemsPropuesta(rawItems);

      expect(resultado[0]).toMatchObject({
        esFinanciado: false,
        porcentajeAnticipo: 0,
        cantidadCuotas: 0,
        mesesObra: 0,
      });
    });
  });

  // --------------------------------------------------------------------------
  // 2. PRUEBAS DE LA ESTRATEGIA DE INVERSIÓN (CÁLCULO DE MÉTRICAS & ROI)
  // --------------------------------------------------------------------------
  describe('InversionStrategy.calcularMetricas()', () => {
    const strategy = new InversionStrategy();

    it('debe calcular el flujo de fondos correcto para un lote financiado ("El lote se paga solo")', () => {
      // Mock de un ítem con lote de USD 250,000 (30% anticipo + 24 cuotas) y nave de 1,380 m²
      const itemMock: any = {
        id: 'item-financiado',
        propiedadId: 21,
        nombre: 'Lote Parque Industrial Spegazzini',
        costoTierraCustom: 250000,
        supNaveProyectada: 1380,
        costoObraM2: 350,
        alquilerM2Estimado: 5.5,
        esFinanciado: true,
        porcentajeAnticipo: 30,
        cantidadCuotas: 24,
        mesesObra: 8,
        propiedad: {
          superficieTotal: 2300,
          precio: 250000,
          moneda: 'USD',
        },
      };

      const payloadMock = {
        costoObraMercadoM2: 400,
        costoObraPreferencialM2: 350,
        tieneTarifaPreferencial: true,
      };

      const resultado = strategy.calcularMetricas([itemMock], payloadMock);
      const opcion = resultado.comparativa[0];

      // Verificaciones numéricas:
      // Tierra = 250,000 | Obra = 1,380 * 350 = 483,000 | Inversión Total = 733,000
      expect(opcion.costoTierra).toBe(250000);
      expect(opcion.costoObraTotal).toBe(483000);
      expect(opcion.inversionTotal).toBe(733000);

      // Desembolso Inicial = Anticipo Tierra (30% de 250,000 = 75,000) + Costo Obra (483,000) = 558,000
      expect(opcion.desembolsoInicialRequeridoUSD).toBe(558000);

      // Cuota Lote = Saldo (175,000) / 24 cuotas = ~7,292
      // Renta Mensual = 1,380 m² * 5.5 USD/m² = 7,590 USD/mes
      expect(opcion.ingresoMensualTotal).toBe(7590);
      expect(opcion.cuotaMensualLoteUSD).toBe(7292);

      // Superávit Neto Mensual = 7,590 - 7,292 = 298 USD/mes
      expect(opcion.resultadoNetoMensualUSD).toBe(298);
    });

    it('debe manejar correctamente un esquema al contado sin divisiones por cero', () => {
      const itemContadoMock: any = {
        id: 'item-contado',
        propiedadId: 71,
        nombre: 'Lote Al Contado',
        costoTierraCustom: 200000,
        ofertaContadoUSD: 180000,
        supNaveProyectada: 1000,
        costoObraM2: 400,
        alquilerM2Estimado: 5.0,
        esFinanciado: false,
        porcentajeAnticipo: 0,
        cantidadCuotas: 0,
        mesesObra: 6,
        propiedad: {
          superficieTotal: 1500,
          precio: 200000,
          moneda: 'USD',
        },
      };

      const resultado = strategy.calcularMetricas([itemContadoMock], null);
      const opcion = resultado.comparativa[0];

      expect(opcion.esFinanciado).toBe(false);
      expect(opcion.cuotaMensualLoteUSD).toBe(0);
      expect(opcion.desembolsoInicialRequeridoUSD).toBe(600000); // 200,000 Tierra + 400,000 Obra
      expect(opcion.ofertaContadoUSD).toBe(180000);
    });
  });

  // --------------------------------------------------------------------------
  // 3. PRUEBAS DE PERSISTENCIA EN PROPUESTAS SERVICE
  // --------------------------------------------------------------------------
  describe('PropuestasService.crear()', () => {
    it('debe mapear y guardar los datos de desembolso inicial y cuotas', async () => {
      const mockPayload = {
        tipo: 'INVERSION',
        clienteNombre: 'Inversor Test',
        slug: 'inversion-test',
        items: [
          {
            propiedadId: 21,
            esFinanciado: true,
            porcentajeAnticipo: 30,
            cantidadCuotas: 24,
            mesesObra: 8,
            costoTierraCustom: 250000,
          },
        ],
      };

      vi.mocked(prisma.propuestaComercial.create).mockResolvedValue({ id: 'prop-1', ...mockPayload } as any);

      await PropuestasService.crear(mockPayload);

      const createCallArgs = vi.mocked(prisma.propuestaComercial.create).mock.calls[0][0];
      const itemCreado = createCallArgs.data.items.create[0];

      expect(itemCreado).toMatchObject({
        propiedadId: 21,
        esFinanciado: true,
        porcentajeAnticipo: 30,
        cantidadCuotas: 24,
        mesesObra: 8,
      });
    });
  });
});