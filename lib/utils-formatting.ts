// formatear precio
export const formatPrecio = (valor: any, currency: string) => {
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
    .replace(/-/g, '')
    .substring(0, 3)
    .toUpperCase();

  // Generar combinación única (Letras y números aleatorios de 3 caracteres)
  // Ej: "A8", "XZ9", "Y3B" o usando un hash basado en ID/Timestamp
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomSuffix = '';
  for (let i = 0; i < 3; i++) {
    randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `${prefijo}-${loc}-${randomSuffix}`;
}


// Convierte un número a string formateado con puntos de miles
export function formatNumberWithDots(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '';
  // Convertimos a string y normalizamos puntos a comas para la vista
  const str = String(val).replace('.', ',');

  // Separamos parte entera de la parte decimal (ej: "2800,50" -> ["2800", "50"])
  const [entero, decimal] = str.split(',');

  // Limpiamos la parte entera dejando solo dígitos
  const enteroLimpio = entero.replace(/\D/g, '');
  if (!enteroLimpio && decimal === undefined) return '';

  // Formateamos la parte entera con puntos de miles (es-AR)
  const enteroFormateado = enteroLimpio
    ? new Intl.NumberFormat('es-AR').format(parseInt(enteroLimpio, 10))
    : '0';

  // Si el usuario escribió una coma, se la devolvemos con sus decimales
  return decimal !== undefined ? `${enteroFormateado},${decimal}` : enteroFormateado;
}

// Limpia los puntos de miles para guardar solo el número puro
export function parseRawNumber(val: string): number {
  if (!val) return 0;
  // Quitamos los puntos de miles y cambiamos la coma decimal por punto
  const clean = val.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatearExpensas(
  valor?: number | null,
  modalidad?: string | null
): string | null {
  if (!valor || valor <= 0) return null;

  switch (modalidad) {
    case 'USD':
      return `USD ${valor.toLocaleString('es-AR')}`;
    case 'USD_M2':
      return `USD ${valor} / m²`;
    case 'ARS_M2':
      return `$ ${valor.toLocaleString('es-AR')} / m²`;
    case 'ARS':
    default:
      return `$ ${valor.toLocaleString('es-AR')}`;
  }
}