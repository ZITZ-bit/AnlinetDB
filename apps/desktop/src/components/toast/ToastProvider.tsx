'use client';

import { useToast } from './use-toast';

export function ToastProvider() {
  const { ToastComponent } = useToast();
  return <ToastComponent />;
}