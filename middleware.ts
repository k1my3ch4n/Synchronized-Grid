import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 공개 경로
  const isPublicPath =
    pathname === "/login" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico";

  // 초대 링크는 미인증 사용자도 볼 수 있어야 함
  const isInvitePath = pathname.startsWith("/invite/");

  if (isPublicPath || isInvitePath) {
    return NextResponse.next();
  }

  // JWT 토큰 확인 (쿠키에서)
  const token =
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("authjs.session-token")?.value;

  let isLoggedIn = false;

  if (token && process.env.NEXTAUTH_SECRET) {
    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
      await jwtVerify(token, secret);
      isLoggedIn = true;
    } catch {
      // 토큰 만료 또는 유효하지 않음
    }
  }

  // 미인증 사용자 → 로그인
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
