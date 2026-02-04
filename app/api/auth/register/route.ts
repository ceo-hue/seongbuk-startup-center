/**
 * Register API - HOVCS 2.0 Conservative Core 적용
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { withErrorHandler } from "@/lib/core/error/error-handler";
import { ApiError } from "@/lib/core/communication/api-error";
import { logInfo, logWarning } from "@/lib/core/error/error-logger";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const { email, password, name } = await request.json();

  // Validate required fields (개발 환경에서는 경고만)
  if (process.env.NODE_ENV === 'production') {
    if (!email || !password || !name) {
      return ApiError.validation("이메일, 비밀번호, 이름은 필수 항목입니다.");
    }
  } else if (!email || !password || !name) {
    await logWarning('개발 모드 - 회원가입 필수 필드 누락', { email: !!email, password: !!password, name: !!name });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    return NextResponse.json(
      { error: "올바른 이메일 형식이 아닙니다." },
      { status: 400 }
    );
  }

  // Validate password strength (minimum 6 characters)
  if (password && password.length < 6) {
    return NextResponse.json(
      { error: "비밀번호는 최소 6자 이상이어야 합니다." },
      { status: 400 }
    );
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    await logWarning('회원가입 실패 - 중복 이메일', { email });
    return NextResponse.json(
      { error: "이미 등록된 이메일입니다." },
      { status: 409 }
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user with default USER role
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: "USER",
      isVerified: false,
    },
  });

  // 보안 감사 로그
  await logInfo('회원가입 성공', {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });

  // Return user data without password
  return NextResponse.json(
    {
      message: "회원가입이 완료되었습니다. 관리자 승인을 기다려주세요.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
    },
    { status: 201 }
  );
});
