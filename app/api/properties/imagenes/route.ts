import { NextResponse } from 'next/server';
import { guardarImagenEnBD } from '@/backend/services/property.service';

export async function POST(request: Request) {
  try {
    const { urlPublica, propiedadId } = await request.json();

    if (!urlPublica || !propiedadId) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos (urlPublica, propiedadId)' },
        { status: 400 }
      );
    }

    const nuevaImagen = await guardarImagenEnBD(urlPublica, Number(propiedadId));
    return NextResponse.json({ success: true, imagen: nuevaImagen });
  } catch (error) {
    console.error('Error en POST /api/properties/imagenes:', error);
    return NextResponse.json(
      { error: 'Error al asociar la imagen' },
      { status: 500 }
    );
  }
}