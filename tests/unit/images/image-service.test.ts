import { describe, it, expect, vi, beforeEach } from 'vitest';
import { procesarYGuardarImagen } from '@/backend/services/image.service';
import * as watermarkLib from '@/backend/lib/watermark';
import * as storageFactory from '@/backend/services/storage/storage.factory';

// Mockeamos @napi-rs/canvas para evitar dependencias nativas en tests
vi.mock('@napi-rs/canvas', () => ({
  loadImage: vi.fn().mockResolvedValue({ width: 800, height: 600 }),
  createCanvas: vi.fn(() => ({
    getContext: () => ({ drawImage: vi.fn() }),
    encode: vi.fn().mockResolvedValue(Buffer.from('dummy-clean-webp')),
  })),
}));

vi.mock('@/backend/lib/watermark', () => ({
  aplicarMarcaDeAgua: vi.fn().mockResolvedValue(Buffer.from('dummy-wm-webp')),
}));

describe('image.service - procesarYGuardarImagen', () => {
  const mockUploadFile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(storageFactory, 'getStorageProvider').mockReturnValue({
      uploadFile: mockUploadFile.mockImplementation((_buffer, key, _mime) =>
        Promise.resolve({ url: `https://fake-r2.com/${key}`, key })
      ),
      deleteFile: vi.fn(),
    });
  });

  it('debe pasar el watermarkType recibido a aplicarMarcaDeAgua', async () => {
    const fileBuffer = Buffer.from('archivo-original');

    const result = await procesarYGuardarImagen(
      fileBuffer,
      'test.jpg',
      'image/jpeg',
      'propiedades/10',
      'general'
    );

    // Confirma que llamó al generador de marca con la opción 'general'
    expect(watermarkLib.aplicarMarcaDeAgua).toHaveBeenCalledWith(
      expect.any(Buffer),
      'general'
    );

    // Confirma que subió dos versiones: limpia y estampada
    expect(mockUploadFile).toHaveBeenCalledTimes(2);
    expect(mockUploadFile).toHaveBeenNthCalledWith(
      1,
      expect.any(Buffer),
      expect.stringMatching(/^propiedades\/10\/img_.*_clean\.webp$/),
      'image/webp'
    );
    expect(mockUploadFile).toHaveBeenNthCalledWith(
      2,
      expect.any(Buffer),
      expect.stringMatching(/^propiedades\/10\/img_.*_wm\.webp$/),
      'image/webp'
    );

    expect(result.url).toContain('_clean.webp');
    expect(result.urlWatermark).toContain('_wm.webp');
  });
});