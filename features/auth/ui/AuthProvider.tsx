"use client";

import { SessionProvider } from "next-auth/react";
import { AuthStoreSync } from "./AuthStoreSync";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthStoreSync />
      {children}
    </SessionProvider>
  );
}
