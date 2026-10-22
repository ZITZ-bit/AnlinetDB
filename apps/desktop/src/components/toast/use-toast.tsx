'use client';
import { useCallback, useSyncExternalStore, memo } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

type Listener = () => void;

let toasts: Toast[] = [];
const listeners = new Set<Listener>();
const emptyToasts: Toast[] = [];

function notify() {
  listeners.forEach((callback) => callback());
}

function subscribe(callback: Listener) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return toasts;
}

export function addToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
  const id = Date.now().toString() + Math.random().toString(36).slice(2, 7);
  const item: Toast = { id, message, type };
  toasts = [...toasts, item];
  notify();
  setTimeout(() => removeToast(id), 4500);
}

export function removeToast(id: string) {
  toasts = toasts.filter((toast) => toast.id !== id);
  notify();
}

export function useToast() {
  const current = useSyncExternalStore(subscribe, getSnapshot, () => emptyToasts);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    addToast(message, type);
  }, []);

  const ToastComponent = memo(() => <ToastContainer current={current} />);
  ToastComponent.displayName = 'ToastContainer';

  return { showToast, ToastComponent };
}

const estilosPorTipo = {
  success: {
    borde: 'border-l-[#31846c]',
    icono: 'text-[#31846c]',
  },
  error: {
    borde: 'border-l-[#bd554b]',
    icono: 'text-[#bd554b]',
  },
  info: {
    borde: 'border-l-[#4d7891]',
    icono: 'text-[#4d7891]',
  },
  warning: {
    borde: 'border-l-[#c58a2d]',
    icono: 'text-[#a96f13]',
  },
} as const;

const iconosPorTipo = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
} as const;

export function ToastContainer({ current }: { current: Toast[] }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[min(360px,calc(100vw_-_2rem))] flex-col gap-2">
      {current.map((toast) => (
        <div
          key={toast.id}
          role={toast.type === 'error' || toast.type === 'warning' ? 'alert' : 'status'}
          aria-live="polite"
          className={`pointer-events-auto flex animate-toast-in items-center gap-3 rounded-[5px] border border-black/[0.08] border-l-[3px] bg-white px-3.5 py-3 text-sm font-medium leading-[1.45] text-[#243430] shadow-[0_8px_24px_rgba(23,42,38,0.12)] ${estilosPorTipo[toast.type].borde}`}
        >
          <span className={`shrink-0 text-base ${estilosPorTipo[toast.type].icono}`}>
            {iconosPorTipo[toast.type]}
          </span>
          <span className="min-w-0 flex-1">{toast.message}</span>
          <button
            className="shrink-0 cursor-pointer border-0 bg-transparent p-1 text-base leading-none text-[#71817c] transition-colors hover:text-[#243430]"
            aria-label="Cerrar aviso"
            onClick={() => removeToast(toast.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
