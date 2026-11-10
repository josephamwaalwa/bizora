import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none toast-container">
      {toasts.map((toast) => {
        const config = {
          success: {
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
            border: 'border-emerald-200',
            bg: 'bg-white',
          },
          error: {
            icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
            border: 'border-rose-200',
            bg: 'bg-white',
          },
          warning: {
            icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
            border: 'border-amber-200',
            bg: 'bg-white',
          },
          info: {
            icon: <Info className="w-5 h-5 text-indigo-500" />,
            border: 'border-indigo-200',
            bg: 'bg-white',
          },
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-elevated transition-all transform animate-in fade-in slide-in-from-bottom-2 duration-200 ${config.bg} ${config.border}`}
          >
            <div className="shrink-0 mt-0.5">{config.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
