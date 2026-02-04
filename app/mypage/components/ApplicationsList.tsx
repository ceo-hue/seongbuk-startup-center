"use client";

import { useState, useEffect } from "react";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from "@/lib/permissions";

interface Application {
  id: number;
  programTitle: string;
  status: string;
  message?: string;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface EventParticipation {
  id: number;
  status: string;
  user: User;
  createdAt: string;
}

interface EventComment {
  id: number;
  content: string;
  user: User;
  createdAt: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  category?: string;
  maxParticipants?: number;
  participations: EventParticipation[];
  comments: EventComment[];
  createdAt: string;
}

interface ApplicationsListProps {
  userId: number;
}

export function ApplicationsList({ userId }: ApplicationsListProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
    fetchCalendarEvents();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      const res = await fetch("/api/calendar/events");
      if (res.ok) {
        const data = await res.json();
        setCalendarEvents(data);
      }
    } catch (error) {
      console.error("Failed to fetch calendar events:", error);
    }
  };

  const getMyParticipation = (event: CalendarEvent) => {
    return event.participations.find((p) => p.user.id === userId);
  };

  const getMyComments = (event: CalendarEvent) => {
    return event.comments.filter((c) => c.user.id === userId);
  };

  const getParticipationStatus = (event: CalendarEvent) => {
    const participation = getMyParticipation(event);
    if (!participation) return "NOT_PARTICIPATED";
    return participation.status;
  };

  // 통계 계산
  const stats = {
    attending: calendarEvents.filter((e) => getParticipationStatus(e) === "ATTENDING").length,
    notAttending: calendarEvents.filter((e) => getParticipationStatus(e) === "NOT_ATTENDING").length,
    notParticipated: calendarEvents.filter((e) => getParticipationStatus(e) === "NOT_PARTICIPATED").length,
    totalComments: calendarEvents.reduce((sum, e) => sum + getMyComments(e).length, 0),
  };

  if (isLoading) {
    return <div className="text-center text-gray-400">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 프로그램 신청 내역 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">프로그램 신청 내역</h3>
          <span className="text-sm text-gray-400">총 {applications.length}건</span>
        </div>

        {applications.length === 0 ? (
          <div className="rounded-lg bg-white/5 p-8 text-center">
            <p className="text-gray-400">아직 신청 내역이 없습니다.</p>
            <p className="mt-2 text-sm text-gray-500">
              프로그램에 신청하면 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.id}
                className="rounded-lg bg-white/5 p-4 transition-colors hover:bg-white/10"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white">
                      {application.programTitle}
                    </h4>
                    <p className="mt-1 text-sm text-gray-400">
                      신청일: {new Date(application.appliedAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      APPLICATION_STATUS_COLORS[application.status]
                    }`}
                  >
                    {APPLICATION_STATUS_LABELS[application.status]}
                  </span>
                </div>

                {application.message && (
                  <div className="mb-3 rounded-lg bg-white/5 p-3">
                    <p className="text-sm text-gray-400">신청 메시지:</p>
                    <p className="mt-1 text-sm text-white">{application.message}</p>
                  </div>
                )}

                {application.reviewedAt && (
                  <div className="mt-3 rounded-lg border-t border-white/10 pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        검토일: {new Date(application.reviewedAt).toLocaleDateString("ko-KR")}
                      </span>
                      {application.reviewedBy && (
                        <span className="text-gray-400">검토자: {application.reviewedBy}</span>
                      )}
                    </div>
                    {application.reviewNote && (
                      <div className="mt-2 rounded-lg bg-white/5 p-3">
                        <p className="text-sm text-gray-400">검토 의견:</p>
                        <p className="mt-1 text-sm text-white">{application.reviewNote}</p>
                      </div>
                    )}
                  </div>
                )}

                {application.status === "PENDING" && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-yellow-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>관리자 검토 중입니다</span>
                  </div>
                )}

                {application.status === "APPROVED" && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>신청이 승인되었습니다</span>
                  </div>
                )}

                {application.status === "REJECTED" && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>신청이 반려되었습니다</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 센터일정 참여 현황 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">센터일정 참여 현황</h3>
          <span className="text-sm text-gray-400">총 {calendarEvents.length}개 이벤트</span>
        </div>

        {/* 통계 요약 */}
        <div className="mb-4 grid grid-cols-4 gap-3">
          <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-3">
            <div className="text-2xl font-bold text-green-400">{stats.attending}</div>
            <div className="mt-1 text-xs text-green-400/70">참여</div>
          </div>
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
            <div className="text-2xl font-bold text-red-400">{stats.notAttending}</div>
            <div className="mt-1 text-xs text-red-400/70">불참</div>
          </div>
          <div className="rounded-lg bg-gray-500/10 border border-gray-500/30 p-3">
            <div className="text-2xl font-bold text-gray-400">{stats.notParticipated}</div>
            <div className="mt-1 text-xs text-gray-400/70">미참여</div>
          </div>
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-3">
            <div className="text-2xl font-bold text-blue-400">{stats.totalComments}</div>
            <div className="mt-1 text-xs text-blue-400/70">댓글</div>
          </div>
        </div>

        {/* 이벤트 목록 */}
        {calendarEvents.length === 0 ? (
          <div className="rounded-lg bg-white/5 p-8 text-center">
            <p className="text-gray-400">아직 등록된 센터일정이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {calendarEvents.map((event) => {
              const status = getParticipationStatus(event);
              const myComments = getMyComments(event);

              return (
                <div
                  key={event.id}
                  className="rounded-lg bg-white/5 p-4 transition-colors hover:bg-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white">{event.title}</h4>
                        {event.category && (
                          <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">
                            {event.category}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(event.startDate).toLocaleString("ko-KR")}
                        {event.location && ` · ${event.location}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {status === "ATTENDING" && (
                        <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                          ✓ 참여
                        </span>
                      )}
                      {status === "NOT_ATTENDING" && (
                        <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
                          ✗ 불참
                        </span>
                      )}
                      {status === "NOT_PARTICIPATED" && (
                        <span className="rounded-full bg-gray-500/20 px-3 py-1 text-xs font-medium text-gray-400">
                          미참여
                        </span>
                      )}
                      {myComments.length > 0 && (
                        <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-400">
                          💬 {myComments.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
