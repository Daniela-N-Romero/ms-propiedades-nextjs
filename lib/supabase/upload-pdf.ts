import { supabase } from '@/lib/supabase/supabaseClient';
/**
 * Sube un archivo PDF a Supabase Storage y retorna la URL pública limpia
 */
export async function uploadPdfClean(file: File): Promise<string | null> {
  try {
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${cleanName}_${Date.now()}`;

    const { error: uploadError } = await supabase.storage
      .from('propiedades-pdfs')
      .upload(fileName, file, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error al subir PDF a Supabase:', uploadError);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('propiedades-pdfs')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Error en el proceso de subida de PDF:', err);
    return null;
  }
}