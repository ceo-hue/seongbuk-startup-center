/**
 * Partner Detail API - HOVCS 2.0 Conservative Core 적용
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/core/error/error-handler";
import { ApiError } from "@/lib/core/communication/api-error";
import { logDataUpdate, logDataDelete } from "@/lib/core/audit/audit-logger";
import { getUserFromRequest } from "@/lib/auth";

// PATCH: 협력기관 수정
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

  const partner = await prisma.partner.update({
    where: { id },
    data: body,
  });

  // 감사 로그 기록
  const user = getUserFromRequest(request);
  await logDataUpdate('Partner', partner.id, user?.userId, user?.name, {
    updatedFields: Object.keys(body)
  });

  return NextResponse.json(partner);
});

// DELETE: 협력기관 삭제
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id: idString } = await params;
  const id = parseInt(idString);

  if (isNaN(id)) {
    return ApiError.validation('올바른 ID 형식이 아닙니다');
  }

  await prisma.partner.delete({
    where: { id },
  });

  // 감사 로그 기록
  const user = getUserFromRequest(request);
  await logDataDelete('Partner', id, user?.userId, user?.name);

  return NextResponse.json({ message: "협력기관이 삭제되었습니다." });
});
