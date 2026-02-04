/**
 * HOVCS 2.0 - Conservative Core: Performance Metrics
 * OCA Layer: TRUNK (변경 빈도: 낮음)
 * Neural Protocol: BAP (Business Activity Protocol)
 *
 * 성능 메트릭 수집 및 모니터링
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  tags?: Record<string, string>;
}

export interface RequestMetrics {
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  timestamp: string;
}

// 메모리 기반 메트릭 저장소 (간단한 구현)
class MetricsStore {
  private requestMetrics: RequestMetrics[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private readonly maxStoredMetrics = 1000;

  addRequestMetric(metric: RequestMetrics): void {
    this.requestMetrics.push(metric);

    // 메모리 제한
    if (this.requestMetrics.length > this.maxStoredMetrics) {
      this.requestMetrics.shift();
    }
  }

  addPerformanceMetric(metric: PerformanceMetric): void {
    this.performanceMetrics.push(metric);

    if (this.performanceMetrics.length > this.maxStoredMetrics) {
      this.performanceMetrics.shift();
    }
  }

  getRequestMetrics(limit?: number): RequestMetrics[] {
    if (limit) {
      return this.requestMetrics.slice(-limit);
    }
    return [...this.requestMetrics];
  }

  getPerformanceMetrics(limit?: number): PerformanceMetric[] {
    if (limit) {
      return this.performanceMetrics.slice(-limit);
    }
    return [...this.performanceMetrics];
  }

  getRequestStats(timeWindowMinutes: number = 5): {
    totalRequests: number;
    avgDuration: number;
    maxDuration: number;
    minDuration: number;
    errorRate: number;
    requestsPerMinute: number;
  } {
    const now = Date.now();
    const windowMs = timeWindowMinutes * 60 * 1000;

    const recentRequests = this.requestMetrics.filter(
      metric => now - new Date(metric.timestamp).getTime() < windowMs
    );

    if (recentRequests.length === 0) {
      return {
        totalRequests: 0,
        avgDuration: 0,
        maxDuration: 0,
        minDuration: 0,
        errorRate: 0,
        requestsPerMinute: 0,
      };
    }

    const durations = recentRequests.map(r => r.duration);
    const errors = recentRequests.filter(r => r.statusCode >= 400).length;

    return {
      totalRequests: recentRequests.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
      errorRate: (errors / recentRequests.length) * 100,
      requestsPerMinute: recentRequests.length / timeWindowMinutes,
    };
  }

  clear(): void {
    this.requestMetrics = [];
    this.performanceMetrics = [];
  }
}

// 싱글톤 인스턴스
const metricsStore = new MetricsStore();

/**
 * 요청 메트릭 기록
 */
export function recordRequestMetric(
  method: string,
  path: string,
  statusCode: number,
  duration: number
): void {
  metricsStore.addRequestMetric({
    method,
    path,
    statusCode,
    duration,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 성능 메트릭 기록
 */
export function recordPerformanceMetric(
  name: string,
  value: number,
  unit: string,
  tags?: Record<string, string>
): void {
  metricsStore.addPerformanceMetric({
    name,
    value,
    unit,
    timestamp: new Date().toISOString(),
    tags,
  });
}

/**
 * 요청 통계 조회
 */
export function getRequestStats(timeWindowMinutes: number = 5) {
  return metricsStore.getRequestStats(timeWindowMinutes);
}

/**
 * 최근 요청 메트릭 조회
 */
export function getRecentRequests(limit: number = 100): RequestMetrics[] {
  return metricsStore.getRequestMetrics(limit);
}

/**
 * 최근 성능 메트릭 조회
 */
export function getRecentPerformanceMetrics(limit: number = 100): PerformanceMetric[] {
  return metricsStore.getPerformanceMetrics(limit);
}

/**
 * 메트릭 초기화
 */
export function clearMetrics(): void {
  metricsStore.clear();
}

/**
 * 함수 실행 시간 측정
 */
export async function measureExecutionTime<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - startTime;

    recordPerformanceMetric(name, duration, 'ms', { status: 'success' });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    recordPerformanceMetric(name, duration, 'ms', { status: 'error' });

    throw error;
  }
}

/**
 * 타이머 클래스 (수동 시간 측정)
 */
export class Timer {
  private startTime: number;
  private endTime?: number;

  constructor(private readonly name: string) {
    this.startTime = performance.now();
  }

  stop(tags?: Record<string, string>): number {
    this.endTime = performance.now();
    const duration = this.endTime - this.startTime;

    recordPerformanceMetric(this.name, duration, 'ms', tags);

    return duration;
  }

  getDuration(): number {
    const end = this.endTime || performance.now();
    return end - this.startTime;
  }
}

/**
 * 전체 메트릭 요약
 */
export function getMetricsSummary() {
  const requestStats = getRequestStats(5);
  const memoryUsage = process.memoryUsage();

  return {
    requests: requestStats,
    memory: {
      heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      rssMB: Math.round(memoryUsage.rss / 1024 / 1024),
      externalMB: Math.round(memoryUsage.external / 1024 / 1024),
    },
    uptime: {
      seconds: Math.floor(process.uptime()),
      minutes: Math.floor(process.uptime() / 60),
      hours: Math.floor(process.uptime() / 3600),
    },
    timestamp: new Date().toISOString(),
  };
}
