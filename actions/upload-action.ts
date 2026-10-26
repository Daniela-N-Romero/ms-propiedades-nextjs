'use server';

import { procesarYGuardarImagen } from '@/backend/services/image.service';
import { WatermarkType } from '@/backend/lib/watermark';

export async function uploadImagenAction(formData: FormData) {
  try {
    const file = formData.get('file') as File | null;
    const entityFolder = (formData.get('folderId') as string) || 'temp';
    const watermarkType = ((formData.get('watermarkType') as string) || 'industrial') as WatermarkType; 
    const folderPath = `propiedades/${entityFolder}`;

    if (!file) {
      return { success: false, error: 'No se recibió ningún archivo' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Guarda en local/R2 y aplica la marca de agua con @napi-rs/canvas
    const resultado = await procesarYGuardarImagen(
      buffer,
      file.name,
      file.type,
      folderPath,
      watermarkType
    );
    console.log('Resultado de procesarYGuardarImagen:', resultado);

    return { success: true, data: resultado }; // Retorna { url, urlWatermark }
  } catch (error) {
    console.error('Error procesando y subiendo imagen:', error);
    return { success: false, error: 'Ocurrió un error al procesar la imagen' };
  }
}