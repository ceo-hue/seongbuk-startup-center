/**
 * Partners API - HOVCS 2.0 Conservative Core 적용
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/core/error/error-handler";
import { validateRequired } from "@/lib/core/security/validation";
import { logInfo } from "@/lib/core/error/error-logger";
import { logDataCreate } from "@/lib/core/audit/audit-logger";
import { getUserFromRequest } from "@/lib/auth";

// GET: 모든 협력기관 조회
export const GET = withErrorHandler(async (request: NextRequest) => {
  const partners = await prisma.partner.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  await logInfo('Partners fetched', { count: partners.length });

  return NextResponse.json(partners);
});

// POST: 새 협력기관 생성
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { name } = body;

  // 개발 환경에서는 검증 완화
  if (process.env.NODE_ENV === 'production') {
    validateRequired(body, ['name']);
  } else if (!name) {
    await logInfo('개발 모드 - 필수 필드 누락 경고', { body });
  }

  const partner = await prisma.partner.create({
    data: { name },
  });

  // 감사 로그 기록
  const user = getUserFromRequest(request);
  await logDataCreate('Partner', partner.id, user?.userId, user?.name, {
    name: partner.name
  });

  return NextResponse.json(partner, { status: 201 });
});
