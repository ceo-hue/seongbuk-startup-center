/**
 * Calendar Stats API - HOVCS 2.0 Conservative Core 적용
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { isMemberCompany, isAdmin } from "@/lib/permissions";
import { withErrorHandler } from "@/lib/core/error/error-handler";
import { logInfo, logWarning } from "@/lib/core/error/error-logger";

// GET: 사용자 참여 통계 조회 (정회원 전용)
export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  // 정회원 또는 관리자만 접근 가능
  if (!isMemberCompany(user.role as any) && !isAdmin(user.role as any)) {
    await logWarning('통계 조회 거부 - 권한 부족', { userId: user.userId, role: user.role });
    return NextResponse.json(
      { error: "정회원만 이용 가능합니다." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  const userId = searchParams.get("userId") || user.userId.toString();

  // 날짜 범위 설정
  let startDate: Date;
  let endDate: Date;

  if (year && month) {
    // 특정 월의 통계
    startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
  } else if (year) {
    // 특정 년도의 통계
    startDate = new Date(parseInt(year), 0, 1);
    endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
  } else {
    // 현재 월의 통계
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }

  // 해당 기간의 모든 이벤트
  const events = await prisma.calendarEvent.findMany({
    where: {
      startDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      title: true,
      startDate: true,
    },
  });

  // 사용자의 참여 기록
  const participations = await prisma.eventParticipation.findMany({
    where: {
      userId: parseInt(userId),
      eventId: {
        in: events.map((e) => e.id),
      },
    },
  });

  // 통계 계산
  const totalEvents = events.length;
  const attendedCount = participations.filter(
    (p) => p.status === "ATTENDING"
  ).length;
  const notAttendedCount = participations.filter(
    (p) => p.status === "NOT_ATTENDING"
  ).length;
  const pendingCount = totalEvents - attendedCount - notAttendedCount;
  const attendanceRate =
    totalEvents > 0 ? (attendedCount / totalEvents) * 100 : 0;

  // 월별 통계 (년도 통계인 경우)
  let monthlyStats: any[] = [];
  if (year && !month) {
    for (let m = 0; m < 12; m++) {
      const monthStart = new Date(parseInt(year), m, 1);
      const monthEnd = new Date(parseInt(year), m + 1, 0, 23, 59, 59);

      const monthEvents = events.filter(
        (e) => e.startDate >= monthStart && e.startDate <= monthEnd
      );

      const monthParticipations = participations.filter((p) => {
        const event = events.find((e) => e.id === p.eventId);
        return event && event.startDate >= monthStart && event.startDate <= monthEnd;
      });

      const monthAttended = monthParticipations.filter(
        (p) => p.status === "ATTENDING"
      ).length;
      const monthTotal = monthEvents.length;

      monthlyStats.push({
        month: m + 1,
        totalEvents: monthTotal,
        attended: monthAttended,
        notAttended: monthParticipations.filter(
          (p) => p.status === "NOT_ATTENDING"
        ).length,
        pending: monthTotal - monthAttended - monthParticipations.filter(
          (p) => p.status === "NOT_ATTENDING"
        ).length,
        attendanceRate: monthTotal > 0 ? (monthAttended / monthTotal) * 100 : 0,
      });
    }
  }

  await logInfo('통계 조회', { userId: parseInt(userId), year, month, totalEvents });

  return NextResponse.json({
    period: {
      year: year ? parseInt(year) : new Date().getFullYear(),
      month: month ? parseInt(month) : undefined,
      startDate,
      endDate,
    },
    totalEvents,
    attended: attendedCount,
    notAttended: notAttendedCount,
    pending: pendingCount,
    attendanceRate: Math.round(attendanceRate * 10) / 10, // 소수점 1자리
    monthlyStats: monthlyStats.length > 0 ? monthlyStats : undefined,
  });
});
