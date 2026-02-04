import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Edge Middleware
 *
 * Edge Runtime에서는 복잡한 JWT 검증을 하지 않고,
 * 토큰 존재 여부만 확인합니다.
 * 실제 역할 검증은 서버 컴포넌트/API 라우트에서 수행합니다.
 *
 * 보호되는 경로:
 * - /admin/* : 관리자 페이지 (토큰 필수)
 * - /mypage/* : 마이페이지 (토큰 필수)
 */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;

  // 보호된 경로 목록
  const protectedPaths = ["/admin", "/mypage"];
  const isProtectedPath = protectedPaths.some((p) => path.startsWith(p));

  // 보호된 경로에 토큰 없이 접근 시 로그인 페이지로 리다이렉트
  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
};
