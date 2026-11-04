/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MapaResultsView from '@/features/mapa/components/mapa-results-view';
import type { PropiedadMapaItem } from '@/features/mapa/types/mapa-types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/propiedades/mapa',
  useSearchParams: () => new URLSearchParams('mercado=industrial'),
}));

vi.mock('@/features/filtrado', () => ({
  useFilterDraft: () => ({ activeCount: 2, isPending: false }),
  DesktopFilterSidebar: () => <div data-testid="desktop-sidebar">Sidebar</div>,
  MobileFilterDrawer: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="mobile-drawer">{isOpen ? 'Abierto' : 'Cerrado'}</div>
  ),
}));

vi.mock('@/features/mapa/components/mapa-propiedades', () => ({
  default: () => <div data-testid="mapa-container">Mock Mapa</div>,
}));

const mockPropiedades: PropiedadMapaItem[] = [
  {
    id: 1,
    codigo: 'IND-01',
    slug: 'galpon-el-pato',
    titulo: 'Galpón Industrial',
    precio: 250000,
    moneda: 'USD',
    latitud: -34.88,
    longitud: -58.38,
    zonaNombre: 'El Pato',
    superficieTotal: 1500,
    superficieCubierta: 1000,
  },
];

describe('MapaResultsView Component', () => {
  it('debe renderizar el contador de propiedades ubicadas y la insignia de filtros activos', () => {
    render(
      <MapaResultsView
        propiedades={mockPropiedades}
        zonasPadre={[]}
        partidos={[]}
        subtipos={[]}
      />
    );

    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText(/inmuebles ubicados/i)).toBeDefined();
    expect(screen.getByText('2')).toBeDefined(); // activeCount = 2
    expect(screen.getByTestId('desktop-sidebar')).toBeDefined();
    expect(screen.getByTestId('mapa-container')).toBeDefined();
  });
});