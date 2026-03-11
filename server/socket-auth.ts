import { Server as SocketIOServer } from "socket.io";
import { decode } from "next-auth/jwt";
import { parse as parseCookie } from "cookie";

export interface SocketUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export function setupSocketAuth(io: SocketIOServer) {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error(
      "[socket-auth] NEXTAUTH_SECRET is not set. Socket authentication cannot be initialized.",
    );
  }

  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;

      if (!cookieHeader) {
        return next(new Error("인증이 필요합니다"));
      }

      const cookies = parseCookie(cookieHeader);

      // NextAuth v5는 dev에서 authjs.session-token, prod에서 __Secure-authjs.session-token 사용
      const isSecure = process.env.NODE_ENV === "production";
      const cookieName = isSecure
        ? "__Secure-authjs.session-token"
        : "authjs.session-token";
      const token = cookies[cookieName];

      if (!token) {
        return next(new Error("세션 토큰이 없습니다"));
      }

      // NextAuth의 decode로 JWE 암호화 토큰 복호화
      const payload = await decode({
        token,
        secret,
        salt: cookieName,
      });

      if (!payload) {
        return next(new Error("토큰 복호화 실패"));
      }

      (socket.data as Record<string, unknown>).user = {
        id: (payload.sub ?? payload.id) as string,
        name: (payload.name as string) ?? "사용자",
        email: (payload.email as string) ?? "",
        image: (payload.picture as string) ?? null,
      };

      next();
    } catch (err) {
      console.error("[socket-auth] Authentication failed:", err);
      next(new Error("인증 실패"));
    }
  });
}
