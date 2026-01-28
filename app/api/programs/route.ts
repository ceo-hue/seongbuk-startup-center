/**
 * Programs API - HOVCS 2.0 Conservative Core 적용
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { canAccessContent, type Visibility, type UserRole } from "@/lib/permissions";
import { withErrorHandler } from "@/lib/core/error/error-handler";
import { validateRequired } from "@/lib/core/security/validation";
import { logInfo } from "@/lib/core/error/error-logger";
import { logDataCreate } from "@/lib/core/audit/audit-logger";

// GET: 모든 프로그램 조회 (권한별 필터링)
export const GET = withErrorHandler(async (request: NextRequest) => {
  // 사용자 정보 가져오기 (로그인 안 되어 있으면 null)
  const user = getUserFromRequest(request);
  const userRole = user?.role as UserRole | null;

  // 모든 프로그램 조회
  const programs = await prisma.program.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  // 사용자 권한에 따라 필터링
  const filteredPrograms = programs.filter(program => {
    const visibility = program.visibility as Visibility;
    return canAccessContent(userRole, visibility);
  });

  await logInfo('Programs fetched', {
    count: filteredPrograms.length,
    userRole: userRole || 'anonymous'
  });

  return NextResponse.json(filteredPrograms);
});

// POST: 새 프로그램 생성
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const {
    title,
    desc,
    gradient,
    visibility = "PUBLIC",
    category,
    startDate,
    endDate,
    capacity,
    location,
    instructor,
    images
  } = body;

  // 개발 환경에서는 검증 완화
  if (process.env.NODE_ENV === 'production') {
    validateRequired(body, ['title', 'desc', 'gradient']);
  } else if (!title || !desc || !gradient) {
    await logInfo('개발 모드 - 필수 필드 누락 경고', { body });
  }

  const program = await prisma.program.create({
    data: {
      title,
      desc,
      gradient,
      visibility,
      category,
      startDate,
      endDate,
      capacity,
      location,
      instructor,
      images
    },
  });

  // 감사 로그 기록
  const user = getUserFromRequest(request);
  await logDataCreate('Program', program.id, user?.userId, user?.name, {
    title: program.title,
    category: program.category
  });

  return NextResponse.json(program, { status: 201 });
});
