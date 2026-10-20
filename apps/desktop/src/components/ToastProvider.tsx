'use client';

import { useToast } from '@/hooks/use-toast';

export function ToastProvider() {
  const { ToastComponent } = useToast();
  return <ToastComponent />;
}