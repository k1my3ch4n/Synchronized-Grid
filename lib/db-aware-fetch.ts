"use client";

import { toast } from "sonner";

const WARMING_THRESHOLD_MS = 1500;
const RETRY_THRESHOLD_MS = 10000;
const TOAST_ID = "db-status";

export async function dbAwareFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const warmingTimer = setTimeout(() => {
    toast.loading("데이터베이스에 연결 중입니다...", { id: TOAST_ID });
  }, WARMING_THRESHOLD_MS);

  const retryTimer = setTimeout(() => {
    toast("응답이 너무 오래 걸리고 있습니다.", {
      id: TOAST_ID,
      duration: Infinity,
      action: {
        label: "새로고침",
        onClick: () => window.location.reload(),
      },
    });
  }, RETRY_THRESHOLD_MS);

  try {
    const res = await fetch(input, init);
    clearTimeout(warmingTimer);
    clearTimeout(retryTimer);
    toast.dismiss(TOAST_ID);

    if (res.status === 503) {
      const data = await res.clone().json().catch(() => ({}));
      if (data.code === "QUOTA_EXCEEDED") {
        toast.error(
          "Neon 무료 플랜 한도를 초과했습니다. neon.tech에서 확인해주세요.",
          { id: TOAST_ID, duration: Infinity }
        );
      }
    }

    return res;
  } catch (e) {
    clearTimeout(warmingTimer);
    clearTimeout(retryTimer);
    toast.dismiss(TOAST_ID);
    throw e;
  }
}
