// import { NextRequest, NextResponse } from 'next/server';
// import sharp from 'sharp';

// export async function GET(request: NextRequest) {
//   let imageBuffer: Buffer | null = null;

//   try {
//     const { searchParams } = new URL(request.url);
//     const imageUrl = searchParams.get('url');

//     if (!imageUrl) {
//       return new NextResponse('URL no proporcionada', { status: 400 });
//     }

//     // 1. Descargar la imagen original desde Supabase
//     const response = await fetch(imageUrl);
//     if (!response.ok) {
//       return new NextResponse('Error al obtener la imagen de Supabase', { status: 404 });
//     }

//     imageBuffer = Buffer.from(await response.arrayBuffer());

//     // 2. Intentar obtener el logo desde el dominio público
//     const host = request.headers.get('host') || 'www.mspropiedadesindustrial.com.ar';
//     const protocol = host.includes('localhost') ? 'http' : 'https';
//     const logoUrl = `${protocol}://${host}/images/logos/watermark.png`;

//     const logoResponse = await fetch(logoUrl);

//     if (logoResponse.ok) {
//       const logoBuffer = Buffer.from(await logoResponse.arrayBuffer());
      
//       // Obtener dimensiones
//       const metadata = await sharp(imageBuffer).metadata();
//       const imageWidth = metadata.width || 1200;
//       const watermarkWidth = Math.round(imageWidth * 0.3); // 30% del ancho

//       // Redimensionar logo
//       const resizedLogoBuffer = await sharp(logoBuffer)
//         .resize({ width: watermarkWidth })
//         .toBuffer();

//       // Procesar marca de agua
//       const outputBuffer = await sharp(imageBuffer)
//         .composite([
//           {
//             input: resizedLogoBuffer,
//             gravity: 'center',
//           },
//         ])
//         .jpeg({ quality: 85 }) // 💡 Convertimos a JPEG para máxima compatibilidad con todos los navegadores
//         .toBuffer();

//       return new NextResponse(new Uint8Array(outputBuffer), {
//         headers: {
//           'Content-Type': 'image/webp',
//           'Cache-Control': 'public, max-age=31536000, immutable',
//         },
//       });
//     }
//   } catch (error) {
//     console.error('⚠️ Error al aplicar marca de agua, devolviendo imagen original:', error);
//   }

//   // FALLBACK DE SEGURIDAD: Si falla el logo o la marca de agua, devuelve la foto original
//   if (imageBuffer) {
// return new NextResponse(new Uint8Array(imageBuffer), {
//   headers: {
//     'Content-Type': 'image/webp', 
//     'Cache-Control': 'public, max-age=31536000, immutable',
//   },
// });
//   }

//   return new NextResponse('Error procesando imagen', { status: 500 });
// }


import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('URL no proporcionada', { status: 400 });
  }

  let imageBuffer: Buffer | null = null;
  let originalContentType = 'image/jpeg';

  try {
    // 1. Descargar la imagen original desde Supabase
    const response = await fetch(imageUrl);
    if (!response.ok) {
      // Si la foto no existe en Supabase, redirigir a la URL directa por seguridad
      return NextResponse.redirect(imageUrl, 302);
    }

    originalContentType = response.headers.get('content-type') || 'image/jpeg';
    imageBuffer = Buffer.from(await response.arrayBuffer());

    // 2. Leer la marca de agua desde el sistema de archivos (Evita llamadas HTTP adicionales)
    let logoBuffer: Buffer | null = null;
    try {
      const logoPath = path.join(process.cwd(), 'public', 'images', 'logos', 'watermark.png');
      logoBuffer = await fs.readFile(logoPath);
    } catch {
      // Fallback si no encuentra el archivo por fs
      const host = request.headers.get('host') || 'www.mspropiedadesindustrial.com.ar';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const logoRes = await fetch(`${protocol}://${host}/images/logos/watermark.png`);
      if (logoRes.ok) {
        logoBuffer = Buffer.from(await logoRes.arrayBuffer());
      }
    }

    // Si no se pudo obtener el logo, retornar imagen original
    if (!logoBuffer) {
      return new NextResponse(new Uint8Array(imageBuffer), {
        headers: {
          'Content-Type': originalContentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // 3. Procesar Marca de Agua
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
      .webp({ quality: 85 }) // 💡 Coincide el formato exportado con el Content-Type de la respuesta
      .toBuffer();

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error('⚠️ Fallo en procesamiento de marca de agua, activando fallback:', error);

    // FALLBACK 1: Devolver la imagen original si se pudo descargar el buffer
    if (imageBuffer) {
      return new NextResponse(new Uint8Array(imageBuffer), {
        headers: {
          'Content-Type': originalContentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // FALLBACK 2 (INDROMABLE): Redirigir directamente a la foto almacenada en Supabase
    return NextResponse.redirect(imageUrl, 302);
  }
}