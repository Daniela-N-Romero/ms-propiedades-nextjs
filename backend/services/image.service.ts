import { getStorageProvider } from '@/backend/services/storage/storage.factory';
import { aplicarMarcaDeAgua } from '@/backend/lib/watermark';

export async function procesarYGuardarImagen(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string
) {
  const storage = getStorageProvider();

  // 1. Subimos la versión LIMPIA (Original)
  const cleanResult = await storage.uploadFile(
    fileBuffer,
    `clean_${filename}`,
    mimeType
  );

  // 2. Generamos la versión CON MARCA DE AGUA
  const watermarkedBuffer = await aplicarMarcaDeAgua(fileBuffer);

  // 3. Subimos la versión CON MARCA DE AGUA
  const cleanNameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
    const wmResult = await storage.uploadFile(
      watermarkedBuffer,
      `${cleanNameWithoutExt}_wm.webp`,
      'image/webp'
    );

    return {
      url: cleanResult.url,            // URL Limpia (La por defecto de toda la app)
      urlWatermark: wmResult.url,      // URL Con Marca de Agua (Para la vista detalle)
    };
  }