export const styles = {
  container: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6",
  
  // Encabezado y Leyenda
  headerBar: "flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4",
  leyenda: "text-sm text-slate-500 font-medium",
  strongEmphasis: "text-brand-dark font-spartan font-bold uppercase",
  
  // Barra de botones Mobile (1 sola línea, uno al lado del otro)
  mobileStatusBar: "flex md:hidden gap-3 w-full",
  mobileBtn: "flex-1 flex items-center justify-center gap-2 bg-white border border-slate-300 rounded-xl py-3 px-4 text-sm font-semibold text-slate-700 shadow-sm cursor-pointer active:bg-slate-50",
  filterBadge: "bg-brand-orange text-brand-dark font-spartan font-bold text-xs px-2 py-0.5 rounded-full",
  
  // Estructura de Paneles (Aside + Grilla)
  layoutGrid: "grid grid-cols-1 md:grid-cols-4 gap-8 items-start",
  asideDesktop: "hidden md:block md:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-24 space-y-6",
  
  // Contenedor Derecho (Controles superiores + Cards)
  mainContent: "md:col-span-3 space-y-4",
  topControlsDesktop: "hidden md:flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200",
  
  // Grilla de Fichas
  cardsGrid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
  
  // Elementos de Filtro Individual (Filtros Aside)
  filterSection: "space-y-3 pb-5 border-b border-slate-100 last:border-b-0 last:pb-0",
  filterTitle: "font-spartan font-bold text-xs text-brand-dark uppercase tracking-wider",
  checkboxLabel: "flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer hover:text-slate-900",
  inputRango: "w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-xs text-slate-900 focus:outline-none focus:border-brand-dark focus:bg-white"
};