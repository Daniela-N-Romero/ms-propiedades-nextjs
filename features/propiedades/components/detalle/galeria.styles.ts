export const styles = {
  headerContainer: "mb-6 space-y-2",
  badgeOperacion: "inline-block text-sm font-spartan font-bold uppercase tracking-wider px-3 py-1 bg-brand-orange text-white rounded-md mr-3",
  codigoBadge: "inline-block text-sm font-spartan font-bold uppercase tracking-wider px-3 py-1 bg-slate-200 text-slate-700 rounded-md",
  titulo: "text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight",
  ubicacion: "text-sm text-slate-500 flex items-center gap-1 font-medium",
  
  // Grid de Galería
  galleryGrid: "grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden relative cursor-pointer  max-h-[480px]",
  mainImageContainer: "md:col-span-2 relative aspect-[4/3] md:aspect-auto h-full min-h-[300px] overflow-hidden",
  secondaryGrid: "hidden md:grid grid-cols-2 col-span-2 gap-2 h-full",
  smallImageContainer: "relative aspect-[4/3] h-full overflow-hidden bg-slate-100",
  
  // Botón "Ver todas las fotos"
  btnVerTodas: "absolute bottom-4 right-4 bg-white/90 backdrop-blur-md hover:bg-white text-slate-900 text-xs font-spartan font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 border border-slate-200 z-10 hover:scale-105",

  // Modal / Lightbox Fullscreen
  lightboxOverlay: "fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 animate-fadeIn",
  lightboxHeader: "flex justify-between items-center text-white z-20",
  lightboxCounter: "text-xs font-spartan font-bold uppercase tracking-widest text-slate-400",
  lightboxCloseBtn: "w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-lg font-bold",
  lightboxMainArea: "relative flex-1 flex items-center justify-center my-4 overflow-hidden",
  lightboxNavBtnLeft: "absolute left-2 md:left-6 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-xl font-bold backdrop-blur-sm",
  lightboxNavBtnRight: "absolute right-2 md:right-6 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-xl font-bold backdrop-blur-sm"
};