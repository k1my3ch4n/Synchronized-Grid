"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import Image from "next/image";

interface InviteInfo {
  workspaceName: string;
  memberCount: number;
  inviterName: string | null;
  inviterImage: string | null;
}

export default function InvitePage() {
  const { code } = useParams<{ code: string }>();
  const { status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [joining, setJoining] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("google", { callbackUrl: `/invite/${code}` });
      return;
    }

    if (status === "authenticated" && !fetchedRef.current) {
      fetchedRef.current = true;

      (async () => {
        try {
          const res = await fetch(`/api/invite/${code}`);
          const data = await res.json();

          if (!res.ok) {
            setError(data.error || "초대 정보를 불러올 수 없습니다");
            return;
          }

          setInviteInfo(data);
        } catch {
          setError("초대 정보를 불러올 수 없습니다");
        }
      })();
    }
  }, [status, code]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await fetch(`/api/invite/${code}`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "초대 수락에 실패했습니다");
        setJoining(false);
        return;
      }

      if (data.workspaceId) {
        router.replace(`/workspace/${data.workspaceId}`);
      } else {
        router.replace("/workspaces");
      }
    } catch {
      setError("초대 수락에 실패했습니다");
      setJoining(false);
    }
  };

  if (error) {
    return (
      <main className="page-height flex flex-col items-center justify-center gap-4">
        <div className="glass rounded-2xl p-8 w-full max-w-sm text-center space-y-4">
          <span className="text-3xl">😔</span>
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => router.push("/workspaces")}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            워크스페이스 목록으로
          </button>
        </div>
      </main>
    );
  }

  if (!inviteInfo) {
    return (
      <main className="page-height flex flex-col items-center justify-center gap-3">
        <div className="loading-spinner" />
        <p className="text-sm text-text-secondary">
          초대 정보를 불러오는 중...
        </p>
      </main>
    );
  }

  return (
    <main className="page-height flex flex-col items-center justify-center gap-4">
      <div className="glass rounded-2xl p-8 w-full max-w-sm text-center space-y-6 animate-fade-in-up">
        <div className="space-y-2">
          <span className="text-4xl">✉️</span>
          <h2 className="text-lg font-semibold text-text-primary">
            워크스페이스 초대
          </h2>
        </div>

        <div className="glass-surface rounded-glass p-4 space-y-3">
          <p className="text-xl font-bold text-text-primary">
            {inviteInfo.workspaceName}
          </p>
          <p className="text-xs text-text-muted">
            멤버 {inviteInfo.memberCount}명
          </p>
        </div>

        {inviteInfo.inviterName && (
          <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
            {inviteInfo.inviterImage && (
              <Image
                src={inviteInfo.inviterImage}
                alt={inviteInfo.inviterName}
                width={20}
                height={20}
                className="rounded-full"
              />
            )}
            <span>
              <strong className="text-text-primary">
                {inviteInfo.inviterName}
              </strong>
              님이 초대했습니다
            </span>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={handleJoin}
            disabled={joining}
            className="glass-btn px-6 py-2.5 text-sm rounded-glass disabled:opacity-50"
          >
            {joining ? "참여 중..." : "참여하기"}
          </button>
          <button
            onClick={() => router.push("/workspaces")}
            className="text-sm text-text-muted hover:text-text-primary transition-colors py-1"
          >
            돌아가기
          </button>
        </div>
      </div>
    </main>
  );
}
