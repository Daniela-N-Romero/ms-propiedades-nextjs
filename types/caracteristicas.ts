// types/caracteristicas.ts
export interface CaracteristicaDefinicion {
  key: string;
  label: string;
  icon: string;
  mercados: ('industrial' | 'residencial' | 'comercial' | 'terrenos')[];
  tipoInput?: 'boolean' | 'number' | 'text'; // Para saber si es un toggle o un número (ej: M2 de oficinas)
}

export const CARACTERISTICAS_CATALOGO: CaracteristicaDefinicion[] = [
  // 🏭 INDUSTRIAL
  { key: 'puenteGrua', label: 'Puente Grúa', icon: '🏗️', mercados: ['industrial'] },
  { key: 'dockCarga', label: 'Docks de Carga', icon: '🚛', mercados: ['industrial'] },
  { key: 'zonificacionIndustrial', label: 'Zonificación Industrial', icon: '🏭', mercados: ['industrial'] },
  { key: 'playaManiobras', label: 'Playa de Maniobras', icon: '🚚', mercados: ['industrial'] },
  { key: 'balanza', label: 'Balanza para Camiones', icon: '⚖️', mercados: ['industrial'] },
  { key: 'tieneGas', label: 'Gas Industrial', icon: '🔥', mercados: ['industrial'] },
  { key: 'almaLlena', label: 'Alma Llena', icon: '🏗️', mercados: ['industrial'] },
  { key: 'redHidrante', label: 'Red de Incendios', icon: '🧯', mercados: ['industrial'] },
  { key: 'sprinklers', label: 'Sprinklers', icon: '💧', mercados: ['industrial'] },
  { key: 'tienePotencia', label: 'Fuerza Motriz / T3', icon: '⚡', mercados: ['industrial'] },
  { key: 'altura', label: 'Altura (m)', icon: '📏', mercados: ['industrial'], tipoInput: 'number' },
  { key: 'oficinasM2', label: 'Oficinas (m²)', icon: '🏢', mercados: ['industrial', 'comercial'], tipoInput: 'number' },

  // 🏡 RESIDENCIAL
  { key: 'dormitorios', label: 'Dormitorios', icon: '🛏️', mercados: ['residencial'], tipoInput: 'number' },
  { key: 'banos', label: 'Baños', icon: '🚽', mercados: ['residencial', 'comercial', 'industrial'], tipoInput: 'number' },
  { key: 'cocheras', label: 'Cocheras', icon: '🚗', mercados: ['residencial', 'comercial'], tipoInput: 'number' },
  { key: 'barrioCerrado', label: 'Barrio Cerrado', icon: '🛡️', mercados: ['residencial', 'terrenos'] },
  { key: 'cercado', label: 'Perímetro Cercado', icon: '🧱', mercados: ['residencial', 'terrenos', 'industrial'] },
  { key: 'lavadero', label: 'Lavadero', icon: '🧺', mercados: ['residencial'] },
  { key: 'alarma', label: 'Alarma de Seguridad', icon: '🔔', mercados: ['residencial', 'comercial'] },
  { key: 'piscina', label: 'Piscina / Pileta', icon: '🏊', mercados: ['residencial'] },
  { key: 'quincho', label: 'Quincho / Parrilla', icon: '🍖', mercados: ['residencial'] },

  // 🏪 COMERCIAL
  { key: 'cortinaElectrica', label: 'Cortina Eléctrica', icon: '🗝️', mercados: ['comercial'] },
  { key: 'cortinaMetalica', label: 'Cortina Metálica', icon: '🗝️', mercados: ['comercial'] },
  { key: 'marquesina', label: 'Marquesina / Vidriera', icon: '🏬', mercados: ['comercial'] },

  // 🌐 SERVICIOS / AMBAS
  { key: 'seguridad24hs', label: 'Seguridad 24 hs', icon: '🛡️', mercados: ['industrial', 'residencial', 'comercial', 'terrenos'] },
  { key: 'cloacas', label: 'Cloacas / Tratamiento', icon: '💧', mercados: ['residencial', 'industrial'] },
  { key: 'serviciosGas', label: 'Gas Natural', icon: '🔥', mercados: ['residencial', 'terrenos'] },
  { key: 'serviciosLuz', label: 'Electricidad', icon: '⚡', mercados: ['residencial', 'terrenos', 'comercial'] },
  { key: 'serviciosAgua', label: 'Agua Corriente', icon: '💧', mercados: ['residencial', 'terrenos', 'comercial'] },
];