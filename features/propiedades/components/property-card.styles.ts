export const styles = {
  // Contenedor principal estilizado con borde y sombra leve
  card: "group bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-brand-cyan/40 transition-all duration-300",
  
  // Imagen proporcional
  imageWrapper: "relative h-36 sm:h-44 md:h-48 w-full bg-slate-900 overflow-hidden",
  
  // Badges sobre la foto
  badgeOperation: "absolute top-2.5 left-2.5 z-10 font-spartan font-extrabold uppercase tracking-wider text-[9px] sm:text-[10px] px-2.5 py-1 rounded-md shadow-md",
  destacada: "absolute top-2.5 right-2.5 z-10 bg-amber-400/50 text-slate-950 text-[11px] font-black p-1.5 rounded-md shadow-md flex items-center justify-center border border-amber-300",

  // Cuerpo de la tarjeta
  content: "p-3 sm:p-3.5 flex-grow flex flex-col justify-between gap-2.5",
  infoGroup: "space-y-1",
  location: "text-[10px] font-bold uppercase tracking-wider text-brand-cyan flex items-center gap-1 line-clamp-1",
  
  // Título compacto con peso visual
  title: "text-xs sm:text-sm font-spartan font-bold text-brand-dark uppercase tracking-wide leading-tight line-clamp-2 min-h-[2rem] sm:min-h-[2.4rem] group-hover:text-brand-cyan transition-colors",
  
  // Grilla de Superficies con contenedor gris técnico
  featuresGrid: "grid grid-cols-2 gap-1 p-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-slate-500 font-medium text-center",
  featureItem: "flex flex-col items-center justify-center gap-0.5",
  
  // Bloque de Precio con identidad de marca
  priceBlock: "bg-brand-dark text-white px-3 py-2.5 font-spartan font-bold text-xs sm:text-sm tracking-wider uppercase flex justify-between items-center shadow-xs group-hover:bg-brand-cyan transition-colors duration-300",

    // futuro  priceBlock: "bg-brand-dark text-white px-3 py-2 rounded-xl font-spartan font-bold text-xs sm:text-sm tracking-wider uppercase flex flex-col gap-1 shadow-xs group-hover:bg-brand-cyan transition-colors duration-300",
};