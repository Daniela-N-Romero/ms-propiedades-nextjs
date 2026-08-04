import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new NextResponse('URL de imagen no proporcionada', { status: 400 });
    }

    // 1. Descargar la imagen limpia desde Supabase Storage
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return new NextResponse('Error al obtener la imagen original', { status: 404 });
    }
    const imageBuffer = Buffer.from(await response.arrayBuffer());

    // 2. Cargar el logo desde la carpeta /public
    const logoPath = path.join(process.cwd(), 'public/images/logos/', 'watermark.png');
    
    if (!fs.existsSync(logoPath)) {
      // Si no existe el logo por alguna razón, devuelve la imagen original
      return new NextResponse(imageBuffer, {
        headers: { 'Content-Type': 'image/jpeg' },
      });
    }

    // 3. Obtener dimensiones de la imagen original para escalar el logo de forma proporcional
    const metadata = await sharp(imageBuffer).metadata();
    const imageWidth = metadata.width || 1200;

    // Queremos que el logo ocupe el 30% del ancho de la imagen
    const watermarkWidth = Math.round(imageWidth * 0.3);

    // Redimensionar el logo
    const resizedLogoBuffer = await sharp(logoPath)
      .resize({ width: watermarkWidth })
      .toBuffer();

    // 4. Aplicar la marca de agua en el centro con Sharp
    const outputBuffer = await sharp(imageBuffer)
      .composite([
        {
          input: resizedLogoBuffer,
          gravity: 'center', // Opciones: 'center', 'southeast' (esquina inferior derecha), etc.
        },
      ])
      .toFormat('webp', { quality: 80 }) // Formato WebP optimizado
      .toBuffer();

    // 5. Retornar la imagen procesada con encabezados de Caché para Vercel
    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type': 'image/webp',
        // Esto le indica a Vercel que guarde la foto en caché por 1 año
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error('Error procesando marca de agua:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}