import fs from 'fs';
import path from 'path';
import { IStorageProvider, UploadResult } from '@/backend/interfaces/storage.interface';

/**
 * Adapter para Guardar Archivos en el Disco Duro Local (Entorno Dev)
 */
export class LocalStorageAdapter implements IStorageProvider {
  private uploadDir: string;

  constructor() {
    // Definimos el directorio físico: public/uploads/
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Si la carpeta no existe en tu computadora, la crea
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
    // Sanitizamos el nombre del archivo para evitar espacios o caracteres raros
    const cleanFileName = `${Date.now()}_${filename.replace(/\s+/g, '_')}`;
    const filePath = path.join(this.uploadDir, cleanFileName);

    // Guardamos el Buffer directamente en la carpeta public/uploads/
    await fs.promises.writeFile(filePath, file);

    return {
      url: `/uploads/${cleanFileName}`,
      key: cleanFileName,
    };
  }

  async deleteFile(key: string): Promise<boolean> {
    const filePath = path.join(this.uploadDir, key);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  }
}