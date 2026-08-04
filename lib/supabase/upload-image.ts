import { supabase } from '@/lib/supabase/supabaseClient';
import imageCompression from 'browser-image-compression';

/**
 * Recibe la imagen limpia del formulario, la comprime en el navegador,
 * la sube a Supabase Storage y guarda la URL limpia en la Base de Datos.
 */
export async function uploadImagen(file: File) {
  try {
    // Paso 1: Comprimir imagen en el navegador (WebP)
    const compressedFile = await compressImage(file);

    // Paso 2: Definir nombre único para el archivo
    const fileName = `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}.webp`;

    // Paso 3: Subir la imagen limpia a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('propiedades-imagenes')
      .upload(fileName, compressedFile, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error al subir la imagen a Supabase Storage:', uploadError);
      return;
    }

    // Paso 4: Obtener la URL pública limpia
    const { data: publicUrlData } = supabase.storage
      .from('propiedades-imagenes')
      .getPublicUrl(fileName);

    const urlPublica = publicUrlData.publicUrl;

    return urlPublica;

  } catch (err) {
    console.error('Error en el proceso de subida:', err);
  }
}

/**
 * Elimina la imagen de Supabase Storage si el usuario la borra del formulario
 */
export async function deleteImagenFromStorage(publicUrl: string) {
  try {
    const fileName = publicUrl.split('/').pop();
    if (!fileName) return;

    await supabase.storage.from('propiedades-imagenes').remove([fileName]);
  } catch (err) {
    console.error('Error eliminando de Supabase Storage:', err);
  }
}

/**
 * Comprime la imagen en el navegador antes de enviarla
 */
async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,           // Peso máximo objetivo (~1 MB)
    maxWidthOrHeight: 1920,  // Redimensiona si pasa de FullHD (1920px)
    useWebWorker: true,     // Procesamiento rápido en segundo plano
    fileType: 'image/webp',  // Convierte automáticamente a formato WebP
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    // Convertir el Blob comprimido de vuelta a File para TypeScript
    return new File([compressedBlob], file.name, { type: 'image/webp' });
  } catch (error) {
    console.error('Error al comprimir la imagen, se usará la original:', error);
    return file; // Si falla la compresión, envía el archivo original
  }
}