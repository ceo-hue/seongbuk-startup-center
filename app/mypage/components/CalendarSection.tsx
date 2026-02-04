"use client";

import { useState, useEffect } from "react";

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

interface CalendarSectionProps {
  userId: number;
  userRole?: string;
}

export function CalendarSection({ userId, userRole }: CalendarSectionProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
  const [commentText, setCommentText] = useState<{ [key: number]: string }>({});
  const [isCreating, setIsCreating] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    category: "",
    maxParticipants: undefined as number | undefined,
  });

  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/calendar/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
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

      if (!res.ok) throw new Error("댓글 작성에 실패했습니다.");

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
      alert("제목과 시작일시는 필수입니다.");
      return;
    }

    try {
      const res = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });

      if (!res.ok) throw new Error("일정 생성에 실패했습니다.");

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

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm("정말 이 일정을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const res = await fetch(`/api/calendar/events/${eventId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("일정 삭제에 실패했습니다.");

      await fetchEvents();
      alert("일정이 삭제되었습니다.");
    } catch (error) {
      console.error("Delete event error:", error);
      alert("일정 삭제에 실패했습니다.");
    }
  };

  const getMyParticipation = (event: CalendarEvent) => {
    return event.participations.find((p) => p.user.id === userId);
  };

  const getAttendingCount = (event: CalendarEvent) => {
    return event.participations.filter((p) => p.status === "ATTENDING").length;
  };

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

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-[100px] border border-white/5 bg-white/[0.02] p-2"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateEvents = getEventsForDate(date);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`min-h-[100px] cursor-pointer border border-white/10 p-2 transition-all hover:bg-white/10 ${
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
            <div key={event.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="mb-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white">{event.title}</h4>
                    {event.category && (
                      <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">
                        {event.category}
                      </span>
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="flex items-center gap-1 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      삭제
                    </button>
                  )}
                </div>

                <div className="space-y-1 text-xs text-gray-400">
                  <p>
                    {new Date(event.startDate).toLocaleString("ko-KR")}
                    {event.endDate && ` ~ ${new Date(event.endDate).toLocaleString("ko-KR")}`}
                  </p>
                  {event.location && <p>📍 {event.location}</p>}
                  <p>
                    👥 참여: {attendingCount}명{event.maxParticipants && ` / ${event.maxParticipants}명`}
                  </p>
                </div>

                {event.description && <p className="mt-2 text-xs text-gray-300">{event.description}</p>}
              </div>

              {myParticipation && (
                <div
                  className={`mb-3 rounded-lg border p-2 ${
                    myParticipation.status === "ATTENDING"
                      ? "border-green-500/30 bg-green-500/10"
                      : "border-red-500/30 bg-red-500/10"
                  }`}
                >
                  <p
                    className={`text-xs font-medium ${
                      myParticipation.status === "ATTENDING" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {myParticipation.status === "ATTENDING" ? "✓ 참여 신청함" : "✗ 불참"}
                  </p>
                </div>
              )}

              <div className="mb-3 flex flex-wrap gap-2">
                <button
                  onClick={() => handleParticipation(event.id, "ATTENDING")}
                  disabled={myParticipation?.status === "ATTENDING"}
                  className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  신청
                </button>

                <button
                  onClick={() => handleParticipation(event.id, "NOT_ATTENDING")}
                  disabled={myParticipation?.status === "NOT_ATTENDING"}
                  className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  불참
                </button>

                <button
                  onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                  className="rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-400 transition-colors hover:bg-blue-500/30"
                >
                  {isExpanded ? "접기" : `댓글 ${event.comments.length}개`}
                </button>
              </div>

              {isExpanded && (
                <div className="border-t border-white/10 pt-3">
                  <h5 className="mb-2 text-sm font-semibold text-white">댓글</h5>

                  <div className="mb-3 flex gap-2">
                    <input
                      type="text"
                      value={commentText[event.id] || ""}
                      onChange={(e) => setCommentText({ ...commentText, [event.id]: e.target.value })}
                      onKeyPress={(e) => e.key === "Enter" && handleComment(event.id)}
                      className="flex-1 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                      placeholder="댓글을 입력하세요..."
                    />
                    <button
                      onClick={() => handleComment(event.id)}
                      className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
                    >
                      등록
                    </button>
                  </div>

                  <div className="space-y-2">
                    {event.comments.length === 0 ? (
                      <p className="text-xs text-gray-500">댓글이 없습니다.</p>
                    ) : (
                      event.comments.map((comment) => (
                        <div key={comment.id} className="rounded-lg bg-white/5 p-2">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-xs font-medium text-white">{comment.user.name}</span>
                            {comment.user.company && (
                              <span className="text-[10px] text-gray-500">· {comment.user.company}</span>
                            )}
                            <span className="text-[10px] text-gray-500">
                              · {new Date(comment.createdAt).toLocaleString("ko-KR")}
                            </span>
                          </div>
                          <p className="text-xs text-gray-300">{comment.content}</p>
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
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Admin Controls */}
      {isAdmin && (
        <div className="mb-4">
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isCreating ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"}
              />
            </svg>
            {isCreating ? "취소" : "일정 생성"}
          </button>
        </div>
      )}

      {/* Create Event Form */}
      {isAdmin && isCreating && (
        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-4">
          <h3 className="mb-3 text-lg font-semibold text-white">새 일정 만들기</h3>
          <form onSubmit={handleCreateEvent} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                제목 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="일정 제목을 입력하세요"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">설명</label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="일정 설명을 입력하세요"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  시작일시 <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={newEvent.startDate}
                  onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">종료일시</label>
                <input
                  type="datetime-local"
                  value={newEvent.endDate}
                  onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">장소</label>
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="장소를 입력하세요"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">카테고리</label>
                <input
                  type="text"
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  placeholder="예: 멘토링, 교육, 네트워킹"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">최대 참여자 수</label>
                <input
                  type="number"
                  value={newEvent.maxParticipants || ""}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      maxParticipants: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  placeholder="제한 없음"
                  min="1"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
            >
              일정 만들기
            </button>
          </form>
        </div>
      )}

      {/* Calendar Header */}
      <div className="mb-4 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
        <button
          onClick={goToPreviousMonth}
          className="rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-white">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </h3>
          <button
            onClick={goToToday}
            className="rounded-lg bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-400 transition-colors hover:bg-blue-500/30"
          >
            오늘
          </button>
        </div>

        <button
          onClick={goToNextMonth}
          className="rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3">
        <div className="mb-2 grid grid-cols-7 gap-1">
          {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
            <div
              key={day}
              className={`py-1 text-center text-xs font-semibold ${
                index === 0 ? "text-red-400" : index === 6 ? "text-blue-400" : "text-gray-400"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div>
          <h4 className="mb-3 text-lg font-bold text-white">
            {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정
          </h4>
          {renderSelectedDateEvents()}
        </div>
      )}
    </div>
  );
}
