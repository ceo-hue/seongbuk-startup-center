"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function TopNav() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef<HTMLLIElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      setIsLoggedIn(true);
      const userData = JSON.parse(user);
      setUserName(userData.name);
      setUserRole(userData.role);
    }
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      setUserName("");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setShowMobileMenu(false); // 모바일 메뉴 닫기
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // 네비게이션 바 높이
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#050609]/40 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-sm text-gray-200 md:px-6 md:py-4">
        {/* 로고/센터명 */}
        <div
          className="flex-shrink-0 cursor-pointer text-sm font-semibold tracking-tight text-white/90 md:text-base"
          onClick={() => scrollToSection("hero")}
        >
          성북구 중장년 기술창업센터
        </div>

        {/* 데스크톱 메뉴 */}
        <ul className="hidden items-center gap-6 md:flex">
          <li
            className="cursor-pointer transition-colors hover:text-white"
            onClick={() => scrollToSection("hero")}
          >
            센터소개
          </li>
          <li
            className="cursor-pointer transition-colors hover:text-white"
            onClick={() => scrollToSection("programs")}
          >
            지원 프로그램
          </li>
          <li
            className="cursor-pointer transition-colors hover:text-white"
            onClick={() => scrollToSection("companies")}
          >
            입주·졸업기업 소개
          </li>
          <li
            className="cursor-pointer transition-colors hover:text-white"
            onClick={() => scrollToSection("notices")}
          >
            공지글
          </li>
          <li
            className="cursor-pointer transition-colors hover:text-white"
            onClick={() => scrollToSection("partners")}
          >
            창업지원 기관
          </li>
          <li
            className="cursor-pointer transition-colors hover:text-white"
            onClick={() => scrollToSection("contact")}
          >
            문의하기
          </li>
          {!mounted ? (
            // Placeholder to match server render
            <li>
              <button
                className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium text-white transition-all hover:border-white/50 hover:bg-white/20"
                disabled
              >
                <span className="w-12">&nbsp;</span>
              </button>
            </li>
          ) : isLoggedIn ? (
            <li className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium text-white transition-all hover:border-white/50 hover:bg-white/20"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>{userName}님</span>
                <svg
                  className={`h-3 w-3 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-xl">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        router.push("/mypage");
                        setShowUserMenu(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      마이페이지
                    </button>

                    {userRole === "ADMIN" && (
                      <button
                        onClick={() => {
                          router.push("/admin");
                          setShowUserMenu(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
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
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        관리자 페이지
                      </button>
                    )}

                    <div className="my-1 border-t border-white/10"></div>

                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
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
              )}
            </li>
          ) : (
            <li>
              <button
                onClick={() => router.push("/login")}
                className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium text-white transition-all hover:border-white/50 hover:bg-white/20"
              >
                로그인
              </button>
            </li>
          )}
        </ul>

        {/* 모바일 햄버거 버튼 + 로그인 */}
        <div className="flex items-center gap-3 md:hidden">
          {/* 로그인 버튼 (모바일) */}
          {!mounted ? (
            <button
              className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium text-white"
              disabled
            >
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </button>
          ) : isLoggedIn ? (
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium text-white"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium text-white"
            >
              로그인
            </button>
          )}

          {/* 햄버거 버튼 */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="메뉴"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showMobileMenu ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* 모바일 메뉴 드롭다운 */}
      {showMobileMenu && (
        <div
          ref={mobileMenuRef}
          className="border-t border-white/10 bg-[#050609]/95 backdrop-blur-xl md:hidden"
        >
          <ul className="mx-auto max-w-6xl space-y-1 px-4 py-3">
            <li
              className="cursor-pointer rounded-lg px-4 py-3 transition-colors hover:bg-white/10"
              onClick={() => scrollToSection("hero")}
            >
              센터소개
            </li>
            <li
              className="cursor-pointer rounded-lg px-4 py-3 transition-colors hover:bg-white/10"
              onClick={() => scrollToSection("programs")}
            >
              지원 프로그램
            </li>
            <li
              className="cursor-pointer rounded-lg px-4 py-3 transition-colors hover:bg-white/10"
              onClick={() => scrollToSection("companies")}
            >
              입주·졸업기업 소개
            </li>
            <li
              className="cursor-pointer rounded-lg px-4 py-3 transition-colors hover:bg-white/10"
              onClick={() => scrollToSection("notices")}
            >
              공지글
            </li>
            <li
              className="cursor-pointer rounded-lg px-4 py-3 transition-colors hover:bg-white/10"
              onClick={() => scrollToSection("partners")}
            >
              창업지원 기관
            </li>
            <li
              className="cursor-pointer rounded-lg px-4 py-3 transition-colors hover:bg-white/10"
              onClick={() => scrollToSection("contact")}
            >
              문의하기
            </li>

            {/* 로그인된 경우 모바일 메뉴에 추가 옵션 */}
            {isLoggedIn && (
              <>
                <div className="my-2 border-t border-white/10"></div>
                <li
                  className="cursor-pointer rounded-lg px-4 py-3 transition-colors hover:bg-white/10"
                  onClick={() => {
                    router.push("/mypage");
                    setShowMobileMenu(false);
                  }}
                >
                  마이페이지
                </li>
                {userRole === "ADMIN" && (
                  <li
                    className="cursor-pointer rounded-lg px-4 py-3 transition-colors hover:bg-white/10"
                    onClick={() => {
                      router.push("/admin");
                      setShowMobileMenu(false);
                    }}
                  >
                    관리자 페이지
                  </li>
                )}
                <li
                  className="cursor-pointer rounded-lg px-4 py-3 text-red-400 transition-colors hover:bg-red-500/10"
                  onClick={() => {
                    handleLogout();
                    setShowMobileMenu(false);
                  }}
                >
                  로그아웃
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
