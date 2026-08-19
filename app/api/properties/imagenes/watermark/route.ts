import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('URL no proporcionada', { status: 400 });
  }

  try {
    // 1. Descargamos la imagen original de Supabase
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      // Si la foto no existe o Supabase falla, redirigimos a la URL directa
      return NextResponse.redirect(imageUrl, 302);
    }

    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

    // 2. Importamos 'sharp' dinámicamente para que si falla la carga del binario no rompa la Serverless Function
    const sharp = (await import('sharp')).default;

    // 3. Descargamos el logo vía HTTP (es 100% compatible con Vercel Serverless)
    const host = request.headers.get('host') || 'www.mspropiedadesindustrial.com.ar';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const logoUrl = `${protocol}://${host}/images/logos/watermark.png`;

    const logoRes = await fetch(logoUrl);

    if (!logoRes.ok) {
      // Si no encuentra el logo, devolvemos la imagen original descargada
      return new NextResponse(new Uint8Array(imageBuffer), {
        headers: {
          'Content-Type': imageRes.headers.get('content-type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    const logoBuffer = Buffer.from(await logoRes.arrayBuffer());

    // 4. Calculamos dimensiones y aplicamos la marca de agua
    const metadata = await sharp(imageBuffer).metadata();
    const imageWidth = metadata.width || 1200;
    const watermarkWidth = Math.round(imageWidth * 0.3); // 30% del ancho

    const resizedLogoBuffer = await sharp(logoBuffer)
      .resize({ width: watermarkWidth })
      .toBuffer();

    const outputBuffer = await sharp(imageBuffer)
      .composite([
        {
          input: resizedLogoBuffer,
          gravity: 'center',
        },
      ])
      .webp({ quality: 85 })
      .toBuffer();

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error('⚠️ Fallo crítico en marca de agua (Vercel Fallback):', error);
    
    // 🛡️ FALLBACK INDESTRUCTIBLE:
    // Ante cualquier error de sharp o del sistema, redirige de inmediato a Supabase.
    // La imagen NUNCA más se mostrará rota en la web ni devolverá 500.
    return NextResponse.redirect(imageUrl, 302);
  }
}