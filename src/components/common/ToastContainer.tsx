import React from 'react';
import { useApp } from '../../context/AppContext';
import { X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex w-full max-w-sm flex-col gap-3 pointer-events-none toast-container">
      {toasts.map((toast) => {
        const bar = {
          success: 'bg-teal-700',
          error: 'bg-[#8E3B32]',
          warning: 'bg-[#8A5A12]',
          info: 'bg-ink',
        }[toast.type];

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-4 border border-line bg-white shadow-modal"
          >
            <span className={`mt-0 w-1 self-stretch ${bar}`} />
            <div className="flex-1 min-w-0 py-4 pr-2">
              <p className="text-[15px] font-medium text-ink">{toast.title}</p>
              {toast.message && (
                <p className="mt-1 text-[14px] leading-relaxed text-ink-secondary">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-3 text-ink-muted hover:text-ink"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
