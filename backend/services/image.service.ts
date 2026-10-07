import { getStorageProvider } from '@/backend/services/storage/storage.factory';
import { aplicarMarcaDeAgua } from '@/backend/lib/watermark';
import crypto from 'crypto';
import sharp from 'sharp';

function getRandomHash(): string {
  return crypto.randomBytes(2).toString('hex');
}

async function convertToWebP(fileBuffer: Buffer): Promise<Buffer> {
  return await sharp(fileBuffer)
      .webp({ quality: 85 })
      .toBuffer();
}

function generateUniqueFilename(): string {
    const timestamp = Date.now();
    const randomHash = getRandomHash();
    return `img_${timestamp}_${randomHash}`;
}


export async function procesarYGuardarImagen(
  fileBuffer: Buffer,
  _filename: string, // Prefijado con _ indicando que no se usa para la key
  _mimeType: string,
  folderPath: string = 'propiedades'  
) {
  const storage = getStorageProvider();
  const uniqueFilename = generateUniqueFilename();
  const cleanWebpBuffer = await convertToWebP(fileBuffer);
  const watermarkedBuffer = await aplicarMarcaDeAgua(cleanWebpBuffer); 

  // 1. Subimos la versión LIMPIA (Original) en WebP
  const cleanKey = `${folderPath}/${uniqueFilename}_clean.webp`;
  const cleanResult = await storage.uploadFile(
    cleanWebpBuffer,
    cleanKey,
    'image/webp'
  );

  // 2. Generamos la versión CON MARCA DE AGUA

  // 3. Subimos la versión CON MARCA DE AGUA
  const wmKey = `${folderPath}/${uniqueFilename}_wm.webp`;
    const wmResult = await storage.uploadFile(
      watermarkedBuffer,
      wmKey,
      'image/webp'
    );

    return {
      url: cleanResult.url,            // URL Limpia (La por defecto de toda la app)
      urlWatermark: wmResult.url,      // URL Con Marca de Agua (Para la vista detalle)
    };
  }