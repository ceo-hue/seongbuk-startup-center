/**
 * Logout API - HOVCS 2.0 Conservative Core 적용
 */

import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/core/error/error-handler";
import { logInfo } from "@/lib/core/error/error-logger";
import { getUserFromRequest } from "@/lib/auth";

export const POST = withErrorHandler(async (request: NextRequest) => {
  // 로그아웃 전 사용자 정보 기록
  const user = getUserFromRequest(request);

  const response = NextResponse.json(
    { message: "로그아웃 성공" },
    { status: 200 }
  );

  // Clear the token cookie
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // Expire immediately
    path: "/",
  });

  // 보안 감사 로그
  await logInfo('로그아웃 성공', {
    userId: user?.userId,
    email: user?.email
  });

  return response;
});
