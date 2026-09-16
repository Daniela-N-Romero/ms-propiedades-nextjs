export interface CaracteristicaDefinicion {
  key: string;
  label: string;
  icon: string;
  mercados: ('industrial' | 'residencial' | 'comercial' | 'terrenos')[];
  tipoInput?: 'boolean' | 'number' | 'text' | 'boolean_or_value' | 'select'; 
  unidadesDisponibles?: { label: string; value: string }[];
  opcionesSelect?: { label: string; value: string }[];
}

export const CARACTERISTICAS_CATALOGO: CaracteristicaDefinicion[] = [
  // 🏭 INDUSTRIAL & COMERCIAL (Compartidos)
  { key: 'puenteGrua', label: 'Puente Grúa', icon: '🏗️', mercados: ['industrial', 'comercial'] },
  { key: 'dockCarga', label: 'Docks de Carga', icon: '🚛', mercados: ['industrial', 'comercial'] },
  { key: 'zonificacionIndustrial', label: 'Zonificación Industrial', icon: '🏭', mercados: ['industrial', 'comercial'] },
  { key: 'playaManiobras', label: 'Playa de Maniobras', icon: '🚚', mercados: ['industrial', 'comercial'] },
  { key: 'balanza', label: 'Balanza para Camiones', icon: '⚖️', mercados: ['industrial', 'comercial'] },
  { key: 'tieneGas', label: 'Gas Industrial / Comercial', icon: '🔥', mercados: ['industrial', 'comercial'] },
  { key: 'almaLlena', label: 'Alma Llena', icon: '🏗️', mercados: ['industrial', 'comercial'] },
  { key: 'redHidrante', label: 'Red de Incendios', icon: '🧯', mercados: ['industrial', 'comercial'] },
  { key: 'sprinklers', label: 'Sprinklers', icon: '💧', mercados: ['industrial', 'comercial'] },
  { key: 'altura', label: 'Altura', icon: '📏', mercados: ['industrial', 'comercial'], tipoInput: 'number' },
  
// ⚡ POTENCIA ELÉCTRICA CON SELECT T1/T2/T3
  { 
    key: 'potenciaElectrica', 
    label: 'Potencia Eléctrica', 
    icon: '⚡', 
    mercados: ['industrial', 'comercial'], 
    tipoInput: 'select',
    opcionesSelect: [
      { label: 'Tarifa T3', value: 'T3' },
      { label: 'Tarifa T2', value: 'T2' },
      { label: 'Tarifa T1', value: 'T1' },
      { label: 'Trifásica', value: 'Trifásica' },
    ]
  },

  // 🏢 OFICINAS Y BAÑOS (HÍBRIDOS CON ELECCIÓN DE UNIDAD)
  { 
    key: 'oficinas', 
    label: 'Oficinas', 
    icon: '🏢', 
    mercados: ['industrial', 'comercial', 'residencial'], 
    tipoInput: 'boolean_or_value',
    unidadesDisponibles: [
      { label: 'Superficie (m²)', value: 'm2' },
      { label: 'Cantidad', value: 'cant' }
    ]
  },
  { 
    key: 'banos', 
    label: 'Baños', 
    icon: '🚽', 
    mercados: ['residencial', 'comercial', 'industrial'], 
    tipoInput: 'boolean_or_value',
    unidadesDisponibles: [
      { label: 'Cantidad', value: 'cant' },
      { label: 'Superficie (m²)', value: 'm2' }
    ]
  },

  // 🏡 RESIDENCIAL & OTROS
  { key: 'dormitorios', label: 'Dormitorios', icon: '🛏️', mercados: ['residencial'], tipoInput: 'number' },
  { key: 'cocheras', label: 'Cocheras', icon: '🚗', mercados: ['residencial', 'comercial', 'industrial'], tipoInput: 'number' },
  { key: 'barrioCerrado', label: 'Barrio Cerrado', icon: '🛡️', mercados: ['residencial', 'terrenos'] },
  { key: 'cercado', label: 'Perímetro Cercado', icon: '🧱', mercados: ['residencial', 'terrenos', 'industrial', 'comercial'] },
  { key: 'lavadero', label: 'Lavadero', icon: '🧺', mercados: ['residencial'] },
  { key: 'alarma', label: 'Alarma de Seguridad', icon: '🔔', mercados: ['residencial', 'comercial', 'industrial'] },
  { key: 'piscina', label: 'Piscina / Pileta', icon: '🏊', mercados: ['residencial'] },
  { key: 'quincho', label: 'Quincho / Parrilla', icon: '🍖', mercados: ['residencial'] },

  // 🏪 COMERCIAL
  { key: 'cortinaElectrica', label: 'Cortina Eléctrica', icon: '🗝️', mercados: ['comercial', 'industrial'] },
  { key: 'cortinaMetalica', label: 'Cortina Metálica', icon: '🗝️', mercados: ['comercial', 'industrial'] },
  { key: 'marquesina', label: 'Marquesina / Vidriera', icon: '🏬', mercados: ['comercial'] },
  
  // 🌐 SERVICIOS / GENERAL
  { key: 'seguridad24hs', label: 'Seguridad 24 hs', icon: '🛡️', mercados: ['industrial', 'residencial', 'comercial', 'terrenos'] },
  { key: 'cloacas', label: 'Cloacas / Tratamiento', icon: '💧', mercados: ['residencial', 'industrial', 'comercial'] },
  { key: 'serviciosGas', label: 'Gas Natural', icon: '🔥', mercados: ['residencial', 'terrenos', 'comercial'] },
  { key: 'serviciosLuz', label: 'Electricidad', icon: '⚡', mercados: ['residencial', 'terrenos', 'comercial', 'industrial'] },
  { key: 'serviciosAgua', label: 'Agua Corriente', icon: '💧', mercados: ['residencial', 'terrenos', 'comercial', 'industrial'] },
];

export const ICONOS_CARACTERISTICAS: Record<string, { label: string; icon: string }> = 
  CARACTERISTICAS_CATALOGO.reduce((acc, item) => {
    acc[item.key] = { label: item.label, icon: item.icon };
    return acc;
  }, {} as Record<string, { label: string; icon: string }>);