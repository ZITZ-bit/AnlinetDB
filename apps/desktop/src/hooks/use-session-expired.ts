'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SESSION_EXPIRED_EVENT = 'anlinet:session-expired';
const TOKEN_KEY = 'token';
const SESSION_KEY = 'anlinet:session';

export function useSessionExpired() {
  const router = useRouter();

  useEffect(() => {
    const onSessionExpired = () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
      router.replace('/');
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
  }, [router]);
}
