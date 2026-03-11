"use client";

import Link from "next/link";
import { useSyncedUrl } from "@features/room/hooks/useSyncedUrl";
import { UserPresence } from "@features/room/ui/UserPresence";
import { UserMenu } from "@features/auth";
import { EditableUrl } from "./EditableUrl";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { url, setUrl } = useSyncedUrl();

  return (
    <header className="h-16 px-6 glass flex items-center relative z-10">
      <Link
        href="/workspaces"
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
      >
        <h1 className="text-lg font-bold tracking-tight text-text-primary">
          {title}
        </h1>
        <span className="text-xs text-text-muted font-mono hidden sm:inline">
          SynGrid
        </span>
      </Link>

      {url && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <div className="glass rounded-glass px-5 py-1.5 w-[90vw] max-w-[380px] glass-hover transition-all">
            <EditableUrl url={url} onUrlChange={setUrl} />
          </div>
        </div>
      )}

      <div className="ml-auto flex items-center gap-3">
        <UserPresence />
        <UserMenu />
      </div>
    </header>
  );
}
