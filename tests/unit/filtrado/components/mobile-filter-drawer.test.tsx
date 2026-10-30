/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MobileFilterDrawer } from '@/features/filtrado/components/mobile-filter-drawer';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/propiedades/industrial',
  useSearchParams: () => new URLSearchParams('mercado=industrial'),
}));

const mockZonasPadre = [{ id: 1, nombre: 'GBA Sur' }];
const mockPartidos = [
  {
    id: 10,
    nombre: 'Quilmes',
    padreId: 1,
    localidades: [
      { id: 101, nombre: 'Bernal' },
      { id: 102, nombre: 'Quilmes Centro' },
    ],
  },
];
const mockSubtipos = [{ id: 1, nombre: 'Nave Industrial', slug: 'nave-industrial' }];

describe('MobileFilterDrawer - Integración', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no se renderiza si isOpen es false', () => {
    render(
      <MobileFilterDrawer
        isOpen={false}
        onClose={vi.fn()}
        zonasPadre={mockZonasPadre}
        partidos={mockPartidos}
        subtipos={mockSubtipos}
      />
    );
    expect(screen.queryByText('Filtros')).toBeNull();
  });

  it('permite seleccionar opciones sin disparar navegación hasta presionar Aplicar', () => {
    const handleClose = vi.fn();

    render(
      <MobileFilterDrawer
        isOpen={true}
        onClose={handleClose}
        zonasPadre={mockZonasPadre}
        partidos={mockPartidos}
        subtipos={mockSubtipos}
      />
    );

    // 1. Tildar tipo de operación Venta
    const btnVenta = screen.getByRole('button', { name: /venta/i });
    fireEvent.click(btnVenta);

    // 2. Tildar subtipo Nave Industrial
    const chkNave = screen.getByLabelText(/nave industrial/i);
    fireEvent.click(chkNave);

    // 3. Tildar partido Quilmes
    const chkQuilmes = screen.getByLabelText(/quilmes/i);
    fireEvent.click(chkQuilmes);

    // Verificar que la navegación NO ocurrió mientras el usuario interactúa
    expect(mockPush).not.toHaveBeenCalled();
    expect(handleClose).not.toHaveBeenCalled();

    // 4. Presionar el botón Aplicar
    const btnAplicar = screen.getByRole('button', { name: /aplicar/i });
    fireEvent.click(btnAplicar);

    // Verificar que se ejecutó 1 sola llamada consolidada y se cerró el modal
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('categoria=venta'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('subtipo=nave-industrial'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('localidad=101'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('localidad=102'));
  });
});