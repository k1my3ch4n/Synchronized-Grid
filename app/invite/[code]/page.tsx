"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";

export default function InvitePage() {
  const { code } = useParams<{ code: string }>();
  const { status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const joiningRef = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("google", { callbackUrl: `/invite/${code}` });
      return;
    }

    if (status === "authenticated" && !joiningRef.current) {
      joiningRef.current = true;

      (async () => {
        try {
          const res = await fetch(`/api/invite/${code}`, { method: "POST" });
          const data = await res.json();

          if (!res.ok) {
            setError(data.error || "초대 수락에 실패했습니다");
            return;
          }

          if (data.defaultRoomId) {
            router.replace(`/room/${data.defaultRoomId}`);
          } else {
            router.replace("/workspaces");
          }
        } catch {
          setError("초대 수락에 실패했습니다");
        }
      })();
    }
  }, [status, code, router]);

  if (error) {
    return (
      <main className="page-height flex flex-col items-center justify-center gap-4">
        <div className="glass rounded-2xl p-8 w-full max-w-sm text-center space-y-4">
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

  return (
    <main className="page-height flex flex-col items-center justify-center gap-3">
      <div className="loading-spinner" />
      <p className="text-sm text-text-secondary">초대를 수락하는 중...</p>
    </main>
  );
}
