'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => remove(id), variant === 'error' ? 6000 : 3500);
  }, [remove]);

  const ctx: ToastContextValue = {
    show,
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error'),
    info: (m) => show(m, 'info'),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-md">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [entering, setEntering] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setEntering(false), 10);
    return () => clearTimeout(t);
  }, []);

  const styles: Record<ToastVariant, { bg: string; border: string; text: string; icon: ReactNode }> = {
    success: { bg: 'bg-secondary/10', border: 'border-secondary/30', text: 'text-secondary-900', icon: <CheckCircle size={20} className="text-secondary flex-shrink-0" /> },
    error: { bg: 'bg-accent/10', border: 'border-accent/30', text: 'text-accent-900', icon: <AlertCircle size={20} className="text-accent flex-shrink-0" /> },
    info: { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary-900', icon: <Info size={20} className="text-primary flex-shrink-0" /> },
  };
  const s = styles[toast.variant];

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 ${s.bg} ${s.border} ${s.text} border rounded-lg shadow-lg px-4 py-3 transition-all duration-200 ${entering ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}
      role="alert"
    >
      {s.icon}
      <p className="text-sm font-medium flex-1 break-words">{toast.message}</p>
      <button onClick={onClose} className="flex-shrink-0 opacity-60 hover:opacity-100">
        <X size={16} />
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Silent fallback so calling components don't crash when not wrapped in the provider
    return {
      show: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return ctx;
}

// Helper to convert an arbitrary error to a user-friendly message
export function errorMessage(err: unknown, fallback = 'Something went wrong'): string {
  const e = err as { response?: { data?: { error?: string; message?: string }; status?: number }; message?: string };
  return (
    e?.response?.data?.error ||
    e?.response?.data?.message ||
    e?.message ||
    fallback
  );
}
