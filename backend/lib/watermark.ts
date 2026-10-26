import { createCanvas, loadImage } from '@napi-rs/canvas';
import path from 'path';
import fs from 'fs';

export type WatermarkType = 'industrial' | 'general';

const WATERMARK_PATHS: Record<WatermarkType, string> = {

  industrial: path.join(process.cwd(), 'public', 'images', 'logos', 'watermark.png'),
  general: path.join(process.cwd(), 'public', 'images', 'logos', 'watermark-general.png')

};

export async function aplicarMarcaDeAgua(imageBuffer: Buffer, watermarkType: WatermarkType = 'industrial'): Promise<Buffer> {

  const watermarkPath = WATERMARK_PATHS[watermarkType] || WATERMARK_PATHS.industrial;

  // Fallback: si no existe el logo físico, devolvemos la imagen original sin tocar
  if (!fs.existsSync(watermarkPath)) {
    return imageBuffer;
  }

  const logoBuffer = fs.readFileSync(watermarkPath);

  //Cargamos ambas imágenes usando Canvas
  const [image, logo] = await Promise.all([
    loadImage(imageBuffer),
    loadImage(logoBuffer),
  ]);

  // Creamos el Lienzo Canvas con las dimensiones exactas de la foto
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  // Dibujamos la foto de fondo
  ctx.drawImage(image, 0, 0);

  // Calculamos la ubicación EXACTA 
  const watermarkWidth = Math.round(image.width * 0.3);
  const watermarkHeight = Math.round((logo.height / logo.width) * watermarkWidth);

  const x = Math.round((image.width - watermarkWidth) / 2);
  const y = Math.round((image.height - watermarkHeight) / 2);

  // Dibujamos la marca de agua centrada
  ctx.drawImage(logo, x, y, watermarkWidth, watermarkHeight);

  // Generamos el buffer final comprimido en WebP
  const outputBuffer = await canvas.encode('webp', 85);
  return Buffer.from(outputBuffer);
}