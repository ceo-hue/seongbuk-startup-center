/**
 * Health Check API
 * 시스템 상태 확인용 엔드포인트
 */

import { NextRequest } from 'next/server';
import { checkHealth, checkHealthQuick } from '@/lib/core/health/health-check';
import { createSuccessResponse } from '@/lib/core/communication/api-response';
import { withErrorHandler } from '@/lib/core/error/error-handler';

/**
 * GET /api/health
 * 간단한 헬스 체크
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode');

  // 상세 모드
  if (mode === 'detailed') {
    const health = await checkHealth();
    return createSuccessResponse(health);
  }

  // 빠른 체크 (기본)
  const health = await checkHealthQuick();
  return createSuccessResponse(health);
});
