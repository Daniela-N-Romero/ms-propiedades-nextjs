import { IStorageProvider } from '@/backend/interfaces/storage.interface';
import { LocalStorageAdapter } from './local-storage.adapter';
import { CloudflareR2Adapter } from './cloudfare-r2.adapter';

/**
 * Patrón Factory (Fábrica): Retorna el Adapter correcto según la variable de entorno.
 */
export function getStorageProvider(): IStorageProvider {
  const provider = process.env.STORAGE_PROVIDER || 'local';

  switch (provider) {
    case 'cloudflare':
      return new CloudflareR2Adapter();
    case 'local':
    default:
      return new LocalStorageAdapter();
  }
}
//Imaginá que tu aplicación web es como un Televisor. En lugar de soldar el cable de la consola directo a la placa del televisor, la tele tiene un puerto HDMI.
//La Fábrica (storage.factory.ts): Es el control remoto que decide qué entrada mostrar según una variable de tu .env.