import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

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

    // 2. ✅ OBTENER EL LOGO VÍA HTTP (Funciona 100% garantizado en Vercel Serverless)
    const host = request.headers.get('host') || 'www.mspropiedadesindustrial.com.ar';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const logoUrl = `${protocol}://${host}/images/logos/watermark.png`;

    const logoResponse = await fetch(logoUrl);
    let resizedLogoBuffer: Buffer | null = null;

    if (logoResponse.ok) {
      const logoBuffer = Buffer.from(await logoResponse.arrayBuffer());
      
      // 3. Dimensiones para escalar el logo proporcionalmente
      const metadata = await sharp(imageBuffer).metadata();
      const imageWidth = metadata.width || 1200;
      const watermarkWidth = Math.round(imageWidth * 0.3); // 30% del ancho

      resizedLogoBuffer = await sharp(logoBuffer)
        .resize({ width: watermarkWidth })
        .toBuffer();
    }

    // 4. Si no se pudo obtener el logo, devolvemos la imagen limpia sin romper la web
    if (!resizedLogoBuffer) {
      return new NextResponse(imageBuffer, {
        headers: { 'Content-Type': 'image/jpeg' },
      });
    }

    // 5. Aplicar la marca de agua con Sharp
    const outputBuffer = await sharp(imageBuffer)
      .composite([
        {
          input: resizedLogoBuffer,
          gravity: 'center',
        },
      ])
      .toFormat('webp', { quality: 80 })
      .toBuffer();

    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error('Error procesando marca de agua:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}