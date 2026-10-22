'use client';

import type { ReactNode } from 'react';

import { useSessionExpired } from '@/hooks/use-session-expired';
import { ToastProvider } from '@/components/toast/ToastProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  useSessionExpired();

  return (
    <>
      {children}
      <ToastProvider />
    </>
  );
}
