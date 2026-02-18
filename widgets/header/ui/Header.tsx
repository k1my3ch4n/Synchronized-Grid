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
    <header className="h-16 px-4 bg-win98-gray win98-raised flex items-center relative">
      <h1 className="text-sm font-bold">{title}</h1>

      {url && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <div className="bg-white win98-sunken px-4 py-1.5 w-[350px]">
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
