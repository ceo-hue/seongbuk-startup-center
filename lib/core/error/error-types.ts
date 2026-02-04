/**
 * HOVCS 2.0 - Conservative Core: Error Type Definitions
 * OCA Layer: ROOT (변경 빈도: 매우 낮음)
 * Neural Protocol: SCP (System Communication Protocol)
 *
 * 표준화된 에러 타입 정의
 * 이 파일은 Conservative Core이므로 변경이 거의 없어야 합니다.
 */

export enum ErrorCode {
  // 인증/권한 에러 (4xx)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // 유효성 검증 에러 (4xx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // 리소스 에러 (4xx)
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',

  // 서버 에러 (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // 비즈니스 로직 에러
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
}

export interface ErrorMetadata {
  [key: string]: unknown;
}

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 500,
    public readonly metadata?: ErrorMetadata
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// 자주 사용되는 에러 생성 헬퍼
export class ErrorFactory {
  static unauthorized(message: string = '인증이 필요합니다'): AppError {
    return new AppError(ErrorCode.UNAUTHORIZED, message, 401);
  }

  static forbidden(message: string = '권한이 없습니다'): AppError {
    return new AppError(ErrorCode.FORBIDDEN, message, 403);
  }

  static notFound(resource: string = '리소스'): AppError {
    return new AppError(ErrorCode.NOT_FOUND, `${resource}을(를) 찾을 수 없습니다`, 404);
  }

  static validation(message: string, metadata?: ErrorMetadata): AppError {
    return new AppError(ErrorCode.VALIDATION_ERROR, message, 400, metadata);
  }

  static conflict(message: string): AppError {
    return new AppError(ErrorCode.CONFLICT, message, 409);
  }

  static internal(message: string = '서버 내부 오류가 발생했습니다'): AppError {
    return new AppError(ErrorCode.INTERNAL_ERROR, message, 500);
  }

  static database(message: string = '데이터베이스 오류가 발생했습니다'): AppError {
    return new AppError(ErrorCode.DATABASE_ERROR, message, 500);
  }
}
