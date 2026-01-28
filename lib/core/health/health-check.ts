/**
 * HOVCS 2.0 - Conservative Core: Health Check
 * OCA Layer: TRUNK (변경 빈도: 낮음)
 * Neural Protocol: BAP (Business Activity Protocol)
 *
 * 시스템 헬스 체크 및 모니터링
 */

import { prisma } from '@/lib/prisma';

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: string;
  checks: {
    database: ComponentHealth;
    memory: ComponentHealth;
    uptime: ComponentHealth;
  };
  metadata?: Record<string, unknown>;
}

export interface ComponentHealth {
  status: HealthStatus;
  message?: string;
  responseTime?: number;
  details?: Record<string, unknown>;
}

/**
 * 전체 시스템 헬스 체크
 */
export async function checkHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  const [database, memory, uptime] = await Promise.allSettled([
    checkDatabase(),
    checkMemory(),
    checkUptime(),
  ]);

  const result: HealthCheckResult = {
    status: HealthStatus.HEALTHY,
    timestamp: new Date().toISOString(),
    checks: {
      database: database.status === 'fulfilled'
        ? database.value
        : { status: HealthStatus.UNHEALTHY, message: 'Database check failed' },
      memory: memory.status === 'fulfilled'
        ? memory.value
        : { status: HealthStatus.UNHEALTHY, message: 'Memory check failed' },
      uptime: uptime.status === 'fulfilled'
        ? uptime.value
        : { status: HealthStatus.UNHEALTHY, message: 'Uptime check failed' },
    },
    metadata: {
      totalResponseTime: Date.now() - startTime,
    },
  };

  // 전체 상태 결정
  const statuses = Object.values(result.checks).map(check => check.status);

  if (statuses.includes(HealthStatus.UNHEALTHY)) {
    result.status = HealthStatus.UNHEALTHY;
  } else if (statuses.includes(HealthStatus.DEGRADED)) {
    result.status = HealthStatus.DEGRADED;
  }

  return result;
}

/**
 * 데이터베이스 연결 확인
 */
export async function checkDatabase(): Promise<ComponentHealth> {
  const startTime = Date.now();

  try {
    // 간단한 쿼리로 연결 확인
    await prisma.$queryRaw`SELECT 1`;

    const responseTime = Date.now() - startTime;

    return {
      status: responseTime < 1000 ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
      responseTime,
      message: responseTime < 1000 ? 'Database connected' : 'Database slow',
    };
  } catch (error) {
    return {
      status: HealthStatus.UNHEALTHY,
      message: 'Database connection failed',
      responseTime: Date.now() - startTime,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * 메모리 사용량 확인
 */
export async function checkMemory(): Promise<ComponentHealth> {
  const memoryUsage = process.memoryUsage();
  const usedMemoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const totalMemoryMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  const usagePercent = (usedMemoryMB / totalMemoryMB) * 100;

  let status = HealthStatus.HEALTHY;
  let message = 'Memory usage normal';

  if (usagePercent > 90) {
    status = HealthStatus.UNHEALTHY;
    message = 'Memory usage critical';
  } else if (usagePercent > 75) {
    status = HealthStatus.DEGRADED;
    message = 'Memory usage high';
  }

  return {
    status,
    message,
    details: {
      usedMB: usedMemoryMB,
      totalMB: totalMemoryMB,
      usagePercent: Math.round(usagePercent),
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
    },
  };
}

/**
 * 서버 업타임 확인
 */
export async function checkUptime(): Promise<ComponentHealth> {
  const uptimeSeconds = process.uptime();
  const uptimeMinutes = Math.floor(uptimeSeconds / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);

  return {
    status: HealthStatus.HEALTHY,
    message: `Uptime: ${uptimeHours}h ${uptimeMinutes % 60}m`,
    details: {
      seconds: Math.floor(uptimeSeconds),
      minutes: uptimeMinutes,
      hours: uptimeHours,
    },
  };
}

/**
 * 빠른 헬스 체크 (간단한 응답용)
 */
export async function checkHealthQuick(): Promise<{
  status: HealthStatus;
  timestamp: string;
}> {
  try {
    // 데이터베이스만 빠르게 체크
    await prisma.$queryRaw`SELECT 1`;

    return {
      status: HealthStatus.HEALTHY,
      timestamp: new Date().toISOString(),
    };
  } catch {
    return {
      status: HealthStatus.UNHEALTHY,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 준비 상태 확인 (Readiness probe)
 * 서비스가 트래픽을 받을 준비가 되었는지 확인
 */
export async function checkReadiness(): Promise<boolean> {
  try {
    const health = await checkHealth();
    return health.status !== HealthStatus.UNHEALTHY;
  } catch {
    return false;
  }
}

/**
 * 생존 확인 (Liveness probe)
 * 프로세스가 살아있는지 확인
 */
export async function checkLiveness(): Promise<boolean> {
  // 프로세스가 응답할 수 있으면 살아있음
  return true;
}
