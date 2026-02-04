import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

/**
 * JWT_SECRET 환경변수 검증
 * 프로덕션 환경에서는 반드시 설정되어야 함
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.trim() === "") {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[SECURITY ERROR] JWT_SECRET 환경변수가 설정되지 않았습니다. " +
        "프로덕션 환경에서는 반드시 안전한 비밀키를 설정해야 합니다."
      );
    }
    // 개발 환경에서만 기본값 사용 (경고 출력)
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[DEV WARNING] JWT_SECRET이 설정되지 않아 기본값을 사용합니다. " +
        "프로덕션 배포 전 반드시 설정하세요."
      );
    }
    return "dev-only-insecure-secret-key-do-not-use-in-production";
  }

  // 최소 길이 검증 (32자 이상 권장)
  if (secret.length < 32 && process.env.NODE_ENV === "production") {
    throw new Error(
      "[SECURITY ERROR] JWT_SECRET은 최소 32자 이상이어야 합니다. " +
      "현재 길이: " + secret.length
    );
  }

  return secret;
}

const JWT_SECRET = getJwtSecret();

export interface JWTPayload {
  userId: number;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    // 프로덕션에서는 상세 에러 로그 숨김
    if (process.env.NODE_ENV === "development") {
      console.warn("[DEV] Token verification failed");
    }
    return null;
  }
}

/**
 * NextRequest에서 토큰을 추출하고 검증
 * @param request NextRequest 객체
 * @returns 사용자 정보 또는 null
 */
export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return null;
    }
    return verifyToken(token);
  } catch {
    // 프로덕션에서는 상세 에러 로그 숨김
    if (process.env.NODE_ENV === "development") {
      console.warn("[DEV] Failed to get user from request");
    }
    return null;
  }
}

export function isAdmin(role: string): boolean {
  return role === "ADMIN";
}

export function isResidentCompany(role: string): boolean {
  return role === "RESIDENT_COMPANY";
}

export function isGraduatedCompany(role: string): boolean {
  return role === "GRADUATED_COMPANY";
}

export function hasCompanyAccess(role: string): boolean {
  return isResidentCompany(role) || isGraduatedCompany(role) || isAdmin(role);
}
