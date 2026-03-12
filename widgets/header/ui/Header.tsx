"use client";

import { useState } from "react";
import Link from "next/link";
import { useSyncedUrl } from "@features/workspace/hooks/useSyncedUrl";
import { UserPresence } from "@features/workspace/ui/UserPresence";
import { InviteButton } from "@features/workspace/ui/InviteButton";
import { ConnectionStatus } from "@features/workspace/ui/ConnectionStatus";
import { RenameWorkspaceModal } from "@features/workspace/ui/RenameWorkspaceModal";
import { UserMenu } from "@features/auth";
import { useWorkspaceStore } from "@features/workspace/model/store";
import { WORKSPACE_ROLES } from "@shared/constants";
import { EditableUrl } from "./EditableUrl";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { url, setUrl } = useSyncedUrl();
  const { workspaceName, currentUser, syncRenameWorkspace } =
    useWorkspaceStore();
  const [showRename, setShowRename] = useState(false);
  const isOwner = currentUser?.role === WORKSPACE_ROLES.OWNER;

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
      {workspaceName &&
        (isOwner ? (
          <button
            onClick={() => setShowRename(true)}
            className="ml-3 text-sm text-text-secondary truncate max-w-[200px] hover:text-text-primary transition-colors cursor-pointer"
            title="이름 변경"
          >
            {workspaceName}
          </button>
        ) : (
          <span className="ml-3 text-sm text-text-secondary truncate max-w-[200px]">
            {workspaceName}
          </span>
        ))}

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
      {showRename && workspaceName && (
        <RenameWorkspaceModal
          currentName={workspaceName}
          onSubmit={syncRenameWorkspace}
          onClose={() => setShowRename(false)}
        />
      )}
    </header>
  );
}
