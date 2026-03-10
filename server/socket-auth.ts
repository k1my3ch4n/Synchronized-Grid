import { Server as SocketIOServer } from "socket.io";
import { jwtVerify } from "jose";
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
    console.warn(
      "[socket-auth] NEXTAUTH_SECRET not set, socket auth disabled",
    );
    return;
  }

  const encodedSecret = new TextEncoder().encode(secret);

  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;

      if (!cookieHeader) {
        return next(new Error("인증이 필요합니다"));
      }

      const cookies = parseCookie(cookieHeader);

      // NextAuth uses different cookie names in dev vs prod
      const token =
        cookies["__Secure-authjs.session-token"] ||
        cookies["authjs.session-token"] ||
        cookies["__Secure-next-auth.session-token"] ||
        cookies["next-auth.session-token"];

      if (!token) {
        return next(new Error("세션 토큰이 없습니다"));
      }

      const { payload } = await jwtVerify(token, encodedSecret, {
        algorithms: ["HS256"],
      });

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
