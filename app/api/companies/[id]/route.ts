/**
 * Company Detail API - HOVCS 2.0 Conservative Core 적용
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/core/error/error-handler";
import { ApiError } from "@/lib/core/communication/api-error";
import { logInfo } from "@/lib/core/error/error-logger";
import { logDataUpdate, logDataDelete } from "@/lib/core/audit/audit-logger";
import { getUserFromRequest } from "@/lib/auth";

// GET: 특정 입주기업 조회
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id: idString } = await params;
  const id = parseInt(idString);

  if (isNaN(id)) {
    return ApiError.validation('올바른 ID 형식이 아닙니다');
  }

  const company = await prisma.company.findUnique({
    where: { id },
  });

  if (!company) {
    return NextResponse.json(
      { error: "기업을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  const parsedCompany = {
    ...company,
    achievements: company.achievements
      ? JSON.parse(company.achievements)
      : null,
    images: company.images ? JSON.parse(company.images) : [],
  };

  await logInfo('Company fetched by ID', { companyId: id });

  return NextResponse.json(parsedCompany);
});

// PATCH: 입주기업 수정
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

  // JSON 필드 처리
  const updateData: any = { ...body };
  if (body.achievements && Array.isArray(body.achievements)) {
    updateData.achievements = JSON.stringify(body.achievements);
  }
  if (body.images !== undefined) {
    updateData.images = Array.isArray(body.images) && body.images.length > 0
      ? JSON.stringify(body.images)
      : null;
  }

  const company = await prisma.company.update({
    where: { id },
    data: updateData,
  });

  // 감사 로그 기록
  const user = getUserFromRequest(request);
  await logDataUpdate('Company', company.id, user?.userId, user?.name, {
    updatedFields: Object.keys(body)
  });

  return NextResponse.json({
    ...company,
    achievements: company.achievements
      ? JSON.parse(company.achievements)
      : null,
    images: company.images ? JSON.parse(company.images) : [],
  });
});

// DELETE: 입주기업 삭제
export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id: idString } = await params;
  const id = parseInt(idString);

  if (isNaN(id)) {
    return ApiError.validation('올바른 ID 형식이 아닙니다');
  }

  await prisma.company.delete({
    where: { id },
  });

  // 감사 로그 기록
  const user = getUserFromRequest(request);
  await logDataDelete('Company', id, user?.userId, user?.name);

  return NextResponse.json({ message: "기업이 삭제되었습니다." });
});
