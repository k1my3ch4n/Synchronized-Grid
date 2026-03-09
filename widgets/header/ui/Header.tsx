"use client";

import { useSyncedUrl } from "@features/room/hooks/useSyncedUrl";
import { UserPresence } from "@features/room/ui/UserPresence";
import { EditableUrl } from "./EditableUrl";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { url, setUrl } = useSyncedUrl();

  return (
    <header className="h-16 px-6 glass flex items-center relative z-10">
      <h1 className="text-sm font-semibold tracking-tight text-text-primary">
        {title}
      </h1>

      {url && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <div className="glass rounded-glass px-5 py-1.5 w-[380px] glass-hover transition-all">
            <EditableUrl url={url} onUrlChange={setUrl} />
          </div>
        </div>
      )}

      <div className="ml-auto">
        <UserPresence />
      </div>
    </header>
  );
}
