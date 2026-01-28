/**
 * Event Comments API - HOVCS 2.0 Conservative Core 적용
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { isMemberCompany, isAdmin } from "@/lib/permissions";
import { withErrorHandler } from "@/lib/core/error/error-handler";
import { ApiError } from "@/lib/core/communication/api-error";
import { logInfo, logWarning } from "@/lib/core/error/error-logger";

// POST: 댓글 작성 (정회원 전용)
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
    await logWarning('일정 댓글 작성 거부 - 권한 부족', { userId: user.userId, role: user.role });
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
  const { content } = body;

  // 개발 환경에서는 검증 완화
  if (process.env.NODE_ENV === 'production') {
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "댓글 내용을 입력해주세요." },
        { status: 400 }
      );
    }
  } else if (!content || !content.trim()) {
    await logWarning('개발 모드 - 댓글 내용 누락', { eventId, userId: user.userId });
  }

  const comment = await prisma.eventComment.create({
    data: {
      eventId,
      userId: user.userId,
      content,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  await logInfo('일정 댓글 작성', { eventId, commentId: comment.id, userId: user.userId });

  return NextResponse.json(comment, { status: 201 });
});
