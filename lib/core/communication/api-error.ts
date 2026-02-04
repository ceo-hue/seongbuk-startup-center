/**
 * HOVCS 2.0 - Conservative Core: API Error Handler
 * OCA Layer: TRUNK (변경 빈도: 낮음)
 * Neural Protocol: EDP (Error Detection Protocol)
 *
 * 표준화된 API 에러 응답
 */

import { NextResponse } from 'next/server';
import { AppError, ErrorCode } from '../error/error-types';
import { ApiErrorResponse } from './api-response';

/**
 * 에러를 표준 API 에러 응답으로 변환
 */
export function createErrorResponse(
  error: unknown,
  requestId?: string
): NextResponse<ApiErrorResponse> {
  // AppError인 경우
  if (error instanceof AppError) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.metadata,
      },
      timestamp: new Date().toISOString(),
      requestId,
    };

    return NextResponse.json(response, { status: error.statusCode });
  }

  // Prisma 에러 처리
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: unknown };

    if (prismaError.code === 'P2002') {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: ErrorCode.ALREADY_EXISTS,
          message: '이미 존재하는 데이터입니다',
          details: prismaError.meta,
        },
        timestamp: new Date().toISOString(),
        requestId,
      };
      return NextResponse.json(response, { status: 409 });
    }

    if (prismaError.code === 'P2025') {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: '데이터를 찾을 수 없습니다',
        },
        timestamp: new Date().toISOString(),
        requestId,
      };
      return NextResponse.json(response, { status: 404 });
    }
  }

  // 일반 Error 객체
  if (error instanceof Error) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: process.env.NODE_ENV === 'production'
          ? '서버 내부 오류가 발생했습니다'
          : error.message,
      },
      timestamp: new Date().toISOString(),
      requestId,
    };

    return NextResponse.json(response, { status: 500 });
  }

  // 알 수 없는 에러
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: '알 수 없는 오류가 발생했습니다',
    },
    timestamp: new Date().toISOString(),
    requestId,
  };

  return NextResponse.json(response, { status: 500 });
}

/**
 * 빠른 에러 응답 생성 헬퍼
 */
export class ApiError {
  static unauthorized(message?: string, requestId?: string) {
    const error = new AppError(
      ErrorCode.UNAUTHORIZED,
      message || '인증이 필요합니다',
      401
    );
    return createErrorResponse(error, requestId);
  }

  static forbidden(message?: string, requestId?: string) {
    const error = new AppError(
      ErrorCode.FORBIDDEN,
      message || '권한이 없습니다',
      403
    );
    return createErrorResponse(error, requestId);
  }

  static notFound(resource?: string, requestId?: string) {
    const error = new AppError(
      ErrorCode.NOT_FOUND,
      resource ? `${resource}을(를) 찾을 수 없습니다` : '리소스를 찾을 수 없습니다',
      404
    );
    return createErrorResponse(error, requestId);
  }

  static validation(message: string, details?: unknown, requestId?: string) {
    const error = new AppError(
      ErrorCode.VALIDATION_ERROR,
      message,
      400,
      details as Record<string, unknown>
    );
    return createErrorResponse(error, requestId);
  }

  static conflict(message: string, requestId?: string) {
    const error = new AppError(
      ErrorCode.CONFLICT,
      message,
      409
    );
    return createErrorResponse(error, requestId);
  }

  static internal(message?: string, requestId?: string) {
    const error = new AppError(
      ErrorCode.INTERNAL_ERROR,
      message || '서버 내부 오류가 발생했습니다',
      500
    );
    return createErrorResponse(error, requestId);
  }
}
