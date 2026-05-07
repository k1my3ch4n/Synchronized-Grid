import { NextRequest, NextResponse } from "next/server";

const CANONICAL_HOST = "syngrid.k1my3ch4n.xyz";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  if (host !== CANONICAL_HOST && host.endsWith(".run.app")) {
    const url = request.nextUrl.clone();
    url.host = CANONICAL_HOST;
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
