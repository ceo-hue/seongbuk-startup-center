/**
 * Companies API - HOVCS 2.0 Conservative Core 적용
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/core/error/error-handler";
import { validateRequired } from "@/lib/core/security/validation";
import { logInfo } from "@/lib/core/error/error-logger";
import { logDataCreate } from "@/lib/core/audit/audit-logger";
import { getUserFromRequest } from "@/lib/auth";

// GET: 모든 입주기업 조회
export const GET = withErrorHandler(async (request: NextRequest) => {
  const companies = await prisma.company.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  // JSON 필드 파싱
  const parsedCompanies = companies.map((company) => ({
    ...company,
    achievements: company.achievements
      ? JSON.parse(company.achievements)
      : null,
    images: company.images ? JSON.parse(company.images) : [],
  }));

  await logInfo('Companies fetched', { count: parsedCompanies.length });

  return NextResponse.json(parsedCompanies);
});

// POST: 새 입주기업 생성
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { name, tag, desc, detailedDesc, year, achievements, website, logo, images } = body;

  // 개발 환경에서는 검증 완화
  if (process.env.NODE_ENV === 'production') {
    validateRequired(body, ['name', 'tag', 'desc']);
  } else if (!name || !tag || !desc) {
    await logInfo('개발 모드 - 필수 필드 누락 경고', { body });
  }

  const company = await prisma.company.create({
    data: {
      name,
      tag,
      desc,
      detailedDesc,
      year,
      achievements: achievements ? JSON.stringify(achievements) : null,
      website,
      logo: logo || null,
      images: images && images.length > 0 ? JSON.stringify(images) : null,
    },
  });

  // 감사 로그 기록
  const user = getUserFromRequest(request);
  await logDataCreate('Company', company.id, user?.userId, user?.name, {
    name: company.name,
    tag: company.tag
  });

  const parsedCompany = {
    ...company,
    achievements: company.achievements
      ? JSON.parse(company.achievements)
      : null,
    images: company.images ? JSON.parse(company.images) : [],
  };

  return NextResponse.json(parsedCompany, { status: 201 });
});
