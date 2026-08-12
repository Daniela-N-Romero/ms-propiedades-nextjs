'use client';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const config = {
    danger: {
      icon: '🗑️',
      badgeBg: 'bg-red-100 text-red-800',
      btnConfirm: 'bg-red-600 hover:bg-red-700 text-white',
      defaultTitle: '¿Eliminar elemento?',
    },
    warning: {
      icon: '⚠️',
      badgeBg: 'bg-amber-100 text-amber-900',
      btnConfirm: 'bg-brand-orange hover:bg-orange-600 text-white',
      defaultTitle: '¿Está seguro de continuar?',
    },
    info: {
      icon: '❓',
      badgeBg: 'bg-blue-100 text-blue-900',
      btnConfirm: 'bg-brand-dark hover:bg-slate-800 text-white',
      defaultTitle: 'Confirmar acción',
    },
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden transform transition-all p-6 space-y-5">
        
        {/* ENCABEZADO Y MENSAJE */}
        <div className="flex items-start gap-3">
          <span className="text-2xl p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
            {config.icon}
          </span>
          <div className="flex-1 pt-1">
            <h3 className="font-spartan font-bold text-base text-slate-900 uppercase tracking-wider">
              {title || config.defaultTitle}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* ACCIONES (ACCIONES / BOTONES) */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl font-spartan font-bold text-xs uppercase tracking-wider border border-slate-300 text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              onConfirm();
            }}
            className={`px-5 py-2.5 rounded-xl font-spartan font-bold text-xs uppercase tracking-wider transition shadow-sm disabled:opacity-50 flex items-center gap-2 ${config.btnConfirm}`}
          >
            {isLoading ? 'Procesando...' : confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}