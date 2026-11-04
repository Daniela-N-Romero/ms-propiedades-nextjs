/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MapaBottomCarousel } from '@/features/mapa/components/mapa-bottom-carousel';
import type { PropiedadMapaItem } from '@/features/mapa/types/mapa-types';

const mockHandleWhatsAppClick = vi.fn((e) => e?.preventDefault?.());

vi.mock('@/features/propiedades/hooks/use-whatsapp-buttons', () => ({
  useWhatsAppButtons: ({ codigo, agente }: any) => ({
    whatsAppUrl: `https://wa.me/${agente?.telefono || '5491100000000'}?text=${codigo}`,
    handleWhatsAppClick: mockHandleWhatsAppClick,
  }),
}));

const mockPropiedades: PropiedadMapaItem[] = [
  {
    id: 1,
    codigo: 'IND-01',
    slug: 'galpon-con-agente',
    titulo: 'Galpón Central',
    precio: 250000,
    moneda: 'USD',
    latitud: -34.88,
    longitud: -58.38,
    zonaNombre: 'El Pato',
    superficieTotal: 1500,
    superficieCubierta: 1000,
    agente: {
      nombre: 'Lucía Agente',
      telefono: '5491133334444',
    },
  },
  {
    id: 2,
    codigo: 'IND-02',
    slug: 'galpon-sin-agente',
    titulo: 'Galpón Sin Asignar',
    precio: 300000,
    moneda: 'USD',
    latitud: -34.88,
    longitud: -58.38,
    zonaNombre: 'El Pato',
    superficieTotal: 1800,
    superficieCubierta: 1200,
  },
];

describe('MapaBottomCarousel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no renderiza nada si isOpen es false', () => {
    const { container } = render(
      <MapaBottomCarousel
        isOpen={false}
        propiedades={mockPropiedades}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza las tarjetas del cluster cuando está abierto y permite cerrar', () => {
    const handleClose = vi.fn();

    render(
      <MapaBottomCarousel
        isOpen={true}
        propiedades={mockPropiedades}
        onClose={handleClose}
      />
    );

    expect(screen.getByText('Galpón Central')).toBeDefined();
    expect(screen.getByText('Galpón Sin Asignar')).toBeDefined();

    const btnCerrar = screen.getByTitle('Cerrar vista previa');
    fireEvent.click(btnCerrar);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('dispara el manejador de WhatsApp al clickear el botón correspondiente', () => {
    render(
      <MapaBottomCarousel
        isOpen={true}
        propiedades={mockPropiedades}
        onClose={vi.fn()}
      />
    );

    const botonesWhatsApp = screen.getAllByTitle('Consultar por WhatsApp');
    expect(botonesWhatsApp.length).toBe(2);

    fireEvent.click(botonesWhatsApp[0]);
    expect(mockHandleWhatsAppClick).toHaveBeenCalledTimes(1);
  });
});