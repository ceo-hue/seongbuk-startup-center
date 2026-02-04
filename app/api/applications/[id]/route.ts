/**
 * Application Detail API - HOVCS 2.0 Conservative Core 적용
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { logWarning, logError } from "@/lib/core/error/error-logger";
import { logDataUpdate, logDataDelete } from "@/lib/core/audit/audit-logger";

// PATCH: 신청 상태 업데이트 (관리자 전용)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      await logWarning('신청 상태 업데이트 거부 - 권한 부족', { userId: user.userId, role: user.role });
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const { id: idString } = await params;
    const id = parseInt(idString);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: '올바른 ID 형식이 아닙니다' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, reviewNote } = body;

    const application = await prisma.application.update({
      where: { id },
      data: {
        status,
        reviewNote,
        reviewedAt: new Date(),
        reviewedBy: user.name,
      },
    });

    // 감사 로그 기록
    await logDataUpdate('Application', application.id, user.userId, user.name, {
      status: application.status,
      reviewedBy: application.reviewedBy
    });

    return NextResponse.json(application);
  } catch (error) {
    await logError(error, { route: '/api/applications/[id]', method: 'PATCH' });
    return NextResponse.json(
      { error: "신청 상태 업데이트에 실패했습니다." },
      { status: 500 }
    );
  }
}

// DELETE: 신청 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { id: idString } = await params;
    const id = parseInt(idString);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: '올바른 ID 형식이 아닙니다' },
        { status: 400 }
      );
    }

    // 본인 신청이거나 관리자인 경우만 삭제 가능
    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json(
        { error: "신청을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (application.userId !== user.userId && user.role !== "ADMIN") {
      await logWarning('신청 삭제 거부 - 권한 부족', { userId: user.userId, applicationId: id });
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      );
    }

    await prisma.application.delete({
      where: { id },
    });

    // 감사 로그 기록
    await logDataDelete('Application', id, user.userId, user.name);

    return NextResponse.json({ message: "신청이 삭제되었습니다." });
  } catch (error) {
    await logError(error, { route: '/api/applications/[id]', method: 'DELETE' });
    return NextResponse.json(
      { error: "신청 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
