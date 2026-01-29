/**
 * Notices API - 임시 샘플 데이터 버전
 */

import { NextRequest, NextResponse } from "next/server";

// 샘플 데이터
const sampleNotices = [
  {
    id: 1,
    title: "2024년 상반기 입주기업 모집 공고",
    content: "성북구 중장년기술창업센터에서 2024년 상반기 입주기업을 모집합니다.",
    category: "공지",
    author: "관리자",
    views: 150,
    date: "2024-01-15",
    images: [],
    files: [],
    visibility: "PUBLIC",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "창업 멘토링 프로그램 참가자 모집",
    content: "전문가와 함께하는 1:1 창업 멘토링 프로그램 참가자를 모집합니다.",
    category: "모집",
    author: "관리자",
    views: 89,
    date: "2024-01-10",
    images: [],
    files: [],
    visibility: "PUBLIC",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "설 연휴 운영 안내",
    content: "설 연휴 기간 센터 운영 시간을 안내드립니다.",
    category: "안내",
    author: "관리자",
    views: 45,
    date: "2024-01-05",
    images: [],
    files: [],
    visibility: "PUBLIC",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// GET: 모든 공지사항 조회
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(sampleNotices);
  } catch (error) {
    console.error("Notices API error:", error);
    return NextResponse.json(sampleNotices);
  }
}

// POST: 새 공지사항 생성 (임시 비활성화)
export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "데이터베이스 연결 후 사용 가능합니다." }, { status: 503 });
}
