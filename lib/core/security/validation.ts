/**
 * HOVCS 2.0 - Conservative Core: Input Validation
 * OCA Layer: ROOT (변경 빈도: 매우 낮음)
 * Neural Protocol: SCP (System Communication Protocol)
 *
 * 입력 데이터 검증 유틸리티
 * 보안의 첫 번째 방어선
 */

import { ErrorFactory } from '../error/error-types';

/**
 * 이메일 유효성 검증
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 비밀번호 강도 검증
 * - 최소 8자
 * - 대문자, 소문자, 숫자, 특수문자 중 3가지 이상 포함
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다');
  }

  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const criteriaCount = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar].filter(Boolean).length;

  if (criteriaCount < 3) {
    errors.push('비밀번호는 대문자, 소문자, 숫자, 특수문자 중 3가지 이상을 포함해야 합니다');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 전화번호 유효성 검증 (한국 형식)
 */
export function validatePhoneNumber(phone: string): boolean {
  // 하이픈 제거
  const cleaned = phone.replace(/[-\s]/g, '');

  // 010-XXXX-XXXX 또는 02-XXX-XXXX 형식
  const phoneRegex = /^(01[0-9]|02|0[3-9][0-9])\d{3,4}\d{4}$/;
  return phoneRegex.test(cleaned);
}

/**
 * URL 유효성 검증
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 필수 필드 검증
 */
export function validateRequired<T>(
  data: Record<string, unknown>,
  requiredFields: string[]
): T {
  const missing: string[] = [];

  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw ErrorFactory.validation(
      '필수 필드가 누락되었습니다',
      { missingFields: missing }
    );
  }

  return data as T;
}

/**
 * 문자열 길이 검증
 */
export function validateLength(
  value: string,
  min?: number,
  max?: number,
  fieldName: string = '값'
): void {
  if (min !== undefined && value.length < min) {
    throw ErrorFactory.validation(
      `${fieldName}은(는) 최소 ${min}자 이상이어야 합니다`
    );
  }

  if (max !== undefined && value.length > max) {
    throw ErrorFactory.validation(
      `${fieldName}은(는) 최대 ${max}자 이하여야 합니다`
    );
  }
}

/**
 * 숫자 범위 검증
 */
export function validateRange(
  value: number,
  min?: number,
  max?: number,
  fieldName: string = '값'
): void {
  if (min !== undefined && value < min) {
    throw ErrorFactory.validation(
      `${fieldName}은(는) ${min} 이상이어야 합니다`
    );
  }

  if (max !== undefined && value > max) {
    throw ErrorFactory.validation(
      `${fieldName}은(는) ${max} 이하여야 합니다`
    );
  }
}

/**
 * Enum 값 검증
 */
export function validateEnum<T extends string>(
  value: string,
  allowedValues: readonly T[],
  fieldName: string = '값'
): T {
  if (!allowedValues.includes(value as T)) {
    throw ErrorFactory.validation(
      `${fieldName}은(는) ${allowedValues.join(', ')} 중 하나여야 합니다`,
      { received: value, allowed: allowedValues }
    );
  }
  return value as T;
}

/**
 * 날짜 형식 검증 (ISO 8601)
 */
export function validateDateString(dateString: string, fieldName: string = '날짜'): Date {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw ErrorFactory.validation(
      `${fieldName}의 형식이 올바르지 않습니다 (ISO 8601 형식 필요)`
    );
  }

  return date;
}

/**
 * 배열 검증
 */
export function validateArray<T>(
  value: unknown,
  minLength?: number,
  maxLength?: number,
  fieldName: string = '배열'
): T[] {
  if (!Array.isArray(value)) {
    throw ErrorFactory.validation(`${fieldName}은(는) 배열이어야 합니다`);
  }

  if (minLength !== undefined && value.length < minLength) {
    throw ErrorFactory.validation(
      `${fieldName}은(는) 최소 ${minLength}개 이상의 항목을 포함해야 합니다`
    );
  }

  if (maxLength !== undefined && value.length > maxLength) {
    throw ErrorFactory.validation(
      `${fieldName}은(는) 최대 ${maxLength}개 이하의 항목을 포함해야 합니다`
    );
  }

  return value as T[];
}
