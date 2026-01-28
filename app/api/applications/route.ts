/**
 * Applications API - HOVCS 2.0 Conservative Core 적용
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { logInfo, logWarning, logError } from "@/lib/core/error/error-logger";
import { logDataCreate } from "@/lib/core/audit/audit-logger";

// GET: 신청 목록 조회
export async function GET(request: NextRequest) {
  try {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  // 관리자는 모든 신청 조회, 일반 사용자는 본인 신청만 조회
  const applications = await prisma.application.findMany({
    where: user.role === "ADMIN" ? {} : { userId: user.userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          company: true,
          phone: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  await logInfo('신청 목록 조회', {
    userId: user.userId,
    role: user.role,
    count: applications.length
  });

  return NextResponse.json(applications);
  } catch (error) {
    await logError(error, { route: '/api/applications', method: 'GET' });
    return NextResponse.json(
      { error: "신청 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// POST: 새 신청 생성
export async function POST(request: NextRequest) {
  try {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { programId, programTitle, message } = body;

  // 개발 환경에서는 검증 완화
  if (process.env.NODE_ENV === 'production') {
    if (!programTitle) {
      return NextResponse.json(
        { error: "프로그램 제목은 필수입니다." },
        { status: 400 }
      );
    }
  } else if (!programTitle) {
    await logWarning('개발 모드 - 신청 필수 필드 누락', { programTitle: !!programTitle });
  }

  const application = await prisma.application.create({
    data: {
      userId: user.userId,
      programId,
      programTitle,
      message,
    },
  });

  // 감사 로그 기록
  await logDataCreate('Application', application.id, user.userId, user.name, {
    programTitle: application.programTitle,
    programId: application.programId
  });

  return NextResponse.json(application, { status: 201 });
  } catch (error) {
    await logError(error, { route: '/api/applications', method: 'POST' });
    return NextResponse.json(
      { error: "신청 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
