import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../../types';

interface ToastContextType {
  showToast: (title: string, type?: 'success' | 'error' | 'info', message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((title: string, type: 'success' | 'error' | 'info' = 'success', message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newToast: ToastMessage = { id, title, type, message };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <aside aria-label="Notificações" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                isSuccess
                  ? 'bg-[#141812]/95 border-emerald-900/60 text-emerald-200'
                  : isError
                  ? 'bg-[#1c1212]/95 border-red-900/60 text-red-200'
                  : 'bg-[#161512]/95 border-[#C49A5A]/30 text-neutral-200'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isError && <AlertCircle className="w-5 h-5 text-red-400" />}
                {!isSuccess && !isError && <Info className="w-5 h-5 text-[#C49A5A]" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold tracking-tight text-white">{toast.title}</p>
                {toast.message && (
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{toast.message}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-neutral-500 hover:text-white transition-colors p-1"
                aria-label="Fechar notificação"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
