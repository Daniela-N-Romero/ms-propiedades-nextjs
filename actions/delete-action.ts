'use server';

import { getStorageProvider } from '@/backend/services/storage/storage.factory';
import { SupabaseStorageAdapter } from '@/backend/services/storage/supabase-storage.adapter';

export async function deleteImagenAction(fileKeyOrUrl: string) {
  try {
    if (!fileKeyOrUrl) return { success: false };

    // const storage = getStorageProvider();
    
    // // Extraemos la key o el nombre de archivo de la URL
    // const key = fileKeyOrUrl.split('/').pop() || fileKeyOrUrl;

    // CODIGO TEMPORAL POR ARCHIVOS LEGACY
    // Si la URL es legacy de Supabase, usamos explícitamente el adapter de Supabase
    const isSupabaseUrl = fileKeyOrUrl.includes('supabase.co');
    const storage = isSupabaseUrl ? new SupabaseStorageAdapter() : getStorageProvider();

    let key = fileKeyOrUrl;

    if (fileKeyOrUrl.startsWith('http')) {
      const urlObj = new URL(fileKeyOrUrl);
      key = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;

      // Si es Supabase, quitamos la ruta del bucket ("storage/v1/object/public/propiedades-imagenes/")
      if (isSupabaseUrl) {
        key = fileKeyOrUrl.split('/').pop() || fileKeyOrUrl;
      }
    }

    console.log('Eliminando archivo con StorageProvider:', storage, ' key:', key);

    const result = await storage.deleteFile(key);
    return { success: result };
  } catch (error) {
    console.error('Error eliminando archivo con StorageProvider:', error);
    return { success: false, error: 'No se pudo eliminar el archivo' };
  }
}