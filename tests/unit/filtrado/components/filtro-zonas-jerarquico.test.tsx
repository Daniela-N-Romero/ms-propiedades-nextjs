/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FiltroZonasJerarquico } from '@/features/filtrado/components/filtro-zonas-jerarquico';
import type { ZonaPadre, PartidoConLocalidades } from '@/features/filtrado';

const mockZonasPadre: ZonaPadre[] = [
  { id: 1, nombre: 'GBA Sur' },
  { id: 2, nombre: 'GBA Norte' },
];

const mockPartidos: PartidoConLocalidades[] = [
  {
    id: 10,
    nombre: 'Quilmes',
    padreId: 1,
    localidades: [
      { id: 101, nombre: 'Bernal' },
      { id: 102, nombre: 'Quilmes Centro' },
    ],
  },
  {
    id: 11,
    nombre: 'Berazategui',
    padreId: 1,
    localidades: [
      { id: 103, nombre: 'Ranelagh' },
    ],
  },
  {
    id: 20,
    nombre: 'Tigre',
    padreId: 2,
    localidades: [
      { id: 201, nombre: 'Nordelta' },
    ],
  },
];

describe('FiltroZonasJerarquico', () => {
  it('selecciona automáticamente todas las localidades al cambiar la región principal', () => {
    const handleSelectMultiple = vi.fn();
    const handleToggle = vi.fn();

    render(
      <FiltroZonasJerarquico
        zonasPadre={mockZonasPadre}
        partidos={mockPartidos}
        localidadesSeleccionadas={[]}
        onToggleLocalidad={handleToggle}
        onSelectMultipleLocalidades={handleSelectMultiple}
      />
    );

    const selectRegion = screen.getByRole('combobox');
    
    // Cambiamos a GBA Norte (id: 2)
    fireEvent.change(selectRegion, { target: { value: '2' } });

    // 1. Debe haber desmarcado las localidades seleccionadas previamente
    expect(handleSelectMultiple).toHaveBeenCalledWith([], false);

    // 2. Debe haber seleccionado todas las localidades hijas de GBA Norte ([201])
    expect(handleSelectMultiple).toHaveBeenCalledWith([201], true);
  });

  it('permite seleccionar todas las localidades de un partido individual mediante su checkbox', () => {
    const handleSelectMultiple = vi.fn();

    render(
      <FiltroZonasJerarquico
        zonasPadre={mockZonasPadre}
        partidos={mockPartidos}
        localidadesSeleccionadas={[]}
        onToggleLocalidad={vi.fn()}
        onSelectMultipleLocalidades={handleSelectMultiple}
      />
    );

    // Tildamos el partido Quilmes
    const chkQuilmes = screen.getByLabelText(/quilmes/i);
    fireEvent.click(chkQuilmes);

    // Debe mandar a agregar las localidades [101, 102]
    expect(handleSelectMultiple).toHaveBeenCalledWith([101, 102], true);
  });
});