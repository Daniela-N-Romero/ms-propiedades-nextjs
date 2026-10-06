export interface UploadResult {
    url: string; // URL pública para ver la imagen (ej: https://... o /uploads/...)
    key: string; // Identificador único dentro del storage para borrarla después
}


// CONTRATO / INTERFAZ:
// Cualquier clase que maneje imágenes DEBE implementar estos dos métodos
export interface IStorageProvider {
  uploadFile(file: Buffer, filename: string, mimeType: string): Promise<UploadResult>;
  deleteFile(key: string): Promise<boolean>;
}

//Imaginá que tu aplicación web es como un Televisor. En lugar de soldar el cable de la consola directo a la placa del televisor, la tele tiene un puerto HDMI.
//La Interfaz (IStorageProvider): Es la especificación del puerto HDMI. Dice: "Cualquier cosa que se conecte acá debe tener la forma HDMI y poder enviar video".