import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PropuestasService } from '@/backend/services/propuesta.service';
import { prisma } from '@/backend/db';
import { sanearPropuestaComercial } from '@/lib/sanitizers';

// ============================================================================
// 1. MOCKS / SIMULACIONES
// ============================================================================
// Aislar el servicio mockeando Prisma y las funciones utilitarias externas.
// Esto garantiza que el test pruebe la lógica interna del servicio sin conectarse
// a la base de datos ni depender de la implementación real de otros módulos.

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
    // Simula la transacción de Prisma resolviendo la función callback directamente con la misma instancia mockeada
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

// Mock del sanitizador: Retorna los datos limpios sin alterar la estructura en el test
vi.mock('@/lib/sanitizers', () => ({
  sanearPropuestaComercial: vi.fn((data) => data),
}));

// ============================================================================
// 2. SUITE PRINCIPAL DE TESTS
// ============================================================================
describe('PropuestasService - Unidad y Lógica de Inversión', () => {
  // Limpia el historial de llamadas de todos los mocks antes de cada test para evitar interferencias entre pruebas
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------------------------------------------------------------------
  // TEST: Método crear()
  // --------------------------------------------------------------------------
  describe('crear()', () => {
    it('debe mapear correctamente los campos de financiación y venta al contado al crear', async () => {
      // DATO DE ENTRADA: Simulamos un payload recibido desde el formulario del cliente.
      // Contiene una propiedad financiada y una propiedad al contado.
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
            cuotasTexto: '30% anticipo y 24 cuotas',
            mesesObra: 12,
            costoTierraCustom: 450000,
          },
          {
            propiedadId: 71,
            esFinanciado: false, // Propiedad comprada al contado
            porcentajeAnticipo: 0,
            cantidadCuotas: 0,
            ofertaContadoUSD: 650000,
            costoTierraCustom: 700000,
          },
        ],
      };

      // SIMULACIÓN: Hacemos que prisma.create resuelva con éxito devolviendo los datos cargados
      vi.mocked(prisma.propuestaComercial.create).mockResolvedValue({ id: 'prop-1', ...mockPayload } as any);

      // EJECUCIÓN: Llamamos al método que estamos testeando
      await PropuestasService.crear(mockPayload);

      // VERIFICACIÓN 1: Verificar que se llamó a Prisma para crear el registro en BD
      expect(prisma.propuestaComercial.create).toHaveBeenCalledTimes(1);
      
      // Capturamos los argumentos exactos con los que fue invocado prisma.create
      const createCallArgs = vi.mocked(prisma.propuestaComercial.create).mock.calls[0][0];
      const itemsCreados = createCallArgs.data.items.create;

      // VERIFICACIÓN 2: Ítem Financiado
      // Validamos que se preserven los porcentajes, cuotas y texto explicativo
      expect(itemsCreados[0]).toMatchObject({
        propiedadId: 21,
        esFinanciado: true,
        porcentajeAnticipo: 30,
        cantidadCuotas: 24,
        cuotasTexto: '30% anticipo y 24 cuotas',
        mesesObra: 12,
      });

      // VERIFICACIÓN 3: Ítem al Contado
      // Validamos que cuando no es financiado, los valores queden en 0/undefined y no se sobreescriban
      expect(itemsCreados[1]).toMatchObject({
        propiedadId: 71,
        esFinanciado: false,
        porcentajeAnticipo: 0,
        cantidadCuotas: 0,
      });
    });
    it('debe manejar correctamente valores nulos en costoTierraCustom y anticipoCash', async () => {
  const payloadConNulos = {
    tipo: 'INVERSION',
    clienteNombre: 'Cliente Test',
    items: [
      {
        propiedadId: 10,
        costoTierraCustom: null,
        anticipoCash: null,
        esFinanciado: true,
      },
    ],
  };

  vi.mocked(prisma.propuestaComercial.create).mockResolvedValue({ id: 'p-2', ...payloadConNulos } as any);

  await PropuestasService.crear(payloadConNulos);

  const createCallArgs = vi.mocked(prisma.propuestaComercial.create).mock.calls[0][0];
  const item = createCallArgs.data.items.create[0];

  expect(item.costoTierraCustom).toBeNull();
  expect(item.anticipoCash).toBeNull();
});
  it('debe asignar el orden correcto secuencial a los items enviados', async () => {
    const payloadConOrden = {
      tipo: 'LOGISTICA_RUTAS',
      items: [
        { propiedadId: 101, orden: 1 },
        { propiedadId: 102, orden: 2 },
      ],
    };

    vi.mocked(prisma.propuestaComercial.create).mockResolvedValue({ id: 'p-3', ...payloadConOrden } as any);

    await PropuestasService.crear(payloadConOrden);

    const createCallArgs = vi.mocked(prisma.propuestaComercial.create).mock.calls[0][0];
    expect(createCallArgs.data.items.create[0].orden).toBe(1);
    expect(createCallArgs.data.items.create[1].orden).toBe(2);
  });

  it('debe registrar precio financiado y oferta de contado para un mismo lote', async () => {
  const payloadLoteSpegazzini = {
    tipo: 'INVERSION',
    clienteNombre: 'Cliente Lotes',
    items: [
      {
        propiedadId: 21,
        nombre: 'Lote Industrial Spegazzini',
        costoTierraCustom: 250000, // Precio Financiado
        ofertaContadoUSD: 230000,  // Precio Al Contado
        esFinanciado: true,
        porcentajeAnticipo: 30,
        cantidadCuotas: 24,
      },
    ],
  };

  vi.mocked(prisma.propuestaComercial.create).mockResolvedValue({ id: 'p-spegazzini', ...payloadLoteSpegazzini } as any);

  await PropuestasService.crear(payloadLoteSpegazzini);

  const createCallArgs = vi.mocked(prisma.propuestaComercial.create).mock.calls[0][0];
  const item = createCallArgs.data.items.create[0];

  expect(item.costoTierraCustom).toBe(250000);
  expect(item.ofertaContadoUSD).toBe(230000);
  expect(item.esFinanciado).toBe(true);
});
  });

  // --------------------------------------------------------------------------
  // TEST: Método actualizar()
  // --------------------------------------------------------------------------
  describe('actualizar()', () => {
    it('debe persistir correctamente los cambios de financiación sin sobreescribir con valores default por defecto', async () => {
      const mockId = 'cmv8b49nv000060u8alusimuf';
      
      // DATO DE ENTRADA: Cambiamos una propiedad que antes era financiada a pago al contado
      const mockPayloadUpdate = {
        tipo: 'INVERSION',
        clienteNombre: 'Inversor Editado',
        slug: 'inversion-editada',
        items: [
          {
            propiedadId: 21,
            esFinanciado: false, // Cambio explicito a al contado
            porcentajeAnticipo: 0,
            cantidadCuotas: 0,
            ofertaContadoUSD: 400000,
          },
        ],
      };

      vi.mocked(prisma.propuestaComercial.update).mockResolvedValue({ id: mockId, ...mockPayloadUpdate } as any);

      // EJECUCIÓN
      await PropuestasService.actualizar(mockId, mockPayloadUpdate);

      // VERIFICACIÓN 1: En una actualización, primero deben borrarse los items anteriores dentro de la transacción
      expect(prisma.propuestaItem.deleteMany).toHaveBeenCalledWith({ where: { propuestaId: mockId } });
      expect(prisma.propuestaComercial.update).toHaveBeenCalledTimes(1);

      // VERIFICACIÓN 2: Comprobamos que no se apliquen defaults indeseados (como 30% o 24 cuotas)
      // si el usuario explícitamente marcó el ítem como "no financiado" (`esFinanciado: false`)
      const updateCallArgs = vi.mocked(prisma.propuestaComercial.update).mock.calls[0][0];
      const itemActualizado = updateCallArgs.data.items.create[0];

      expect(itemActualizado.esFinanciado).toBe(false);
      expect(itemActualizado.porcentajeAnticipo).toBe(0);
      expect(itemActualizado.cantidadCuotas).toBe(0);
      expect(itemActualizado.ofertaContadoUSD).toBe(400000);
    });
  });

  // --------------------------------------------------------------------------
  // TEST: Métodos de Lectura (obtenerPorId / obtenerPorSlug)
  // --------------------------------------------------------------------------
  describe('obtenerPorId() / obtenerPorSlug()', () => {
    it('debe llamar al sanitizador para limpiar y estructurar los datos recibidos de la BD', async () => {
      const mockDbResponse = {
        id: 'prop-1',
        slug: 'inversion-prueba',
        items: [
          {
            id: 'item-1',
            propiedadId: 21,
            esFinanciado: true,
            propiedad: { id: 21, titulo: 'Galpón Spegazzini' },
          },
        ],
      };

      // SIMULACIÓN: Prisma encuentra la propuesta
      vi.mocked(prisma.propuestaComercial.findUnique).mockResolvedValue(mockDbResponse as any);

      // EJECUCIÓN
      const resultado = await PropuestasService.obtenerPorId('prop-1');

      // VERIFICACIÓN 1: Prisma incluye la relación de items y datos relacionales
      expect(prisma.propuestaComercial.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prop-1' },
          include: expect.objectContaining({ items: expect.anything() }),
        })
      );

      // VERIFICACIÓN 2: Confirmar que los datos pasen por la función de sanitización antes de enviarlos al frontend
      expect(sanearPropuestaComercial).toHaveBeenCalledWith(mockDbResponse);
      expect(resultado).toEqual(mockDbResponse);
    });

    it('debe retornar null si la propuesta no existe', async () => {
      // SIMULACIÓN: Búsqueda sin resultados en la BD
      vi.mocked(prisma.propuestaComercial.findUnique).mockResolvedValue(null);

      // EJECUCIÓN
      const resultado = await PropuestasService.obtenerPorSlug('slug-inexistente');

      // VERIFICACIÓN: Retorna null y NO ejecuta el sanitizador
      expect(resultado).toBeNull();
      expect(sanearPropuestaComercial).not.toHaveBeenCalled();
    });
  });
});