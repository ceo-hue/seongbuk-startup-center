/**
 * Notices API - HOVCS 2.0 Conservative Core 적용
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { canAccessContent, type Visibility, type UserRole } from "@/lib/permissions";
import { withErrorHandler } from "@/lib/core/error/error-handler";
import { validateRequired } from "@/lib/core/security/validation";
import { logInfo } from "@/lib/core/error/error-logger";
import { logDataCreate } from "@/lib/core/audit/audit-logger";

// GET: 모든 공지사항 조회 (권한별 필터링)
export const GET = withErrorHandler(async (request: NextRequest) => {
  // 사용자 정보 가져오기 (로그인 안 되어 있으면 null)
  const user = getUserFromRequest(request);
  const userRole = user?.role as UserRole | null;

  const notices = await prisma.notice.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  // 사용자 권한에 따라 필터링
  const filteredNotices = notices.filter(notice => {
    const visibility = notice.visibility as Visibility;
    return canAccessContent(userRole, visibility);
  });

  // JSON 필드 파싱
  const parsedNotices = filteredNotices.map(notice => ({
    ...notice,
    images: notice.images ? JSON.parse(notice.images) : [],
    files: notice.files ? JSON.parse(notice.files) : [],
  }));

  await logInfo('Notices fetched', {
    count: parsedNotices.length,
    userRole: userRole || 'anonymous'
  });

  return NextResponse.json(parsedNotices);
});

// POST: 새 공지사항 생성
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { title, content, category, author, date, images, files, visibility = "PUBLIC" } = body;

  // 개발 환경에서는 검증 완화
  if (process.env.NODE_ENV === 'production') {
    validateRequired(body, ['title', 'content', 'category', 'author', 'date']);
  } else if (!title || !content || !category || !author || !date) {
    await logInfo('개발 모드 - 필수 필드 누락 경고', { body });
  }

  const notice = await prisma.notice.create({
    data: {
      title,
      content,
      category,
      author,
      date,
      views: 0,
      visibility,
      images: images && images.length > 0 ? JSON.stringify(images) : null,
      files: files && files.length > 0 ? JSON.stringify(files) : null,
    },
  });

  // 감사 로그 기록
  const user = getUserFromRequest(request);
  await logDataCreate('Notice', notice.id, user?.userId, user?.name, {
    title: notice.title,
    category: notice.category
  });

  return NextResponse.json(notice, { status: 201 });
});
