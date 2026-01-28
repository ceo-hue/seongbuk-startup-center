/**
 * HOVCS 2.0 - Conservative Core: API Response Standards
 * OCA Layer: TRUNK (변경 빈도: 낮음)
 * Neural Protocol: SCP (System Communication Protocol)
 *
 * 표준화된 API 응답 형식
 * 일관된 응답 구조로 클라이언트 처리 단순화
 */

import { NextResponse } from 'next/server';

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  timestamp: string;
  requestId?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
  requestId?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * 성공 응답 생성
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  requestId?: string
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId,
  };

  return NextResponse.json(response, { status });
}

/**
 * 생성 성공 응답 (201)
 */
export function createCreatedResponse<T>(
  data: T,
  requestId?: string
): NextResponse<ApiSuccessResponse<T>> {
  return createSuccessResponse(data, 201, requestId);
}

/**
 * 삭제 성공 응답 (204)
 */
export function createNoContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * 페이지네이션 응답
 */
export interface PaginatedData<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export function createPaginatedResponse<T>(
  items: T[],
  page: number,
  pageSize: number,
  totalItems: number,
  requestId?: string
): NextResponse<ApiSuccessResponse<PaginatedData<T>>> {
  const totalPages = Math.ceil(totalItems / pageSize);

  const data: PaginatedData<T> = {
    items,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
  };

  return createSuccessResponse(data, 200, requestId);
}
