"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SessionExpiredHandler() {
  const router = useRouter();

  useEffect(() => {
    const onSessionExpired = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("anlinet:session");
      router.replace("/");
    };

    window.addEventListener("anlinet:session-expired", onSessionExpired);
    return () => window.removeEventListener("anlinet:session-expired", onSessionExpired);
  }, [router]);

  return null;
}