"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  company?: string;
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
  createdBy: string;
  participations: EventParticipation[];
  comments: EventComment[];
  createdAt: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [userId, setUserId] = useState<number>(0);
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
  const [commentText, setCommentText] = useState<{ [key: number]: string }>({});
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    category: "",
    maxParticipants: undefined as number | undefined,
  });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    const userData = JSON.parse(user);
    const role = userData.role;

    if (role !== "RESIDENT_COMPANY" && role !== "GRADUATED_COMPANY" && role !== "ADMIN") {
      alert("입주기업 및 졸업기업만 이용 가능합니다.");
      router.push("/");
      return;
    }

    setUserRole(role);
    setUserId(userData.id);
    fetchEvents();
  }, [router]);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/calendar/events");
      if (!res.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      alert("일정을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleParticipation = async (eventId: number, status: "ATTENDING" | "NOT_ATTENDING") => {
    try {
      const res = await fetch(`/api/calendar/events/${eventId}/participation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "참여 처리에 실패했습니다.");
      }

      await fetchEvents();
      alert(status === "ATTENDING" ? "신청이 완료되었습니다." : "불참 처리되었습니다.");
    } catch (error) {
      console.error("Participation error:", error);
      alert(error instanceof Error ? error.message : "참여 처리에 실패했습니다.");
    }
  };

  const handleComment = async (eventId: number) => {
    const content = commentText[eventId]?.trim();
    if (!content) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(`/api/calendar/events/${eventId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        throw new Error("댓글 작성에 실패했습니다.");
      }

      setCommentText({ ...commentText, [eventId]: "" });
      await fetchEvents();
    } catch (error) {
      console.error("Comment error:", error);
      alert("댓글 작성에 실패했습니다.");
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEvent.title || !newEvent.startDate) {
      alert("제목과 시작일은 필수입니다.");
      return;
    }

    try {
      const res = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });

      if (!res.ok) {
        throw new Error("일정 생성에 실패했습니다.");
      }

      setNewEvent({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        location: "",
        category: "",
        maxParticipants: undefined,
      });
      setIsCreating(false);
      await fetchEvents();
      alert("일정이 생성되었습니다.");
    } catch (error) {
      console.error("Create event error:", error);
      alert("일정 생성에 실패했습니다.");
    }
  };

  const getMyParticipation = (event: CalendarEvent) => {
    return event.participations.find((p) => p.user.id === userId);
  };

  const getAttendingCount = (event: CalendarEvent) => {
    return event.participations.filter((p) => p.status === "ATTENDING").length;
  };

  // 달력 관련 함수들
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 빈 칸 추가 (이전 달의 날짜)
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-[120px] border border-white/5 bg-white/[0.02] p-2"></div>
      );
    }

    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateEvents = getEventsForDate(date);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`min-h-[120px] cursor-pointer border border-white/10 p-2 transition-all hover:bg-white/10 ${
            isToday ? "bg-blue-500/10 border-blue-500/30" : "bg-white/5"
          } ${isSelected ? "ring-2 ring-blue-500" : ""}`}
        >
          <div className="mb-1 flex items-center justify-between">
            <span className={`text-sm font-semibold ${isToday ? "text-blue-400" : "text-white"}`}>
              {day}
            </span>
            {dateEvents.length > 0 && (
              <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white">
                {dateEvents.length}
              </span>
            )}
          </div>

          <div className="space-y-1">
            {dateEvents.slice(0, 2).map((event) => {
              const myParticipation = getMyParticipation(event);
              return (
                <div
                  key={event.id}
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    myParticipation?.status === "ATTENDING"
                      ? "bg-green-500/20 text-green-400"
                      : myParticipation?.status === "NOT_ATTENDING"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  <div className="truncate">{event.title}</div>
                  <div className="truncate text-[10px] opacity-70">
                    {new Date(event.startDate).toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              );
            })}
            {dateEvents.length > 2 && (
              <div className="text-xs text-gray-500">+{dateEvents.length - 2}개 더</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const renderSelectedDateEvents = () => {
    if (!selectedDate) return null;

    const dateEvents = getEventsForDate(selectedDate);

    if (dateEvents.length === 0) {
      return (
        <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-gray-400">선택한 날짜에 일정이 없습니다.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {dateEvents.map((event) => {
          const myParticipation = getMyParticipation(event);
          const attendingCount = getAttendingCount(event);
          const isExpanded = expandedEvent === event.id;

          return (
            <div
              key={event.id}
              className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              {/* Event Header */}
              <div className="mb-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{event.title}</h3>
                  {event.category && (
                    <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-400">
                      {event.category}
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-sm text-gray-400">
                  <p>
                    {new Date(event.startDate).toLocaleString("ko-KR")}
                    {event.endDate && ` ~ ${new Date(event.endDate).toLocaleString("ko-KR")}`}
                  </p>
                  {event.location && <p>📍 {event.location}</p>}
                  <p>
                    👥 참여: {attendingCount}명
                    {event.maxParticipants && ` / ${event.maxParticipants}명`}
                  </p>
                </div>

                {event.description && <p className="mt-3 text-sm text-gray-300">{event.description}</p>}
              </div>

              {/* Participation Status */}
              {myParticipation && (
                <div
                  className={`mb-4 rounded-lg border p-3 ${
                    myParticipation.status === "ATTENDING"
                      ? "border-green-500/30 bg-green-500/10"
                      : "border-red-500/30 bg-red-500/10"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      myParticipation.status === "ATTENDING" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {myParticipation.status === "ATTENDING" ? "✓ 참여 신청함" : "✗ 불참"}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleParticipation(event.id, "ATTENDING")}
                  disabled={myParticipation?.status === "ATTENDING"}
                  className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  신청
                </button>

                <button
                  onClick={() => handleParticipation(event.id, "NOT_ATTENDING")}
                  disabled={myParticipation?.status === "NOT_ATTENDING"}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  불참
                </button>

                <button
                  onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                  className="rounded-lg bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/30"
                >
                  {isExpanded ? "접기" : `댓글 ${event.comments.length}개`}
                </button>
              </div>

              {/* Comments Section */}
              {isExpanded && (
                <div className="border-t border-white/10 pt-4">
                  <h4 className="mb-3 font-semibold text-white">댓글</h4>

                  {/* Comment Input */}
                  <div className="mb-4 flex gap-2">
                    <input
                      type="text"
                      value={commentText[event.id] || ""}
                      onChange={(e) => setCommentText({ ...commentText, [event.id]: e.target.value })}
                      onKeyPress={(e) => e.key === "Enter" && handleComment(event.id)}
                      className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                      placeholder="댓글을 입력하세요..."
                    />
                    <button
                      onClick={() => handleComment(event.id)}
                      className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                    >
                      등록
                    </button>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3">
                    {event.comments.length === 0 ? (
                      <p className="text-sm text-gray-500">댓글이 없습니다.</p>
                    ) : (
                      event.comments.map((comment) => (
                        <div key={comment.id} className="rounded-lg bg-white/5 p-3">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="font-medium text-white">{comment.user.name}</span>
                            {comment.user.company && (
                              <span className="text-xs text-gray-500">· {comment.user.company}</span>
                            )}
                            <span className="text-xs text-gray-500">
                              · {new Date(comment.createdAt).toLocaleString("ko-KR")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{comment.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">📅 입주기업 전용 캘린더</h1>
            <p className="mt-2 text-sm text-gray-400">센터의 프로그램 일정을 확인하고 참여하세요</p>
          </div>
          <div className="flex gap-2">
            {userRole === "ADMIN" && (
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                일정 추가
              </button>
            )}
            <button
              onClick={() => router.push("/mypage")}
              className="flex items-center gap-2 rounded-lg bg-gray-600/20 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-600/30"
            >
              뒤로 가기
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setViewMode("calendar")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              viewMode === "calendar"
                ? "bg-blue-500 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            달력 보기
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              viewMode === "list"
                ? "bg-blue-500 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            목록 보기
          </button>
        </div>

        {/* Create Event Form */}
        {isCreating && userRole === "ADMIN" && (
          <form
            onSubmit={handleCreateEvent}
            className="mb-6 rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
          >
            <h3 className="mb-4 text-xl font-bold text-white">새 일정 추가</h3>

            <div className="mb-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">제목 *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  placeholder="일정 제목"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">카테고리</label>
                <input
                  type="text"
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  placeholder="예: 멘토링, 교육, 네트워킹"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">시작일시 *</label>
                <input
                  type="datetime-local"
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">종료일시</label>
                <input
                  type="datetime-local"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">장소</label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  placeholder="장소"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">정원</label>
                <input
                  type="number"
                  value={newEvent.maxParticipants || ""}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      maxParticipants: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  placeholder="최대 참여 인원"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-300">설명</label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="일정 설명"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
              >
                생성
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                취소
              </button>
            </div>
          </form>
        )}

        {/* Calendar View */}
        {viewMode === "calendar" ? (
          <div>
            {/* Calendar Header */}
            <div className="mb-4 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
              <button
                onClick={goToPreviousMonth}
                className="rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-white">
                  {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                </h2>
                <button
                  onClick={goToToday}
                  className="rounded-lg bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/30"
                >
                  오늘
                </button>
              </div>

              <button
                onClick={goToNextMonth}
                className="rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4">
              {/* Week days header */}
              <div className="mb-2 grid grid-cols-7 gap-2">
                {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
                  <div
                    key={day}
                    className={`py-2 text-center text-sm font-semibold ${
                      index === 0 ? "text-red-400" : index === 6 ? "text-blue-400" : "text-gray-400"
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
            </div>

            {/* Selected Date Events */}
            {selectedDate && (
              <div>
                <h3 className="mb-4 text-xl font-bold text-white">
                  {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정
                </h3>
                {renderSelectedDateEvents()}
              </div>
            )}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="rounded-lg border border-white/10 bg-white/5 p-12 text-center backdrop-blur-sm">
                <p className="text-gray-400">등록된 일정이 없습니다.</p>
              </div>
            ) : (
              events.map((event) => {
                const myParticipation = getMyParticipation(event);
                const attendingCount = getAttendingCount(event);
                const isExpanded = expandedEvent === event.id;

                return (
                  <div
                    key={event.id}
                    className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-white/20"
                  >
                    {/* Event Header */}
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="text-xl font-bold text-white">{event.title}</h3>
                          {event.category && (
                            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-400">
                              {event.category}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 text-sm text-gray-400">
                          <p className="flex items-center gap-2">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {new Date(event.startDate).toLocaleString("ko-KR")}
                            {event.endDate && ` ~ ${new Date(event.endDate).toLocaleString("ko-KR")}`}
                          </p>

                          {event.location && (
                            <p className="flex items-center gap-2">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              {event.location}
                            </p>
                          )}

                          <p className="flex items-center gap-2">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                            참여: {attendingCount}명
                            {event.maxParticipants && ` / ${event.maxParticipants}명`}
                          </p>

                          <p className="text-xs text-gray-500">
                            생성: {event.createdBy} · {new Date(event.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {event.description && <p className="mt-3 text-sm text-gray-300">{event.description}</p>}
                      </div>
                    </div>

                    {/* Participation Status */}
                    {myParticipation && (
                      <div
                        className={`mb-4 rounded-lg border p-3 ${
                          myParticipation.status === "ATTENDING"
                            ? "border-green-500/30 bg-green-500/10"
                            : "border-red-500/30 bg-red-500/10"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium ${
                            myParticipation.status === "ATTENDING" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {myParticipation.status === "ATTENDING" ? "✓ 참여 신청함" : "✗ 불참"}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleParticipation(event.id, "ATTENDING")}
                        disabled={myParticipation?.status === "ATTENDING"}
                        className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        신청
                      </button>

                      <button
                        onClick={() => handleParticipation(event.id, "NOT_ATTENDING")}
                        disabled={myParticipation?.status === "NOT_ATTENDING"}
                        className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        불참
                      </button>

                      <button
                        onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                        className="rounded-lg bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/30"
                      >
                        {isExpanded ? "접기" : `댓글 ${event.comments.length}개`}
                      </button>
                    </div>

                    {/* Comments Section */}
                    {isExpanded && (
                      <div className="border-t border-white/10 pt-4">
                        <h4 className="mb-3 font-semibold text-white">댓글</h4>

                        {/* Comment Input */}
                        <div className="mb-4 flex gap-2">
                          <input
                            type="text"
                            value={commentText[event.id] || ""}
                            onChange={(e) => setCommentText({ ...commentText, [event.id]: e.target.value })}
                            onKeyPress={(e) => e.key === "Enter" && handleComment(event.id)}
                            className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                            placeholder="댓글을 입력하세요..."
                          />
                          <button
                            onClick={() => handleComment(event.id)}
                            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                          >
                            등록
                          </button>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-3">
                          {event.comments.length === 0 ? (
                            <p className="text-sm text-gray-500">댓글이 없습니다.</p>
                          ) : (
                            event.comments.map((comment) => (
                              <div key={comment.id} className="rounded-lg bg-white/5 p-3">
                                <div className="mb-1 flex items-center gap-2">
                                  <span className="font-medium text-white">{comment.user.name}</span>
                                  {comment.user.company && (
                                    <span className="text-xs text-gray-500">· {comment.user.company}</span>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    · {new Date(comment.createdAt).toLocaleString("ko-KR")}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-300">{comment.content}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
