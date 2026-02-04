/**
 * Metrics API
 * 성능 메트릭 조회용 엔드포인트
 */

import { NextRequest } from 'next/server';
import {
  getMetricsSummary,
  getRequestStats,
  getRecentRequests
} from '@/lib/core/health/metrics';
import { createSuccessResponse } from '@/lib/core/communication/api-response';
import { withErrorHandler } from '@/lib/core/error/error-handler';

/**
 * GET /api/metrics
 * 성능 메트릭 조회
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  // 요약 정보 (기본)
  if (!type || type === 'summary') {
    const summary = getMetricsSummary();
    return createSuccessResponse(summary);
  }

  // 요청 통계
  if (type === 'requests') {
    const timeWindow = parseInt(searchParams.get('window') || '5');
    const stats = getRequestStats(timeWindow);
    return createSuccessResponse(stats);
  }

  // 최근 요청 목록
  if (type === 'recent') {
    const limit = parseInt(searchParams.get('limit') || '100');
    const requests = getRecentRequests(limit);
    return createSuccessResponse(requests);
  }

  return createSuccessResponse(getMetricsSummary());
});
