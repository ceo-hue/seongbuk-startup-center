/**
 * Companies API - 임시 샘플 데이터 버전
 */

import { NextRequest, NextResponse } from "next/server";

// 샘플 데이터
const sampleCompanies = [
  {
    id: 1,
    name: "테크스타트",
    tag: "AI/빅데이터",
    desc: "AI 기반 데이터 분석 솔루션 개발",
    detailedDesc: "중장년 창업자가 설립한 AI 전문 기업으로, 데이터 분석 솔루션을 제공합니다.",
    year: "2023",
    achievements: ["중소기업부 장관상 수상", "시리즈A 투자 유치"],
    website: "https://example.com",
    logo: null,
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "헬스케어플러스",
    tag: "헬스케어",
    desc: "시니어 맞춤형 건강관리 플랫폼",
    detailedDesc: "중장년층을 위한 맞춤형 건강관리 서비스를 제공하는 헬스케어 스타트업입니다.",
    year: "2022",
    achievements: ["보건복지부 우수기업 선정"],
    website: "https://example.com",
    logo: null,
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "그린에너지",
    tag: "친환경",
    desc: "신재생 에너지 컨설팅",
    detailedDesc: "친환경 에너지 전환을 돕는 컨설팅 기업입니다.",
    year: "2023",
    achievements: ["환경부 인증 획득"],
    website: "https://example.com",
    logo: null,
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// GET: 모든 입주기업 조회
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(sampleCompanies);
  } catch (error) {
    console.error("Companies API error:", error);
    return NextResponse.json(sampleCompanies);
  }
}

// POST: 새 입주기업 생성 (임시 비활성화)
export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "데이터베이스 연결 후 사용 가능합니다." }, { status: 503 });
}
