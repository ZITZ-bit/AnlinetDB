'use client';
import { useState, useCallback, useEffect, useRef, memo } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((cb) => cb(toasts));
}

export function addToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const id = Date.now().toString() + Math.random().toString(36).slice(2, 7);
  const item: Toast = { id, message, type };
  toasts = [...toasts, item];
  notify();
  setTimeout(() => {
    removeToast(id);
  }, 4500);
}

export function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

export function useToast() {
  const [current, setCurrent] = useState<Toast[]>(toasts);

  useEffect(() => {
    listeners.add(setCurrent);
    setCurrent(toasts);
    return () => {
      listeners.delete(setCurrent);
    };
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    addToast(message, type);
  }, []);

  const ToastComponent = memo(() => <ToastContainer current={current} />);
  ToastComponent.displayName = 'ToastContainer';

  return { showToast, ToastComponent };
}

export function ToastContainer({ current }: { current: Toast[] }) {
  return (
    <div className="anlinet-toast-container">
      {current.map((toast) => (
        <div
          key={toast.id}
          className={`anlinet-toast anlinet-toast--${toast.type}`}
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          <span className="anlinet-toast__icon">
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span className="anlinet-toast__message">{toast.message}</span>
          <button
            className="anlinet-toast__close"
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
