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
import { ExternalLinks } from "@shared/ui/ExternalLinks";
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
      {workspaceName && (
        <>
          <span className="ml-2 text-text-muted">/</span>
          {isOwner ? (
            <button
              onClick={() => setShowRename(true)}
              className="ml-2 flex items-center gap-1.5 text-sm font-medium text-text-primary truncate max-w-[200px] hover:text-accent transition-colors cursor-pointer group"
              title="이름 변경"
            >
              {workspaceName}
              <svg
                className="w-3 h-3 text-text-muted group-hover:text-accent transition-colors flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                />
              </svg>
            </button>
          ) : (
            <span className="ml-2 text-sm font-medium text-text-primary truncate max-w-[200px]">
              {workspaceName}
            </span>
          )}
        </>
      )}

      {url && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <div className="glass rounded-glass px-5 py-1.5 w-[90vw] max-w-[380px] glass-hover transition-all">
            <EditableUrl url={url} onUrlChange={setUrl} />
          </div>
        </div>
      )}

      <div className="ml-auto flex items-center gap-3">
        {workspaceName ? (
          <>
            <ConnectionStatus />
            <InviteButton />
            <UserPresence />
          </>
        ) : (
          <ExternalLinks />
        )}
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
