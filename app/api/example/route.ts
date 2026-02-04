/**
 * Example API - Conservative Core 적용 샘플
 *
 * 이 API는 새로운 Conservative Core 패턴을 보여주는 예제입니다.
 * 기존 API를 수정할 때 이 패턴을 참고하세요.
 */

import { NextRequest } from 'next/server';
import { withErrorHandler } from '@/lib/core/error/error-handler';
import { createSuccessResponse } from '@/lib/core/communication/api-response';
import { ApiError } from '@/lib/core/communication/api-error';
import { validateRequired, validateEmail } from '@/lib/core/security/validation';
import { ErrorFactory } from '@/lib/core/error/error-types';
import { logInfo } from '@/lib/core/error/error-logger';

/**
 * GET /api/example
 * 예제: 성공 응답
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  await logInfo('Example API called', { method: 'GET' });

  const data = {
    message: 'Conservative Core가 적용된 API 예제입니다',
    features: [
      '✅ 자동 에러 처리 (withErrorHandler)',
      '✅ 표준 응답 형식 (createSuccessResponse)',
      '✅ 구조화된 로깅',
      '✅ 타입 안전성'
    ],
    timestamp: new Date().toISOString(),
  };

  return createSuccessResponse(data);
});

/**
 * POST /api/example
 * 예제: 입력 검증 및 에러 처리
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();

  // 개발 환경에서는 검증을 완화 (프로덕션에서는 강화)
  if (process.env.NODE_ENV === 'production') {
    // 필수 필드 검증
    validateRequired(body, ['name', 'email']);

    // 이메일 형식 검증
    if (!validateEmail(body.email)) {
      throw ErrorFactory.validation('올바른 이메일 형식이 아닙니다');
    }
  } else {
    // 개발 환경: 경고만 출력
    await logInfo('개발 모드 - 검증 생략', { body });
  }

  await logInfo('Example data created', {
    name: body.name,
    email: body.email
  });

  const result = {
    id: Math.floor(Math.random() * 10000),
    name: body.name,
    email: body.email,
    createdAt: new Date().toISOString(),
  };

  return createSuccessResponse(result, 201);
});

/**
 * DELETE /api/example
 * 예제: 에러 응답
 */
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    // ApiError 헬퍼 사용
    return ApiError.validation('ID가 필요합니다');
  }

  // 예제: 항상 404 반환
  return ApiError.notFound('Example 데이터');
});
