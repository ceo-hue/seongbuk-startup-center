"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileSection } from "./components/ProfileSection";
import { ApplicationsList } from "./components/ApplicationsList";
import { CalendarSection } from "./components/CalendarSection";
import { CompanyStatus } from "./components/CompanyStatus";
import { ROLE_LABELS, type UserRole } from "@/lib/permissions";

interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  company?: string;
  position?: string;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  loginCount: number;
}

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "applications" | "calendar" | "companyStatus">("profile");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 로컬스토리지에서 사용자 정보 가져오기
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
    } catch (error) {
      console.error("Failed to parse user data:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        {/* 🔹 1. 배경 이미지 레이어 */}
        <div
          className="pointer-events-none fixed inset-0 -z-30 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=90&w=3840')"
          }}
        />

        {/* 🔹 2. 다크 오버레이 (텍스트 가독성) */}
        <div className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-b from-[#050609]/70 via-[#050609]/75 to-[#050609]/80" />

        {/* 🔹 3. 컬러 그라디언트 레이어 */}
        <div
          className="pointer-events-none fixed inset-0 -z-10 mix-blend-screen opacity-25"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(68,132,255,0.3), transparent 60%), radial-gradient(circle at 70% 80%, rgba(255,87,87,0.25), transparent 55%)"
          }}
        />

        <div className="text-white">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative min-h-screen">
      {/* 🔹 1. 배경 이미지 레이어 */}
      <div
        className="pointer-events-none fixed inset-0 -z-30 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=90&w=3840')"
        }}
      />

      {/* 🔹 2. 다크 오버레이 (텍스트 가독성) */}
      <div className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-b from-[#050609]/70 via-[#050609]/75 to-[#050609]/80" />

      {/* 🔹 3. 컬러 그라디언트 레이어 */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 mix-blend-screen opacity-25"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(68,132,255,0.3), transparent 60%), radial-gradient(circle at 70% 80%, rgba(255,87,87,0.25), transparent 55%)"
        }}
      />

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">마이페이지</h1>
            <p className="mt-2 text-sm text-gray-400">
              {user.name}님의 정보와 활동 내역을 확인하세요
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 rounded-lg bg-gray-600/20 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-600/30"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              홈으로
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              로그아웃
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-400">
                  {ROLE_LABELS[user.role]}
                </span>
                {!user.isVerified && (
                  <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-sm font-medium text-yellow-400">
                    승인 대기
                  </span>
                )}
              </div>
              <p className="mt-1 text-gray-400">{user.email}</p>
              {user.company && (
                <p className="mt-1 text-sm text-gray-500">
                  {user.company} {user.position && `· ${user.position}`}
                </p>
              )}
            </div>
            <div className="text-right text-sm text-gray-400">
              <p>가입일: {new Date(user.createdAt).toLocaleDateString()}</p>
              <p>로그인 {user.loginCount}회</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "profile"
                ? "bg-blue-500/20 text-blue-400"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            프로필 정보
          </button>
          {(user.role === "RESIDENT_COMPANY" || user.role === "GRADUATED_COMPANY" || user.role === "ADMIN") && (
            <button
              onClick={() => setActiveTab("calendar")}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "calendar"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              센터일정
            </button>
          )}
          <button
            onClick={() => setActiveTab("applications")}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "applications"
                ? "bg-blue-500/20 text-blue-400"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            신청 내역
          </button>
          {user.role === "ADMIN" && (
            <button
              onClick={() => setActiveTab("companyStatus")}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "companyStatus"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              입주/졸업기업 현황
            </button>
          )}
        </div>

        {/* Content */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          {activeTab === "profile" && <ProfileSection user={user} />}
          {activeTab === "calendar" && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">입주기업 전용 캘린더</h3>
                <p className="mt-2 text-sm text-gray-400">
                  센터의 프로그램 일정을 확인하고 참여 신청을 할 수 있습니다
                  {user.role === "ADMIN" && " · 관리자는 일정을 생성/삭제할 수 있습니다"}
                </p>
              </div>
              <CalendarSection userId={user.id} userRole={user.role} />
            </div>
          )}
          {activeTab === "applications" && <ApplicationsList userId={user.id} />}
          {activeTab === "companyStatus" && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">입주/졸업기업 현황 관리</h3>
                <p className="mt-2 text-sm text-gray-400">
                  모든 입주 및 졸업기업의 센터일정 참여 누적 현황을 확인하고 관리할 수 있습니다
                </p>
              </div>
              <CompanyStatus />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
