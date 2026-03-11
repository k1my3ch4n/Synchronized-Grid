"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAuthStore } from "../model/store";

function AuthStoreSync() {
  const { data: session, status } = useSession();
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setSession(
        {
          id: session.user.id ?? "",
          name: session.user.name ?? null,
          email: session.user.email ?? null,
          image: session.user.image ?? null,
        },
        "authenticated",
      );
    } else if (status === "unauthenticated") {
      setSession(null, "unauthenticated");
    }
  }, [session, status, setSession]);

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthStoreSync />
      {children}
    </SessionProvider>
  );
}
