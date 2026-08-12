'use client';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'success' | 'info';
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
}: AlertModalProps) {
  if (!isOpen) return null;

  // Iconos y colores según el tipo de mensaje
  const config = {
    error: {
      icon: '🚫',
      badgeBg: 'bg-red-100 text-red-800 border-red-200',
      btnBg: 'bg-red-600 hover:bg-red-700 text-white',
      defaultTitle: 'Acción Bloqueada',
    },
    warning: {
      icon: '⚠️',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
      btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
      defaultTitle: 'Atención',
    },
    success: {
      icon: '✅',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      defaultTitle: '¡Éxito!',
    },
    info: {
      icon: 'ℹ️',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-200',
      btnBg: 'bg-brand-dark hover:bg-slate-800 text-white',
      defaultTitle: 'Información',
    },
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden transform transition-all p-6 space-y-4">

        {/* ENCABEZADO */}
        <div className="bg-slate-300 text-center ">
            <h3 className=" font-spartan font-bold text-base uppercase tracking-wider mb-3">
              {config.icon} {title || config.defaultTitle}
            </h3>
        </div>
        <div>
          <p className="text-sm text-slate-800 mt-1 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* FOOTER / BOTÓN */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl font-spartan font-bold text-xs uppercase tracking-wider transition-all shadow-sm ${config.btnBg}`}
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}