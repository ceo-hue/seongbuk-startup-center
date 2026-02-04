/**
 * Calendar Events API - HOVCS 2.0 Conservative Core 적용
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { isMemberCompany, isAdmin } from "@/lib/permissions";
import { withErrorHandler } from "@/lib/core/error/error-handler";
import { logInfo, logWarning } from "@/lib/core/error/error-logger";
import { logDataCreate } from "@/lib/core/audit/audit-logger";

// GET: 캘린더 일정 조회 (정회원 전용)
export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  // 정회원(입주기업+졸업기업) 또는 관리자만 접근 가능
  if (!isMemberCompany(user.role as any) && !isAdmin(user.role as any)) {
    await logWarning('캘린더 접근 거부 - 권한 부족', { userId: user.userId, role: user.role });
    return NextResponse.json(
      { error: "정회원만 이용 가능합니다." },
      { status: 403 }
    );
  }

  const events = await prisma.calendarEvent.findMany({
    include: {
      participations: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true,
            },
          },
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      startDate: "desc",
    },
  });

  await logInfo('캘린더 일정 조회', { userId: user.userId, count: events.length });

  return NextResponse.json(events);
});

// POST: 새 일정 생성 (관리자 전용)
export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  if (!isAdmin(user.role as any)) {
    await logWarning('캘린더 일정 생성 거부 - 권한 부족', { userId: user.userId, role: user.role });
    return NextResponse.json(
      { error: "관리자 권한이 필요합니다." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const {
    title,
    description,
    startDate,
    endDate,
    location,
    category,
    maxParticipants,
  } = body;

  // 개발 환경에서는 검증 완화
  if (process.env.NODE_ENV === 'production') {
    if (!title || !startDate) {
      return NextResponse.json(
        { error: "제목과 시작일은 필수입니다." },
        { status: 400 }
      );
    }
  } else if (!title || !startDate) {
    await logWarning('개발 모드 - 캘린더 일정 필수 필드 누락', { title: !!title, startDate: !!startDate });
  }

  const event = await prisma.calendarEvent.create({
    data: {
      title,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      location,
      category,
      maxParticipants,
      createdBy: user.name,
    },
  });

  // 감사 로그 기록
  await logDataCreate('CalendarEvent', event.id, user.userId, user.name, {
    title: event.title,
    startDate: event.startDate
  });

  return NextResponse.json(event, { status: 201 });
});
