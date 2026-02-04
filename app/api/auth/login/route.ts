/**
 * Login API - HOVCS 2.0 Conservative Core 적용
 *
 * 보안 강화:
 * - JWT_SECRET 환경변수 필수 검증
 * - 프로덕션 환경에서 32자 이상 비밀키 강제
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { withErrorHandler } from "@/lib/core/error/error-handler";
import { ApiError } from "@/lib/core/communication/api-error";
import { logInfo, logWarning, logError } from "@/lib/core/error/error-logger";

/**
 * JWT_SECRET 환경변수 검증
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.trim() === "") {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[SECURITY] JWT_SECRET 환경변수가 설정되지 않았습니다."
      );
    }
    return "dev-only-insecure-secret-key-do-not-use-in-production";
  }

  if (secret.length < 32 && process.env.NODE_ENV === "production") {
    throw new Error("[SECURITY] JWT_SECRET은 최소 32자 이상이어야 합니다.");
  }

  return secret;
}

const JWT_SECRET = getJwtSecret();

export const POST = withErrorHandler(async (request: NextRequest) => {
  const { email, password } = await request.json();

  // Validate required fields (개발 환경에서는 경고만)
  if (process.env.NODE_ENV === 'production') {
    if (!email || !password) {
      return ApiError.validation("이메일과 비밀번호를 입력해주세요.");
    }
  } else if (!email || !password) {
    await logWarning('개발 모드 - 로그인 필수 필드 누락', { email: !!email, password: !!password });
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    await logWarning('로그인 실패 - 사용자 없음', { email });
    return NextResponse.json(
      { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    await logWarning('로그인 실패 - 비밀번호 불일치', { userId: user.id, email });
    return NextResponse.json(
      { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "7d", // Token expires in 7 days
    }
  );

  // Create response with token in cookie
  const response = NextResponse.json(
    {
      message: "로그인 성공",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
    },
    { status: 200 }
  );

  // Set HTTP-only cookie for middleware authentication
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  // 보안 감사 로그
  await logInfo('로그인 성공', {
    userId: user.id,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified
  });

  return response;
});
