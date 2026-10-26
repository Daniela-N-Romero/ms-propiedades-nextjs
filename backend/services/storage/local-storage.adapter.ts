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

  async uploadFile(file: Buffer, filename: string, _mimeType: string): Promise<UploadResult> {
    // Reemplaza espacios preservando las barras de carpetas
    const cleanFileName = filename.replace(/\s+/g, '_');
    const filePath = path.join(this.uploadDir, cleanFileName);

    // Crea las subcarpetas necesarias (ej: public/uploads/propiedades/id_propiedad/)
    const targetDir = path.dirname(filePath);
    if (!fs.existsSync(targetDir)) {
      await fs.promises.mkdir(targetDir, { recursive: true });
    }

    // Guarda el archivo
    await fs.promises.writeFile(filePath, file);

    // En Next.js la carpeta /public se omite en la URL web.
    // Convertimos separadores de Windows (\) a barras de URL (/)
    const webUrlPath = cleanFileName.split(path.sep).join('/');

    return {
      url: `/uploads/${webUrlPath}`,
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