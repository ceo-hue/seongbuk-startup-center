import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "";

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
  } catch (error) {
    console.error("Token verification failed:", error);
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
  } catch (error) {
    console.error("Failed to get user from request:", error);
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
