"use client";

import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  company?: string;
  role: string;
  createdAt: string;
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

interface CompanyStats {
  userId: number;
  userName: string;
  userEmail: string;
  company: string;
  role: string;
  attending: number;
  notAttending: number;
  notParticipated: number;
  totalComments: number;
  joinedAt: string;
}

export function CompanyStatus() {
  const [companies, setCompanies] = useState<User[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<keyof CompanyStats>("attending");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, eventsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/calendar/events"),
      ]);

      if (usersRes.ok && eventsRes.ok) {
        const usersData = await usersRes.json();
        const eventsData = await eventsRes.json();

        // 입주기업과 졸업기업만 필터링
        const companyUsers = usersData.filter(
          (user: User) =>
            user.role === "RESIDENT_COMPANY" || user.role === "GRADUATED_COMPANY"
        );

        setCompanies(companyUsers);
        setEvents(eventsData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCompanyStats = (): CompanyStats[] => {
    return companies.map((company) => {
      const attending = events.filter((event) =>
        event.participations.some(
          (p) => p.user.id === company.id && p.status === "ATTENDING"
        )
      ).length;

      const notAttending = events.filter((event) =>
        event.participations.some(
          (p) => p.user.id === company.id && p.status === "NOT_ATTENDING"
        )
      ).length;

      const participatedEvents = events.filter((event) =>
        event.participations.some((p) => p.user.id === company.id)
      ).length;

      const notParticipated = events.length - participatedEvents;

      const totalComments = events.reduce((sum, event) => {
        return (
          sum + event.comments.filter((c) => c.user.id === company.id).length
        );
      }, 0);

      return {
        userId: company.id,
        userName: company.name,
        userEmail: company.email,
        company: company.company || "미등록",
        role: company.role,
        attending,
        notAttending,
        notParticipated,
        totalComments,
        joinedAt: company.createdAt,
      };
    });
  };

  const sortedStats = () => {
    const stats = getCompanyStats();
    return stats.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  };

  const handleSort = (field: keyof CompanyStats) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getRoleLabel = (role: string) => {
    return role === "RESIDENT_COMPANY" ? "입주기업" : "졸업기업";
  };

  const getRoleBadgeColor = (role: string) => {
    return role === "RESIDENT_COMPANY"
      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
      : "bg-purple-500/20 text-purple-400 border-purple-500/30";
  };

  if (isLoading) {
    return <div className="text-center text-gray-400">로딩 중...</div>;
  }

  const stats = sortedStats();
  const totalStats = {
    attending: stats.reduce((sum, s) => sum + s.attending, 0),
    notAttending: stats.reduce((sum, s) => sum + s.notAttending, 0),
    notParticipated: stats.reduce((sum, s) => sum + s.notParticipated, 0),
    totalComments: stats.reduce((sum, s) => sum + s.totalComments, 0),
  };

  return (
    <div className="space-y-6">
      {/* 전체 통계 요약 */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">전체 통계</h3>
            <p className="mt-1 text-sm text-gray-400">
              총 {companies.length}개 기업 · {events.length}개 이벤트
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <div className="text-3xl font-bold text-green-400">
              {totalStats.attending}
            </div>
            <div className="mt-1 text-sm text-green-400/70">총 참여</div>
          </div>
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <div className="text-3xl font-bold text-red-400">
              {totalStats.notAttending}
            </div>
            <div className="mt-1 text-sm text-red-400/70">총 불참</div>
          </div>
          <div className="rounded-lg border border-gray-500/30 bg-gray-500/10 p-4">
            <div className="text-3xl font-bold text-gray-400">
              {totalStats.notParticipated}
            </div>
            <div className="mt-1 text-sm text-gray-400/70">총 미참여</div>
          </div>
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
            <div className="text-3xl font-bold text-blue-400">
              {totalStats.totalComments}
            </div>
            <div className="mt-1 text-sm text-blue-400/70">총 댓글</div>
          </div>
        </div>
      </div>

      {/* 기업별 상세 통계 */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">기업별 현황</h3>

        {companies.length === 0 ? (
          <div className="rounded-lg bg-white/5 p-8 text-center">
            <p className="text-gray-400">등록된 입주/졸업기업이 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/5">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th
                    onClick={() => handleSort("userName")}
                    className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-gray-300 transition-colors hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      이름
                      {sortBy === "userName" && (
                        <span className="text-blue-400">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("company")}
                    className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-gray-300 transition-colors hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      회사명
                      {sortBy === "company" && (
                        <span className="text-blue-400">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("role")}
                    className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-gray-300 transition-colors hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      구분
                      {sortBy === "role" && (
                        <span className="text-blue-400">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("attending")}
                    className="cursor-pointer px-4 py-3 text-center text-sm font-semibold text-gray-300 transition-colors hover:bg-white/5"
                  >
                    <div className="flex items-center justify-center gap-2">
                      참여
                      {sortBy === "attending" && (
                        <span className="text-blue-400">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("notAttending")}
                    className="cursor-pointer px-4 py-3 text-center text-sm font-semibold text-gray-300 transition-colors hover:bg-white/5"
                  >
                    <div className="flex items-center justify-center gap-2">
                      불참
                      {sortBy === "notAttending" && (
                        <span className="text-blue-400">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("notParticipated")}
                    className="cursor-pointer px-4 py-3 text-center text-sm font-semibold text-gray-300 transition-colors hover:bg-white/5"
                  >
                    <div className="flex items-center justify-center gap-2">
                      미참여
                      {sortBy === "notParticipated" && (
                        <span className="text-blue-400">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("totalComments")}
                    className="cursor-pointer px-4 py-3 text-center text-sm font-semibold text-gray-300 transition-colors hover:bg-white/5"
                  >
                    <div className="flex items-center justify-center gap-2">
                      댓글
                      {sortBy === "totalComments" && (
                        <span className="text-blue-400">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("joinedAt")}
                    className="cursor-pointer px-4 py-3 text-left text-sm font-semibold text-gray-300 transition-colors hover:bg-white/5"
                  >
                    <div className="flex items-center gap-2">
                      가입일
                      {sortBy === "joinedAt" && (
                        <span className="text-blue-400">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat) => (
                  <tr
                    key={stat.userId}
                    className="border-b border-white/5 transition-colors hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-white">
                          {stat.userName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {stat.userEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {stat.company}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full border px-2 py-1 text-xs font-medium ${getRoleBadgeColor(
                          stat.role
                        )}`}
                      >
                        {getRoleLabel(stat.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-green-500/20 px-3 py-1 text-sm font-bold text-green-400">
                        {stat.attending}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-red-500/20 px-3 py-1 text-sm font-bold text-red-400">
                        {stat.notAttending}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-gray-500/20 px-3 py-1 text-sm font-bold text-gray-400">
                        {stat.notParticipated}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-blue-500/20 px-3 py-1 text-sm font-bold text-blue-400">
                        {stat.totalComments}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(stat.joinedAt).toLocaleDateString("ko-KR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 안내 메시지 */}
      <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-300">
            <p className="font-medium">기업 관리 안내</p>
            <p className="mt-1 text-blue-400/70">
              각 열 제목을 클릭하여 정렬할 수 있습니다. 참여율이 낮은 기업은
              별도로 관리가 필요할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
