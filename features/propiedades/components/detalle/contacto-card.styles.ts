export const styles = {
  // Card Fija (Desktop)
  stickyContainer: "bg-white rounded-2xl p-6 shadow-lg border border-slate-100 sticky top-24 space-y-6",
  
  // Header del Agente
  agentHeader: "flex items-center gap-4 pb-4 border-b border-slate-100",
  agentAvatar: "w-14 h-14 rounded-full bg-slate-200 object-cover border-2 border-brand-orange flex-shrink-0 flex items-center justify-center font-bold text-slate-600 text-lg",
  agentName: "font-spartan font-bold text-slate-900 text-base",
  agentRole: "text-xs text-slate-500 font-medium",

  // Botón Principal de WhatsApp
  btnWhatsApp: "w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-spartan font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm",

  // Botón Secundario Descarga PDF
  btnPdf: "w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-spartan font-bold uppercase tracking-wider py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs border border-slate-200",

  // Formulario
  formTitle: "text-xs font-spartan font-bold text-slate-400 uppercase tracking-wider mb-2",
  input: "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-dark focus:bg-white transition-all",
  textarea: "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-dark focus:bg-white transition-all resize-none h-20",
  btnSubmit: "w-full bg-brand-dark hover:bg-slate-800 text-white font-spartan font-bold uppercase tracking-wider py-3 rounded-xl transition-all text-xs",

  // Bar Flotante Inferior en Mobile
  mobileBottomBar: "fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 flex items-center justify-between gap-3 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.1)]",
  mobilePrice: "text-base font-extrabold text-brand-green",
  mobileCode: "text-[10px] text-slate-400 font-bold block"
};