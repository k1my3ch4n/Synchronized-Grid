"use client";

import Link from "next/link";
import { useSyncedUrl } from "@features/workspace/hooks/useSyncedUrl";
import { UserPresence } from "@features/workspace/ui/UserPresence";
import { InviteButton } from "@features/workspace/ui/InviteButton";
import { ConnectionStatus } from "@features/workspace/ui/ConnectionStatus";
import { UserMenu } from "@features/auth";
import { useWorkspaceStore } from "@features/workspace/model/store";
import { EditableUrl } from "./EditableUrl";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { url, setUrl } = useSyncedUrl();
  const workspaceName = useWorkspaceStore((s) => s.workspaceName);

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
      {workspaceName && (
        <span className="ml-3 text-sm text-text-secondary truncate max-w-[200px]">
          {workspaceName}
        </span>
      )}

      {url && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <div className="glass rounded-glass px-5 py-1.5 w-[90vw] max-w-[380px] glass-hover transition-all">
            <EditableUrl url={url} onUrlChange={setUrl} />
          </div>
        </div>
      )}

      <div className="ml-auto flex items-center gap-3">
        <ConnectionStatus />
        <InviteButton />
        <UserPresence />
        <UserMenu />
      </div>
    </header>
  );
}
