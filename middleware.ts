import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge Runtime에서는 복잡한 JWT 검증을 하지 않고,
// 토큰 존재 여부만 확인합니다.
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Get token from cookie
  const token = request.cookies.get("token")?.value;

  console.log("Middleware - Path:", path);
  console.log("Middleware - Token exists:", !!token);

  // Admin routes require token (실제 역할 검증은 서버 컴포넌트에서)
  if (path.startsWith("/admin")) {
    if (!token) {
      console.log("Middleware - No token, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    console.log("Middleware - Token found, allowing access");
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
