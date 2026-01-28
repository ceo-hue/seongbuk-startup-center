/**
 * HOVCS 2.0 - Conservative Core: Audit Logger
 * OCA Layer: TRUNK (변경 빈도: 낮음)
 * Neural Protocol: ERP (Event Recording Protocol)
 *
 * 감사 로그 시스템
 * 중요한 비즈니스 이벤트 추적 및 기록
 */

export enum AuditEventType {
  // 인증 관련
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_REGISTER = 'USER_REGISTER',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',

  // 데이터 조작
  DATA_CREATE = 'DATA_CREATE',
  DATA_UPDATE = 'DATA_UPDATE',
  DATA_DELETE = 'DATA_DELETE',
  DATA_EXPORT = 'DATA_EXPORT',

  // 권한 관련
  PERMISSION_GRANT = 'PERMISSION_GRANT',
  PERMISSION_REVOKE = 'PERMISSION_REVOKE',
  ACCESS_DENIED = 'ACCESS_DENIED',

  // 시스템 이벤트
  SYSTEM_CONFIG_CHANGE = 'SYSTEM_CONFIG_CHANGE',
  SECURITY_ALERT = 'SECURITY_ALERT',

  // 비즈니스 이벤트
  APPLICATION_SUBMIT = 'APPLICATION_SUBMIT',
  APPLICATION_APPROVE = 'APPLICATION_APPROVE',
  APPLICATION_REJECT = 'APPLICATION_REJECT',
  PROGRAM_REGISTER = 'PROGRAM_REGISTER',
  PROGRAM_CANCEL = 'PROGRAM_CANCEL',
}

export interface AuditLog {
  eventType: AuditEventType;
  timestamp: string;
  userId?: number;
  userName?: string;
  userRole?: string;
  action: string;
  resource?: string;
  resourceId?: string | number;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

// 메모리 기반 감사 로그 저장소
class AuditStore {
  private logs: AuditLog[] = [];
  private readonly maxStoredLogs = 10000;

  addLog(log: AuditLog): void {
    this.logs.push(log);

    // 메모리 제한
    if (this.logs.length > this.maxStoredLogs) {
      this.logs.shift();
    }

    // 프로덕션 환경에서는 데이터베이스나 외부 서비스에 저장
    this.persistLog(log);
  }

  private persistLog(log: AuditLog): void {
    // 개발 환경: 콘솔 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('📋 Audit Log:', {
        type: log.eventType,
        user: log.userName || 'Anonymous',
        action: log.action,
        resource: log.resource,
        success: log.success,
      });
    } else {
      // 프로덕션: 구조화된 JSON 로그
      console.log(JSON.stringify({ audit: log }));
    }

    // TODO: 데이터베이스에 저장
    // await prisma.auditLog.create({ data: log });

    // TODO: 외부 감사 서비스로 전송
    // await sendToAuditService(log);
  }

  getLogs(filter?: {
    eventType?: AuditEventType;
    userId?: number;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): AuditLog[] {
    let filtered = [...this.logs];

    if (filter?.eventType) {
      filtered = filtered.filter(log => log.eventType === filter.eventType);
    }

    if (filter?.userId) {
      filtered = filtered.filter(log => log.userId === filter.userId);
    }

    if (filter?.startDate) {
      filtered = filtered.filter(
        log => new Date(log.timestamp) >= filter.startDate!
      );
    }

    if (filter?.endDate) {
      filtered = filtered.filter(
        log => new Date(log.timestamp) <= filter.endDate!
      );
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered;
  }

  getLogsByUser(userId: number, limit: number = 100): AuditLog[] {
    return this.logs
      .filter(log => log.userId === userId)
      .slice(-limit);
  }

  getLogsByResource(resource: string, resourceId: string | number): AuditLog[] {
    return this.logs.filter(
      log => log.resource === resource && log.resourceId === resourceId
    );
  }

  clear(): void {
    this.logs = [];
  }
}

// 싱글톤 인스턴스
const auditStore = new AuditStore();

/**
 * 감사 로그 기록
 */
export async function logAudit(params: {
  eventType: AuditEventType;
  action: string;
  userId?: number;
  userName?: string;
  userRole?: string;
  resource?: string;
  resourceId?: string | number;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
}): Promise<void> {
  const log: AuditLog = {
    eventType: params.eventType,
    timestamp: new Date().toISOString(),
    userId: params.userId,
    userName: params.userName,
    userRole: params.userRole,
    action: params.action,
    resource: params.resource,
    resourceId: params.resourceId,
    details: params.details,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    success: params.success !== false, // 기본값 true
    errorMessage: params.errorMessage,
  };

  auditStore.addLog(log);
}

/**
 * 사용자 로그인 기록
 */
export async function logLogin(
  userId: number,
  userName: string,
  userRole: string,
  ipAddress?: string,
  success: boolean = true
): Promise<void> {
  await logAudit({
    eventType: AuditEventType.USER_LOGIN,
    action: '사용자 로그인',
    userId,
    userName,
    userRole,
    ipAddress,
    success,
  });
}

/**
 * 사용자 로그아웃 기록
 */
export async function logLogout(
  userId: number,
  userName: string,
  ipAddress?: string
): Promise<void> {
  await logAudit({
    eventType: AuditEventType.USER_LOGOUT,
    action: '사용자 로그아웃',
    userId,
    userName,
    ipAddress,
  });
}

/**
 * 데이터 생성 기록
 */
export async function logDataCreate(
  resource: string,
  resourceId: string | number,
  userId?: number,
  userName?: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logAudit({
    eventType: AuditEventType.DATA_CREATE,
    action: `${resource} 생성`,
    resource,
    resourceId,
    userId,
    userName,
    details,
  });
}

/**
 * 데이터 수정 기록
 */
export async function logDataUpdate(
  resource: string,
  resourceId: string | number,
  userId?: number,
  userName?: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logAudit({
    eventType: AuditEventType.DATA_UPDATE,
    action: `${resource} 수정`,
    resource,
    resourceId,
    userId,
    userName,
    details,
  });
}

/**
 * 데이터 삭제 기록
 */
export async function logDataDelete(
  resource: string,
  resourceId: string | number,
  userId?: number,
  userName?: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logAudit({
    eventType: AuditEventType.DATA_DELETE,
    action: `${resource} 삭제`,
    resource,
    resourceId,
    userId,
    userName,
    details,
  });
}

/**
 * 권한 거부 기록
 */
export async function logAccessDenied(
  resource: string,
  action: string,
  userId?: number,
  userName?: string,
  reason?: string
): Promise<void> {
  await logAudit({
    eventType: AuditEventType.ACCESS_DENIED,
    action: `${resource} 접근 거부: ${action}`,
    resource,
    userId,
    userName,
    success: false,
    errorMessage: reason,
  });
}

/**
 * 보안 경고 기록
 */
export async function logSecurityAlert(
  action: string,
  details: Record<string, unknown>,
  ipAddress?: string
): Promise<void> {
  await logAudit({
    eventType: AuditEventType.SECURITY_ALERT,
    action,
    details,
    ipAddress,
    success: false,
  });
}

/**
 * 감사 로그 조회
 */
export function getAuditLogs(filter?: {
  eventType?: AuditEventType;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): AuditLog[] {
  return auditStore.getLogs(filter);
}

/**
 * 사용자별 감사 로그 조회
 */
export function getUserAuditLogs(userId: number, limit: number = 100): AuditLog[] {
  return auditStore.getLogsByUser(userId, limit);
}

/**
 * 리소스별 감사 로그 조회
 */
export function getResourceAuditLogs(
  resource: string,
  resourceId: string | number
): AuditLog[] {
  return auditStore.getLogsByResource(resource, resourceId);
}

/**
 * 감사 로그 초기화 (테스트용)
 */
export function clearAuditLogs(): void {
  auditStore.clear();
}
