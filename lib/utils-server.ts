// Helper para leer archivos JSON (Soporta formato Array JSON o NDJSON)
export function readLegacyJson(filePath: string): any[] {
  
   if (typeof window !== 'undefined') {
    throw new Error("Esta función solo puede ejecutarse en el servidor.");
  }
  const fs = require('fs');

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Archivo no encontrado: ${filePath}. Se omitirá.`);
    return [];
  }

  const rawData = fs.readFileSync(filePath, 'utf-8').trim();
  if (!rawData) return [];

  try {
    return JSON.parse(rawData);
  } catch {
    // Si falla el parse global, leemos línea por línea sanitizando caracteres defectuosos
    const lines = rawData.split('\n');
    const results: any[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      try {
        // Sanitizar comillas/corchetes escapados en amenities legacy
        const sanitizedLine = line.replace(/,"\[\\\"[^"]+\\\"\]"/g, '');
        results.push(JSON.parse(sanitizedLine));
      } catch (err) {
        console.warn(`⚠️ Error omitiendo línea ${i + 1} corrupta en ${filePath}`);
      }
    }
    return results;
  }
}