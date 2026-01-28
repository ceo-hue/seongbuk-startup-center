/**
 * Notice Detail API - HOVCS 2.0 Conservative Core 적용
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/core/error/error-handler";
import { ApiError } from "@/lib/core/communication/api-error";
import { logDataUpdate, logDataDelete } from "@/lib/core/audit/audit-logger";
import { getUserFromRequest } from "@/lib/auth";

// GET: 특정 공지사항 조회 (조회수 증가)
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id: idString } = await params;
  const id = parseInt(idString);

  if (isNaN(id)) {
    return ApiError.validation('올바른 ID 형식이 아닙니다');
  }

  // 조회수 증가
  const notice = await prisma.notice.update({
    where: { id },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  // JSON 필드 파싱
  const parsedNotice = {
    ...notice,
    images: notice.images ? JSON.parse(notice.images) : [],
    files: notice.files ? JSON.parse(notice.files) : [],
  };

  return NextResponse.json(parsedNotice);
});

// PATCH: 공지사항 수정
export const PATCH = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id: idString } = await params;
  const id = parseInt(idString);

  if (isNaN(id)) {
    return ApiError.validation('올바른 ID 형식이 아닙니다');
  }

  const body = await request.json();

  // images, files 필드는 JSON 문자열로 변환
  const updateData: any = { ...body };
  if (body.images) {
    updateData.images = Array.isArray(body.images) && body.images.length > 0
      ? JSON.stringify(body.images)
      : null;
  }
  if (body.files) {
    updateData.files = Array.isArray(body.files) && body.files.length > 0
      ? JSON.stringify(body.files)
      : null;
  }

  const notice = await prisma.notice.update({
    where: { id },
    data: updateData,
  });

  // 감사 로그 기록
  const user = getUserFromRequest(request);
  await logDataUpdate('Notice', notice.id, user?.userId, user?.name, {
    updatedFields: Object.keys(body)
  });

  return NextResponse.json(notice);
});

// DELETE: 공지사항 삭제
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id: idString } = await params;
  const id = parseInt(idString);

  if (isNaN(id)) {
    return ApiError.validation('올바른 ID 형식이 아닙니다');
  }

  await prisma.notice.delete({
    where: { id },
  });

  // 감사 로그 기록
  const user = getUserFromRequest(request);
  await logDataDelete('Notice', id, user?.userId, user?.name);

  return NextResponse.json({ message: "공지사항이 삭제되었습니다." });
});
