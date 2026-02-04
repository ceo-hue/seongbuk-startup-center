/**
 * Calendar Event Detail API - HOVCS 2.0 Conservative Core 적용
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { withErrorHandler } from "@/lib/core/error/error-handler";
import { ApiError } from "@/lib/core/communication/api-error";
import { logWarning } from "@/lib/core/error/error-logger";
import { logDataUpdate, logDataDelete } from "@/lib/core/audit/audit-logger";

// PATCH: 일정 수정 (관리자 전용)
export const PATCH = withErrorHandler(async (
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

  if (!isAdmin(user.role as any)) {
    await logWarning('캘린더 일정 수정 거부 - 권한 부족', { userId: user.userId, role: user.role });
    return NextResponse.json(
      { error: "관리자 권한이 필요합니다." },
      { status: 403 }
    );
  }

  const { id: idString } = await params;
  const id = parseInt(idString);

  if (isNaN(id)) {
    return ApiError.validation('올바른 ID 형식이 아닙니다');
  }

  const body = await request.json();

  const updateData: any = {};

  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
  if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null;
  if (body.location !== undefined) updateData.location = body.location;
  if (body.category !== undefined) updateData.category = body.category;
  if (body.maxParticipants !== undefined) updateData.maxParticipants = body.maxParticipants;

  const event = await prisma.calendarEvent.update({
    where: { id },
    data: updateData,
  });

  // 감사 로그 기록
  await logDataUpdate('CalendarEvent', event.id, user.userId, user.name, {
    updatedFields: Object.keys(updateData)
  });

  return NextResponse.json(event);
});

// DELETE: 일정 삭제 (관리자 전용)
export const DELETE = withErrorHandler(async (
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

  if (!isAdmin(user.role as any)) {
    await logWarning('캘린더 일정 삭제 거부 - 권한 부족', { userId: user.userId, role: user.role });
    return NextResponse.json(
      { error: "관리자 권한이 필요합니다." },
      { status: 403 }
    );
  }

  const { id: idString } = await params;
  const id = parseInt(idString);

  if (isNaN(id)) {
    return ApiError.validation('올바른 ID 형식이 아닙니다');
  }

  await prisma.calendarEvent.delete({
    where: { id },
  });

  // 감사 로그 기록
  await logDataDelete('CalendarEvent', id, user.userId, user.name);

  return NextResponse.json({ message: "일정이 삭제되었습니다." });
});
