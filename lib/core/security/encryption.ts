/**
 * HOVCS 2.0 - Conservative Core: Encryption Utilities
 * OCA Layer: ROOT (변경 빈도: 매우 낮음)
 * Neural Protocol: SCP (System Communication Protocol)
 *
 * 암호화 및 해싱 유틸리티
 * 민감한 데이터 보호
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * 비밀번호 해싱 (bcrypt)
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * 비밀번호 검증
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * 랜덤 토큰 생성 (이메일 인증, 비밀번호 재설정 등)
 */
export function generateRandomToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * UUID v4 생성
 */
export function generateUuid(): string {
  return crypto.randomUUID();
}

/**
 * SHA-256 해시 생성
 */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * HMAC 서명 생성 (데이터 무결성 검증)
 */
export function createHmac(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * HMAC 서명 검증
 */
export function verifyHmac(
  data: string,
  signature: string,
  secret: string
): boolean {
  const expected = createHmac(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

/**
 * AES-256-GCM 암호화
 */
export function encrypt(text: string, secretKey: string): {
  encrypted: string;
  iv: string;
  tag: string;
} {
  // 32바이트 키 생성 (AES-256)
  const key = crypto.scryptSync(secretKey, 'salt', 32);

  // IV (Initialization Vector) 생성
  const iv = crypto.randomBytes(16);

  // 암호화
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // 인증 태그 가져오기
  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/**
 * AES-256-GCM 복호화
 */
export function decrypt(
  encrypted: string,
  secretKey: string,
  iv: string,
  tag: string
): string {
  try {
    // 32바이트 키 생성
    const key = crypto.scryptSync(secretKey, 'salt', 32);

    // 복호화
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error('복호화 실패: 잘못된 키 또는 손상된 데이터');
  }
}

/**
 * 민감한 정보 마스킹
 */
export function maskSensitiveData(
  data: string,
  visibleChars: number = 4,
  maskChar: string = '*'
): string {
  if (data.length <= visibleChars) {
    return maskChar.repeat(data.length);
  }

  const visible = data.slice(-visibleChars);
  const masked = maskChar.repeat(data.length - visibleChars);

  return masked + visible;
}

/**
 * 이메일 마스킹
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');

  if (!local || !domain) {
    return email;
  }

  const visibleLocal = local.length > 2 ? 2 : 1;
  const maskedLocal = maskSensitiveData(local, visibleLocal);

  return `${maskedLocal}@${domain}`;
}

/**
 * 전화번호 마스킹 (중간 4자리)
 */
export function maskPhoneNumber(phone: string): string {
  // 숫자만 추출
  const numbers = phone.replace(/\D/g, '');

  if (numbers.length < 8) {
    return phone;
  }

  // 010-****-1234 형식
  const start = numbers.slice(0, 3);
  const end = numbers.slice(-4);
  const middle = '*'.repeat(numbers.length - 7);

  return `${start}-${middle}-${end}`;
}

/**
 * 타이밍 안전한 문자열 비교 (타이밍 공격 방지)
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(a),
      Buffer.from(b)
    );
  } catch {
    return false;
  }
}

/**
 * 보안 랜덤 숫자 생성
 */
export function generateSecureRandomNumber(min: number, max: number): number {
  const range = max - min + 1;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxValid = Math.floor(256 ** bytesNeeded / range) * range;

  let randomNumber;
  do {
    const randomBytes = crypto.randomBytes(bytesNeeded);
    randomNumber = parseInt(randomBytes.toString('hex'), 16);
  } while (randomNumber >= maxValid);

  return min + (randomNumber % range);
}

/**
 * OTP (One-Time Password) 생성
 */
export function generateOtp(length: number = 6): string {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += generateSecureRandomNumber(0, 9).toString();
  }
  return otp;
}
