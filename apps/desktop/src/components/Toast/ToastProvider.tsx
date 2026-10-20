'use client';

import { useToast } from './use-toast';
import './Toast.css';

export function ToastProvider() {
  const { ToastComponent } = useToast();
  return <ToastComponent />;
}