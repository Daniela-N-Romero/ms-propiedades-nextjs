import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { IStorageProvider, UploadResult } from '@/backend/interfaces/storage.interface';

/**
 * Adapter para Guardar Archivos en Cloudflare R2 (Entorno Producción)
 */
export class CloudflareR2Adapter implements IStorageProvider {
  private s3Client: S3Client;
  private bucketName: string;
  private publicDomain: string;

  constructor() {
    // Credenciales leídas desde las variables de entorno (.env)
    const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || '';
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '';

    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'mspropiedades';
    this.publicDomain = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || '';

    // Inicializamos el cliente S3 oficial que apunta a Cloudflare R2
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(file: Buffer, filename: string, mimeType: string): Promise<UploadResult> {
    const fileKey = `propiedades/${Date.now()}_${filename.replace(/\s+/g, '_')}`;

    // Enviamos el comando de subida a Cloudflare
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file,
        ContentType: mimeType,
      })
    );

    return {
      url: `${this.publicDomain}/${fileKey}`,
      key: fileKey,
    };
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );
      return true;
    } catch {
      return false;
    }
  }
}

//Imaginá que tu aplicación web es como un Televisor. En lugar de soldar el cable de la consola directo a la placa del televisor, la tele tiene un puerto HDMI.
//El Adapter de Cloudflare R2 (CloudflareR2Adapter): Es conectar una Xbox con cable HDMI.