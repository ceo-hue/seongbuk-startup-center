/**
 * HOVCS 2.0 - Conservative Core: Central Error Handler
 * OCA Layer: TRUNK (변경 빈도: 낮음)
 * Neural Protocol: EDP (Error Detection Protocol)
 *
 * 중앙 에러 처리 시스템
 * 모든 에러를 일관되게 처리하고 로깅
 */

import { NextRequest, NextResponse } from 'next/server';
import { AppError, ErrorCode } from './error-types';
import { createErrorResponse } from '../communication/api-error';
import { logError } from './error-logger';

/**
 * API 라우트 핸들러를 감싸서 에러를 자동으로 처리
 * Next.js 15 호환 타입
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler = (request: NextRequest, context?: any) => Promise<NextResponse<any>>;

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (
    request: NextRequest,
    context?: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    const requestId = generateRequestId();

    try {
      return await handler(request, context);
    } catch (error) {
      // 에러 로깅
      await logError(error, {
        requestId,
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
      });

      // 표준화된 에러 응답 반환
      return createErrorResponse(error, requestId);
    }
  };
}

/**
 * 동기 함수용 에러 핸들러
 */
export function handleError(error: unknown, context?: Record<string, unknown>): never {
  // 에러 로깅 (비동기지만 대기하지 않음)
  void logError(error, context);

  // AppError는 그대로 throw
  if (error instanceof AppError) {
    throw error;
  }

  // 일반 에러는 AppError로 변환
  if (error instanceof Error) {
    throw new AppError(
      ErrorCode.INTERNAL_ERROR,
      error.message,
      500
    );
  }

  // 알 수 없는 에러
  throw new AppError(
    ErrorCode.INTERNAL_ERROR,
    '알 수 없는 오류가 발생했습니다',
    500
  );
}

/**
 * 비동기 함수 실행 및 에러 처리
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, context);
  }
}

/**
 * 요청 ID 생성 (추적용)
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 에러가 특정 타입인지 확인
 */
export function isErrorCode(error: unknown, code: ErrorCode): boolean {
  return error instanceof AppError && error.code === code;
}

/**
 * 에러에서 안전하게 메시지 추출
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return '알 수 없는 오류가 발생했습니다';
}
