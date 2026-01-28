/**
 * User Detail API - HOVCS 2.0 Conservative Core 적용
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/core/error/error-handler";
import { ApiError } from "@/lib/core/communication/api-error";
import { logDataUpdate, logDataDelete } from "@/lib/core/audit/audit-logger";
import { getUserFromRequest } from "@/lib/auth";

export const PATCH = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id: idString } = await params;
  const id = parseInt(idString);

  if (isNaN(id)) {
    return ApiError.validation('올바른 ID 형식이 아닙니다');
  }

  const { role, isVerified } = await request.json();

  // Validate role if provided
  const validRoles = ["USER", "RESIDENT_COMPANY", "GRADUATED_COMPANY", "ADMIN"];
  if (role && !validRoles.includes(role)) {
    return NextResponse.json(
      { error: "유효하지 않은 역할입니다." },
      { status: 400 }
    );
  }

  // Update user
  const updateData: any = {};
  if (role !== undefined) updateData.role = role;
  if (isVerified !== undefined) updateData.isVerified = isVerified;

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // 감사 로그 기록 (중요한 권한 변경)
  const admin = getUserFromRequest(request);
  await logDataUpdate('User', user.id, admin?.userId, admin?.name, {
    updatedFields: Object.keys(updateData),
    role: user.role,
    isVerified: user.isVerified
  });

  return NextResponse.json(user);
});

export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id: idString } = await params;
  const id = parseInt(idString);

  if (isNaN(id)) {
    return ApiError.validation('올바른 ID 형식이 아닙니다');
  }

  await prisma.user.delete({
    where: { id },
  });

  // 감사 로그 기록 (중요한 사용자 삭제)
  const admin = getUserFromRequest(request);
  await logDataDelete('User', id, admin?.userId, admin?.name);

  return NextResponse.json({ message: "사용자가 삭제되었습니다." });
});
