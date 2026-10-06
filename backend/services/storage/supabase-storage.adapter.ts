import { IStorageProvider, UploadResult } from '@/backend/interfaces/storage.interface';
import { createClient } from '@supabase/supabase-js';

export class SupabaseStorageAdapter implements IStorageProvider {
  private client;
  private bucket: string;

  constructor() {
    this.client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
    this.bucket = 'propiedades-imagenes';
  }

  async uploadFile(file: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
    const filePath = `uploads/${Date.now()}_${filename}`;
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .upload(filePath, file, { contentType: mimeType });

    if (error) throw new Error(`Error en Supabase Storage: ${error.message}`);

    const { data: publicUrlData } = this.client.storage
      .from(this.bucket)
      .getPublicUrl(data.path);

    return {
      url: publicUrlData.publicUrl,
      key: data.path,
    };
  }

  async deleteFile(key: string): Promise<boolean> {
    const { error } = await this.client.storage.from(this.bucket).remove([key]);
    return !error;
  }
}

//Imaginá que tu aplicación web es como un Televisor. En lugar de soldar el cable de la consola directo a la placa del televisor, la tele tiene un puerto HDMI.
//El Adapter de Supabase (SupabaseStorageAdapter): Es como conectar una PlayStation con cable HDMI.