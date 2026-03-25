"use client";

import Link from "next/link";
import { useSyncedUrl } from "@features/workspace/hooks/useSyncedUrl";
import { UserPresence } from "@features/workspace/ui/UserPresence";
import { InviteButton } from "@features/workspace/ui/InviteButton";
import { ConnectionStatus } from "@features/workspace/ui/ConnectionStatus";
import { UserMenu } from "@features/auth";
import { useWorkspaceStore } from "@features/workspace/model/store";
import { WORKSPACE_ROLES, WORKSPACE_NAME_MAX_LENGTH } from "@shared/constants";
import { useEditableValue } from "@shared/hooks/useEditableValue";
import { ExternalLinks } from "@shared/ui/ExternalLinks";
import { PencilIcon } from "@shared/ui/icons/PencilIcon";
import { EditableUrl } from "./EditableUrl";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { url, setUrl } = useSyncedUrl();
  const { workspaceName, currentUser, syncRenameWorkspace } =
    useWorkspaceStore();
  const isOwner = currentUser?.role === WORKSPACE_ROLES.OWNER;

  const rename = useEditableValue(workspaceName ?? "", (name) => {
    if (name !== workspaceName) {
      syncRenameWorkspace(name);
    }
  });

  return (
    <header className="h-16 px-6 glass flex items-center relative z-10">
      <div className="flex items-center min-w-0 max-w-[28vw] shrink-0">
        <Link
          href="/workspaces"
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0"
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
            <span className="ml-2 sm:ml-4 mr-1 text-text-muted shrink-0">
              /
            </span>
            {isOwner ? (
              rename.isEditing ? (
                <input
                  type="text"
                  value={rename.inputValue}
                  onChange={(e) => rename.setInputValue(e.target.value)}
                  onBlur={rename.submit}
                  onKeyDown={rename.handleKeyDown}
                  maxLength={WORKSPACE_NAME_MAX_LENGTH}
                  autoFocus
                  className="glass-surface text-sm font-medium text-text-primary focus:outline-none focus:border-accent rounded-glass px-3 py-1 min-w-0 w-full"
                />
              ) : (
                <button
                  onClick={rename.startEditing}
                  className="flex items-center gap-1.5 text-sm font-medium text-text-primary truncate hover:text-accent transition-colors group rounded-glass px-3 py-1 border border-transparent min-w-0"
                  title="이름 변경"
                >
                  <span className="truncate">{workspaceName}</span>
                  <PencilIcon className="w-3 h-3 text-text-muted group-hover:text-accent transition-colors flex-shrink-0" />
                </button>
              )
            ) : (
              <span className="text-sm font-medium text-text-primary truncate px-3 py-1 min-w-0">
                {workspaceName}
              </span>
            )}
          </>
        )}
      </div>

      {url && (
        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <div className="glass rounded-glass px-5 h-10 flex items-center w-[40vw] max-w-[380px] glass-hover transition-all has-[:focus]:ring-2 has-[:focus]:ring-accent">
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
    </header>
  );
}
