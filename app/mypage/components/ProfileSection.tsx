"use client";

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

interface ProfileSectionProps {
  user: User;
}

export function ProfileSection({ user }: ProfileSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">기본 정보</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
            <span className="text-gray-400">이름</span>
            <span className="font-medium text-white">{user.name}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
            <span className="text-gray-400">이메일</span>
            <span className="font-medium text-white">{user.email}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
            <span className="text-gray-400">회원 등급</span>
            <span className="font-medium text-white">{ROLE_LABELS[user.role]}</span>
          </div>
          {user.phone && (
            <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
              <span className="text-gray-400">연락처</span>
              <span className="font-medium text-white">{user.phone}</span>
            </div>
          )}
          {user.company && (
            <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
              <span className="text-gray-400">소속</span>
              <span className="font-medium text-white">{user.company}</span>
            </div>
          )}
          {user.position && (
            <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
              <span className="text-gray-400">직책</span>
              <span className="font-medium text-white">{user.position}</span>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">계정 상태</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
            <span className="text-gray-400">승인 상태</span>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                user.isVerified
                  ? "bg-green-500/20 text-green-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              {user.isVerified ? "승인됨" : "승인 대기"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
            <span className="text-gray-400">가입일</span>
            <span className="font-medium text-white">
              {new Date(user.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          {user.lastLoginAt && (
            <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
              <span className="text-gray-400">마지막 로그인</span>
              <span className="font-medium text-white">
                {new Date(user.lastLoginAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between rounded-lg bg-white/5 p-4">
            <span className="text-gray-400">총 로그인 횟수</span>
            <span className="font-medium text-white">{user.loginCount}회</span>
          </div>
        </div>
      </div>

      {!user.isVerified && (
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h4 className="font-medium text-yellow-400">승인 대기 중</h4>
              <p className="mt-1 text-sm text-yellow-300/80">
                관리자의 승인 후 모든 서비스를 이용하실 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
