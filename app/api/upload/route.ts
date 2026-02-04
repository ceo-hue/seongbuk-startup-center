/**
 * Upload API - HOVCS 2.0 Conservative Core 적용
 */

import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";
import { withErrorHandler } from "@/lib/core/error/error-handler";
import { logInfo, logWarning } from "@/lib/core/error/error-logger";
import { getUserFromRequest } from "@/lib/auth";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = getUserFromRequest(request);

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string; // 'notices' or 'companies'

  if (!file) {
    await logWarning('파일 업로드 실패 - 파일 누락', { userId: user?.userId });
    return NextResponse.json(
      { error: "파일이 선택되지 않았습니다." },
      { status: 400 }
    );
  }

  if (!type || !["notices", "companies"].includes(type)) {
    await logWarning('파일 업로드 실패 - 잘못된 타입', { type, userId: user?.userId });
    return NextResponse.json(
      { error: "올바른 타입을 지정해주세요." },
      { status: 400 }
    );
  }

  // 파일 크기 제한 (10MB)
  if (file.size > 10 * 1024 * 1024) {
    await logWarning('파일 업로드 실패 - 크기 초과', {
      fileName: file.name,
      fileSize: file.size,
      userId: user?.userId
    });
    return NextResponse.json(
      { error: "파일 크기는 10MB를 초과할 수 없습니다." },
      { status: 400 }
    );
  }

  // 파일 확장자 검증
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx", ".xls", ".xlsx"];
  const fileExtension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] || "";

  if (!allowedExtensions.includes(fileExtension)) {
    await logWarning('파일 업로드 실패 - 지원하지 않는 확장자', {
      fileName: file.name,
      extension: fileExtension,
      userId: user?.userId
    });
    return NextResponse.json(
      { error: "지원하지 않는 파일 형식입니다." },
      { status: 400 }
    );
  }

  // 고유한 파일명 생성
  const randomString = randomBytes(8).toString("hex");
  const timestamp = Date.now();
  const safeFileName = `${timestamp}-${randomString}${fileExtension}`;

  // 파일 저장
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), "public", "uploads", type);
  const filePath = join(uploadDir, safeFileName);

  await writeFile(filePath, buffer);

  // 클라이언트에 반환할 URL
  const fileUrl = `/uploads/${type}/${safeFileName}`;

  // 보안 감사 로그
  await logInfo('파일 업로드 성공', {
    fileName: file.name,
    safeFileName,
    fileSize: file.size,
    type,
    userId: user?.userId,
    url: fileUrl
  });

  return NextResponse.json({
    success: true,
    url: fileUrl,
    fileName: file.name,
    size: file.size
  });
});
