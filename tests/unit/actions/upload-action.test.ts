import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadImagenAction } from '@/actions/upload-action';
import * as imageService from '@/backend/services/image.service';

// Mock de la dependencia del servicio
vi.mock('@/backend/services/image.service', () => ({
  procesarYGuardarImagen: vi.fn(),
}));

describe('uploadImagenAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe fallar si no se adjunta ningún archivo', async () => {
    const formData = new FormData();
    const result = await uploadImagenAction(formData);

    expect(result.success).toBe(false);
    expect(result.error).toBe('No se recibió ningún archivo');
    expect(imageService.procesarYGuardarImagen).not.toHaveBeenCalled();
  });

  it('debe usar "industrial" por defecto si no se pasa watermarkType en el FormData', async () => {
    const file = new File(['fake-content'], 'foto.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderId', 'galeria-123');

    vi.mocked(imageService.procesarYGuardarImagen).mockResolvedValueOnce({
      url: 'http://cdn/foto_clean.webp',
      urlWatermark: 'http://cdn/foto_wm.webp',
    });

    const res = await uploadImagenAction(formData);

    expect(res.success).toBe(true);
    expect(imageService.procesarYGuardarImagen).toHaveBeenCalledWith(
      expect.any(Buffer),
      'foto.jpg',
      'image/jpeg',
      'propiedades/galeria-123',
      'industrial'
    );
  });

  it('debe enviar watermarkType "general" cuando se especifica en el FormData', async () => {
    const file = new File(['fake-content'], 'casa.png', { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderId', 'prop-neutra');
    formData.append('watermarkType', 'general');

    vi.mocked(imageService.procesarYGuardarImagen).mockResolvedValueOnce({
      url: 'http://cdn/casa_clean.webp',
      urlWatermark: 'http://cdn/casa_wm.webp',
    });

    const res = await uploadImagenAction(formData);

    expect(res.success).toBe(true);
    expect(imageService.procesarYGuardarImagen).toHaveBeenCalledWith(
      expect.any(Buffer),
      'casa.png',
      'image/png',
      'propiedades/prop-neutra',
      'general'
    );
  });

  it('debe atrapar errores y devolver success: false si el servicio lanza excepción', async () => {
    const file = new File(['fake-content'], 'error.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', file);

    vi.mocked(imageService.procesarYGuardarImagen).mockRejectedValueOnce(
      new Error('Fallo de almacenamiento')
    );

    const res = await uploadImagenAction(formData);

    expect(res.success).toBe(false);
    expect(res.error).toBe('Ocurrió un error al procesar la imagen');
  });
});