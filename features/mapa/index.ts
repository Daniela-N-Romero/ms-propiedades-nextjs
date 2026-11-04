// Componentes
export { default as MapaResultsView } from './components/mapa-results-view';
export { default as MapaAdminResultsView } from './components/mapa-admin-results-view';
export { default as MapaDetallePropiedad } from './components/mapa-detalle-propiedad';
export { default as MapaPropiedades } from './components/mapa-propiedades';

// Utils
export { buildListUrlFromMapParams } from './utils/mapa-navigation';
export { toPropiedadesMapa, esCoordenadaValida } from './utils/mapa-adapter';

// Tipos
export type {
  PropiedadMapaItem,
  PropietarioMapaItem,
  ColegaMapaItem,
} from './types/mapa-types';