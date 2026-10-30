// features/filtrado/index.ts

// 1. Tipos, utilidades y hooks centrales
export * from './types/filtrado.types';
export * from './utils/url-query-builder';
export * from './hooks/use-filter-draft';
export * from './hooks/use-order-select';

// 2. Hook heredado para compatibilidad con vistas de mapa existentes
export * from './hooks/use-property-filters';

// 3. Nuevos componentes con estado borrador (Batching) y jerarquía
export { DesktopFilterSidebar } from './components/desktop-filter-sidebar';
export { MobileFilterDrawer } from './components/mobile-filter-drawer';
export { FiltroZonasJerarquico } from './components/filtro-zonas-jerarquico';
export { OrdenarSelect } from './components/ordenar-select';

// 4. Componentes de compatibilidad
export { default as PanelFiltros } from './components/panel-filtros';
export { default as ResultsView } from './components/results-view';