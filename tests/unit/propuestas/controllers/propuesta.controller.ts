import { describe, it, expect, vi } from 'vitest';
import { GET_PROPUESTAS } from '@/features/propuestas/controllers/propuesta.controller';
import { PropuestasService } from '@/features/propuestas/services/propuesta.service';

vi.mock('@/features/propuestas/services/propuesta.service', () => ({
  PropuestasService: {
    obtenerListadoAdmin: vi.fn(),
  },
}));

describe('Propuestas Controller', () => {
  it('debe retornar un JSON con la lista de propuestas', async () => {
    const mockPropuestas = [{ id: '1', clienteNombre: 'Test' }];
    vi.spyOn(PropuestasService, 'obtenerListadoAdmin').mockResolvedValue(mockPropuestas as any);

    const response = await GET_PROPUESTAS();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockPropuestas);
  });
});