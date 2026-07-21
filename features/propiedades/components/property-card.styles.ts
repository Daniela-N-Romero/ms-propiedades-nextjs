// features/propiedades/components/property-card.styles.ts
export const styles = {
  card: "group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow duration-300",
  imageWrapper: "relative h-64 w-full bg-slate-900 overflow-hidden",
  badgeOperation: "absolute top-4 left-4 z-10 font-spartan font-bold uppercase tracking-wider text-xs px-3 py-1.5 rounded-md text-white shadow-sm",
  badgeType: "absolute top-4 right-4 z-10 font-spartan font-bold uppercase tracking-wider text-xs px-2.5 py-1 rounded-md bg-brand-dark text-white border border-slate-700/30",
  content: "p-5 flex-grow flex flex-col justify-between gap-4",
  infoGroup: "space-y-2",
  location: "text-xs font-semibold uppercase tracking-wider text-brand-cyan",
  title: "text-lg font-spartan font-bold text-brand-dark uppercase tracking-wide leading-snug line-clamp-2 min-h-[3.5rem] group-hover:text-brand-orange transition-colors",
  
  // Bloques de Valor y Ofertas (Estilo Canva)
  priceBlock: "bg-brand-dark text-white px-4 py-2 rounded-lg font-spartan font-bold text-lg tracking-wider uppercase flex justify-between items-center",
  greenBanner: "bg-brand-green text-white px-4 py-2 rounded-lg font-spartan font-bold text-sm tracking-wide uppercase text-center mt-1",
  
  // Detalles técnicos
  featuresGrid: "grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium",
  featureItem: "flex items-center gap-1.5",
  
  // Botón Ficha
  viewBtn: "w-full text-center bg-slate-100 group-hover:bg-brand-orange group-hover:text-white text-brand-dark font-spartan font-bold uppercase tracking-wider py-2.5 rounded-xl text-xs transition-colors"
};