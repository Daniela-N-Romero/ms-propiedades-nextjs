  // formatear precio
  export const formatPrecio = (valor: any, currency:string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(Number(valor));
  };

  //HELPERS PARA MIGRACION DE DATOS DE LEGACY

  // Helper para normalizar textos para Slugs SEO
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Elimina acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '') // Quita caracteres especiales
    .replace(/\s+/g, '-') // Reemplaza espacios por guiones
    .replace(/-+/g, '-'); // Evita guiones dobles
}

// Helper para generar Códigos de Referencia Semánticos sin exponer IDs
export function generarCodigoRef(prop: any): string {
  // Ejemplos de prefijos según el tipo: NAV (Nave), GAL (Galpón), LOT (Lote), CAS (Casa), DEP (Depto)
  let prefijo = 'PROP';
  if (prop.type === 'industrial') prefijo = 'IND';
  else if (prop.type === 'residencial') prefijo = 'RES';
  else if (prop.type === 'comercial') prefijo = 'COM';


  // Obtenemos iniciales de la localidad (ej: Berazategui -> BER)
  const loc = slugify(prop.locality || prop.neighbourhood || 'GBA')
    .substring(0, 3)
    .toUpperCase();

  // Generamos un hash/sufijo alfanumérico único basado en el ID original
  // El ID directo asegura que NO haya duplicados entre los 98 inmuebles
  const hashUnico = (prop.id + 1000).toString(36).toUpperCase();

  return `${prefijo}-${loc}-${hashUnico}`;
}


// Convierte un número a string formateado con puntos de miles
export function formatNumberWithDots(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '';
  const numStr = String(val).replace(/\D/g, ''); // Deja solo dígitos
  if (!numStr) return '';
  return new Intl.NumberFormat('es-AR').format(parseInt(numStr, 10));
}

// Limpia los puntos de miles para guardar solo el número puro
export function parseRawNumber(val: string): number {
  const clean = val.replace(/\D/g, '');
  return clean ? parseInt(clean, 10) : 0;
}