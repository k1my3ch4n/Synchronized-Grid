"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../model/store";

export function UserMenu() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  if (status !== "authenticated" || !user) {
    return null;
  }

  const initial = (user.name ?? user.email ?? "?")[0].toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors overflow-hidden ring-2 ring-transparent hover:ring-accent/50 hover-scale"
        title={user.name ?? user.email ?? ""}
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? ""}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="w-full h-full flex items-center justify-center bg-accent text-white">
            {initial}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-56 glass rounded-lg border border-white/10 shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm font-medium text-text-primary truncate">
              {user.name}
            </p>
            <p className="text-xs text-text-muted truncate">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full px-4 py-2.5 text-left text-sm text-text-secondary hover:bg-white/5 transition-colors"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
