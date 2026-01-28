/**
 * HOVCS 2.0 - Conservative Core: Input Sanitization
 * OCA Layer: ROOT (변경 빈도: 매우 낮음)
 * Neural Protocol: SCP (System Communication Protocol)
 *
 * XSS 및 SQL Injection 방지를 위한 입력 정제
 */

/**
 * HTML 특수 문자 이스케이프 (XSS 방지)
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * HTML 태그 제거
 */
export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * SQL Injection 위험 문자 이스케이프
 * 참고: Prisma는 자동으로 파라미터화되므로 이 함수는 raw query 사용 시에만 필요
 */
export function escapeSql(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\0/g, '\\0');
}

/**
 * 파일명에서 위험한 문자 제거
 */
export function sanitizeFilename(filename: string): string {
  // 경로 순회 공격 방지 (../, ..\, 등)
  let sanitized = filename.replace(/\.\.[/\\]/g, '');

  // 위험한 문자 제거
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, '');

  // 공백을 언더스코어로 변환
  sanitized = sanitized.replace(/\s+/g, '_');

  // 파일명 길이 제한 (확장자 포함 255자)
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop();
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    sanitized = nameWithoutExt.substring(0, 250 - (ext?.length || 0)) + '.' + ext;
  }

  return sanitized;
}

/**
 * URL에서 위험한 프로토콜 제거
 */
export function sanitizeUrl(url: string): string {
  // javascript:, data:, vbscript: 등 위험한 프로토콜 차단
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];

  const lowerUrl = url.toLowerCase().trim();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return '';
    }
  }

  return url;
}

/**
 * JSON 문자열 안전하게 파싱
 */
export function safeJsonParse<T = unknown>(
  jsonString: string,
  fallback: T
): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
}

/**
 * 숫자만 추출 (전화번호, 우편번호 등)
 */
export function extractNumbers(input: string): string {
  return input.replace(/\D/g, '');
}

/**
 * 영문자와 숫자만 허용 (알파벳 + 숫자)
 */
export function sanitizeAlphanumeric(input: string): string {
  return input.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * 이메일 주소 정규화
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * 공백 정규화 (연속된 공백을 하나로)
 */
export function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

/**
 * 객체의 모든 문자열 값에 HTML 이스케이프 적용
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  skipKeys: string[] = []
): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (skipKeys.includes(key)) {
      sanitized[key] = value;
      continue;
    }

    if (typeof value === 'string') {
      sanitized[key] = escapeHtml(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? escapeHtml(item) : item
      );
    } else if (value !== null && typeof value === 'object') {
      sanitized[key] = sanitizeObject(
        value as Record<string, unknown>,
        skipKeys
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * 명령어 인젝션 방지 (shell command)
 */
export function sanitizeShellInput(input: string): string {
  // 쉘 특수 문자 제거
  return input.replace(/[;&|`$(){}[\]<>\\]/g, '');
}

/**
 * LDAP Injection 방지
 */
export function escapeLdap(input: string): string {
  return input
    .replace(/\\/g, '\\5c')
    .replace(/\*/g, '\\2a')
    .replace(/\(/g, '\\28')
    .replace(/\)/g, '\\29')
    .replace(/\0/g, '\\00');
}

/**
 * NoSQL Injection 방지 (MongoDB 등)
 */
export function sanitizeNoSqlInput(input: unknown): unknown {
  if (typeof input === 'string') {
    return input;
  }

  if (typeof input === 'number' || typeof input === 'boolean') {
    return input;
  }

  if (input === null || input === undefined) {
    return input;
  }

  // 객체나 배열은 허용하지 않음 (연산자 인젝션 방지)
  return String(input);
}
