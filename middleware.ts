import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 공개 경로 (인증 불필요)
  const isPublicPath =
    pathname === "/login" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico";

  // 초대 링크는 미인증 사용자도 볼 수 있어야 함
  const isInvitePath = pathname.startsWith("/invite/");

  if (isPublicPath || isInvitePath) {
    return NextResponse.next();
  }

  // NextAuth의 getToken으로 JWT 복호화 (NextAuth v5는 JWE 암호화 사용)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;

  // 미인증 API 요청 → 401 반환
  if (!isLoggedIn && pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 미인증 페이지 요청 → 로그인 리다이렉트
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 루트 → 워크스페이스
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/workspaces", req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
