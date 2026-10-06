'use server';

import { getStorageProvider } from '@/backend/services/storage/storage.factory';

export async function uploadPdfAction(file: File) {
  try {
    if (!file) {
      return { success: false, error: 'No se recibió ningún archivo PDF' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const storage = getStorageProvider();

    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const result = await storage.uploadFile(buffer, cleanName, 'application/pdf');

    return { success: true, url: result.url };
  } catch (error) {
    console.error('Error subiendo PDF:', error);
    return { success: false, error: 'Ocurrió un error al subir el PDF' };
  }
}