"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NoticeManager } from "./components/NoticeManager";
import { CompanyManager } from "./components/CompanyManager";
import { ProgramManager } from "./components/ProgramManager";
import { PartnerManager } from "./components/PartnerManager";
import { UserManager } from "./components/UserManager";

type Tab = "notices" | "companies" | "programs" | "partners" | "users";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("notices");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verify admin role on client side
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== "ADMIN") {
      alert("관리자 권한이 필요합니다.");
      router.push("/");
      return;
    }

    setIsLoading(false);
  }, [router]);

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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const tabs = [
    { id: "notices" as Tab, label: "공지사항 관리" },
    { id: "companies" as Tab, label: "입주기업 관리" },
    { id: "programs" as Tab, label: "프로그램 관리" },
    { id: "partners" as Tab, label: "협력기관 관리" },
    { id: "users" as Tab, label: "회원 관리" },
  ];

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

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">관리자 대시보드</h1>
            <p className="mt-2 text-sm text-gray-400">
              성북구 중장년 기술창업센터 콘텐츠 관리
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 rounded-lg bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/30"
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
              메인으로
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

        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto border-b border-white/10 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
          {activeTab === "notices" && <NoticeManager />}
          {activeTab === "companies" && <CompanyManager />}
          {activeTab === "programs" && <ProgramManager />}
          {activeTab === "partners" && <PartnerManager />}
          {activeTab === "users" && <UserManager />}
        </div>
      </div>
    </div>
  );
}
