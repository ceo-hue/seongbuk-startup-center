/**
 * Partners API - 임시 샘플 데이터 버전
 */

import { NextRequest, NextResponse } from "next/server";

// 샘플 데이터
const samplePartners = [
  {
    id: 1,
    name: "성북구청",
    link: "https://www.sb.go.kr",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "중소벤처기업부",
    link: "https://www.mss.go.kr",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "창업진흥원",
    link: "https://www.kised.or.kr",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: "서울산업진흥원",
    link: "https://www.sba.seoul.kr",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: "소상공인시장진흥공단",
    link: "https://www.semas.or.kr",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 6,
    name: "한국시니어창업협회",
    link: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// GET: 모든 협력기관 조회
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(samplePartners);
  } catch (error) {
    console.error("Partners API error:", error);
    return NextResponse.json(samplePartners);
  }
}

// POST: 새 협력기관 생성 (임시 비활성화)
export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "데이터베이스 연결 후 사용 가능합니다." }, { status: 503 });
}
