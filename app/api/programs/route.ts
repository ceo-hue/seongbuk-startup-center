/**
 * Programs API - 임시 샘플 데이터 버전
 */

import { NextRequest, NextResponse } from "next/server";

// 샘플 데이터 (데이터베이스 연결 전 임시 사용)
const samplePrograms = [
  {
    id: 1,
    title: "창업 기초 교육",
    desc: "중장년 창업을 위한 기초 교육 프로그램",
    gradient: "from-blue-500 to-purple-600",
    visibility: "PUBLIC",
    category: "교육",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "멘토링 프로그램",
    desc: "전문가와 함께하는 1:1 멘토링",
    gradient: "from-green-500 to-teal-600",
    visibility: "PUBLIC",
    category: "멘토링",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "네트워킹 행사",
    desc: "창업자 간 교류 및 네트워킹",
    gradient: "from-orange-500 to-red-600",
    visibility: "PUBLIC",
    category: "네트워킹",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// GET: 모든 프로그램 조회
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(samplePrograms);
  } catch (error) {
    console.error("Programs API error:", error);
    return NextResponse.json(samplePrograms);
  }
}

// POST: 새 프로그램 생성 (임시 비활성화)
export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "데이터베이스 연결 후 사용 가능합니다." }, { status: 503 });
}
