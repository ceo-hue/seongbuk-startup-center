/**
 * Event Participation API - HOVCS 2.0 Conservative Core 적용
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { isMemberCompany, isAdmin } from "@/lib/permissions";
import { withErrorHandler } from "@/lib/core/error/error-handler";
import { ApiError } from "@/lib/core/communication/api-error";
import { logInfo, logWarning } from "@/lib/core/error/error-logger";

// POST: 참여 여부 업데이트 (정회원 전용)
export const POST = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  // 정회원 또는 관리자만 접근 가능
  if (!isMemberCompany(user.role as any) && !isAdmin(user.role as any)) {
    await logWarning('일정 참여 거부 - 권한 부족', { userId: user.userId, role: user.role });
    return NextResponse.json(
      { error: "정회원만 이용 가능합니다." },
      { status: 403 }
    );
  }

  const { id: idString } = await params;
  const eventId = parseInt(idString);

  if (isNaN(eventId)) {
    return ApiError.validation('올바른 ID 형식이 아닙니다');
  }

  const body = await request.json();
  const { status } = body;

  if (!status || !["PENDING", "ATTENDING", "NOT_ATTENDING"].includes(status)) {
    return NextResponse.json(
      { error: "유효한 참여 상태를 입력해주세요." },
      { status: 400 }
    );
  }

  // 이미 참여 레코드가 있는지 확인
  const existing = await prisma.eventParticipation.findUnique({
    where: {
      eventId_userId: {
        eventId,
        userId: user.userId,
      },
    },
  });

  let participation;

  if (existing) {
    // 업데이트
    participation = await prisma.eventParticipation.update({
      where: {
        eventId_userId: {
          eventId,
          userId: user.userId,
        },
      },
      data: { status },
    });
    await logInfo('일정 참여 상태 업데이트', { eventId, userId: user.userId, status });
  } else {
    // 생성
    participation = await prisma.eventParticipation.create({
      data: {
        eventId,
        userId: user.userId,
        status,
      },
    });
    await logInfo('일정 참여 등록', { eventId, userId: user.userId, status });
  }

  return NextResponse.json(participation);
});
