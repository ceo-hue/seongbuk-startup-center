/**
 * HOVCS 2.0 - Conservative Core: Error Logger
 * OCA Layer: TRUNK (변경 빈도: 낮음)
 * Neural Protocol: EDP (Error Detection Protocol)
 *
 * 구조화된 에러 로깅 시스템
 */

import { AppError } from './error-types';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    code?: string;
    stack?: string;
  };
}

/**
 * 에러 로깅 (구조화된 로그)
 */
export async function logError(
  error: unknown,
  context?: Record<string, unknown>
): Promise<void> {
  const logEntry = createLogEntry(LogLevel.ERROR, error, context);

  // 개발 환경: 콘솔에 상세 출력
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Error:', logEntry);
    if (error instanceof Error && error.stack) {
      console.error('Stack:', error.stack);
    }
    return;
  }

  // 프로덕션 환경: 구조화된 JSON 로그
  console.error(JSON.stringify(logEntry));

  // TODO: 외부 로깅 서비스로 전송 (Sentry, CloudWatch 등)
  // await sendToLoggingService(logEntry);
}

/**
 * 경고 로깅
 */
export async function logWarning(
  message: string,
  context?: Record<string, unknown>
): Promise<void> {
  const logEntry = createLogEntry(LogLevel.WARN, message, context);

  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Warning:', logEntry);
  } else {
    console.warn(JSON.stringify(logEntry));
  }
}

/**
 * 정보 로깅
 */
export async function logInfo(
  message: string,
  context?: Record<string, unknown>
): Promise<void> {
  const logEntry = createLogEntry(LogLevel.INFO, message, context);

  if (process.env.NODE_ENV === 'development') {
    console.info('ℹ️ Info:', logEntry);
  } else {
    console.info(JSON.stringify(logEntry));
  }
}

/**
 * 디버그 로깅 (개발 환경에서만)
 */
export async function logDebug(
  message: string,
  context?: Record<string, unknown>
): Promise<void> {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const logEntry = createLogEntry(LogLevel.DEBUG, message, context);
  console.debug('🔍 Debug:', logEntry);
}

/**
 * 치명적 에러 로깅
 */
export async function logCritical(
  error: unknown,
  context?: Record<string, unknown>
): Promise<void> {
  const logEntry = createLogEntry(LogLevel.CRITICAL, error, context);

  // 항상 출력
  console.error('🚨 CRITICAL:', logEntry);

  // TODO: 즉시 알림 전송 (이메일, Slack, PagerDuty 등)
  // await sendCriticalAlert(logEntry);
}

/**
 * 로그 엔트리 생성
 */
function createLogEntry(
  level: LogLevel,
  messageOrError: string | unknown,
  context?: Record<string, unknown>
): LogEntry {
  const entry: LogEntry = {
    level,
    timestamp: new Date().toISOString(),
    message: '',
    context: sanitizeContext(context),
  };

  // 에러 객체 처리
  if (messageOrError instanceof AppError) {
    entry.message = messageOrError.message;
    entry.error = {
      name: messageOrError.name,
      message: messageOrError.message,
      code: messageOrError.code,
      stack: messageOrError.stack,
    };
    if (messageOrError.metadata) {
      entry.context = {
        ...entry.context,
        errorMetadata: messageOrError.metadata,
      };
    }
  } else if (messageOrError instanceof Error) {
    entry.message = messageOrError.message;
    entry.error = {
      name: messageOrError.name,
      message: messageOrError.message,
      stack: messageOrError.stack,
    };
  } else if (typeof messageOrError === 'string') {
    entry.message = messageOrError;
  } else {
    entry.message = '알 수 없는 에러';
    entry.context = {
      ...entry.context,
      rawError: messageOrError,
    };
  }

  return entry;
}

/**
 * 컨텍스트에서 민감한 정보 제거
 */
function sanitizeContext(
  context?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!context) {
    return undefined;
  }

  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'authorization',
    'cookie',
    'api_key',
    'apiKey',
  ];

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(sensitiveKey =>
      lowerKey.includes(sensitiveKey)
    );

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
