import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function GET(request: NextRequest) {
  let imageBuffer: Buffer | null = null;

  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new NextResponse('URL no proporcionada', { status: 400 });
    }

    // 1. Descargar la imagen original desde Supabase
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return new NextResponse('Error al obtener la imagen de Supabase', { status: 404 });
    }

    imageBuffer = Buffer.from(await response.arrayBuffer());

    // 2. Intentar obtener el logo desde el dominio público
    const host = request.headers.get('host') || 'www.mspropiedadesindustrial.com.ar';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const logoUrl = `${protocol}://${host}/images/logos/watermark.png`;

    const logoResponse = await fetch(logoUrl);

    if (logoResponse.ok) {
      const logoBuffer = Buffer.from(await logoResponse.arrayBuffer());
      
      // Obtener dimensiones
      const metadata = await sharp(imageBuffer).metadata();
      const imageWidth = metadata.width || 1200;
      const watermarkWidth = Math.round(imageWidth * 0.3); // 30% del ancho

      // Redimensionar logo
      const resizedLogoBuffer = await sharp(logoBuffer)
        .resize({ width: watermarkWidth })
        .toBuffer();

      // Procesar marca de agua
      const outputBuffer = await sharp(imageBuffer)
        .composite([
          {
            input: resizedLogoBuffer,
            gravity: 'center',
          },
        ])
        .jpeg({ quality: 85 }) // 💡 Convertimos a JPEG para máxima compatibilidad con todos los navegadores
        .toBuffer();

      return new NextResponse(new Uint8Array(outputBuffer), {
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
  } catch (error) {
    console.error('⚠️ Error al aplicar marca de agua, devolviendo imagen original:', error);
  }

  // FALLBACK DE SEGURIDAD: Si falla el logo o la marca de agua, devuelve la foto original
  if (imageBuffer) {
return new NextResponse(new Uint8Array(imageBuffer), {
  headers: {
    'Content-Type': 'image/webp', 
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
});
  }

  return new NextResponse('Error procesando imagen', { status: 500 });
}