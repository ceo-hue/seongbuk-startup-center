"use client";

import { useState, useEffect } from "react";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

const roleLabels: Record<string, string> = {
  USER: "일반 회원",
  RESIDENT_COMPANY: "정회원 (입주기업)",
  GRADUATED_COMPANY: "정회원 (졸업기업)",
  ADMIN: "관리자",
};

const roleColors: Record<string, string> = {
  USER: "bg-gray-500/20 text-gray-400",
  RESIDENT_COMPANY: "bg-green-500/20 text-green-400",
  GRADUATED_COMPANY: "bg-blue-500/20 text-blue-400",
  ADMIN: "bg-purple-500/20 text-purple-400",
};

export function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");

      if (!res.ok) {
        const text = await res.text();
        console.error("Server response:", text);
        throw new Error(`HTTP error! status: ${res.status}, body: ${text}`);
      }

      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      alert(`회원 목록을 불러오는데 실패했습니다: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      fetchUsers();
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  const handleVerifyToggle = async (userId: number, currentVerified: boolean) => {
    try {
      await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !currentVerified }),
      });
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user verification:", error);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("정말 이 사용자를 삭제하시겠습니까?")) return;

    try {
      await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setSelectedRole(user.role);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSelectedRole("");
  };

  if (isLoading) {
    return <div className="text-center text-gray-400">로딩 중...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">회원 관리</h2>
        <div className="text-sm text-gray-400">
          총 {users.length}명
        </div>
      </div>

      {/* Role Legend */}
      <div className="mb-6 flex flex-wrap gap-3 rounded-lg bg-white/5 p-4">
        <div className="text-sm font-medium text-gray-300">역할 안내:</div>
        {Object.entries(roleLabels).map(([key, label]) => (
          <span
            key={key}
            className={`rounded-full px-3 py-1 text-xs font-medium ${roleColors[key]}`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Users Table */}
      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-lg bg-white/5 p-4 transition-colors hover:bg-white/10"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* User Info */}
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h3 className="font-semibold text-white">{user.name}</h3>
                  <span className="text-sm text-gray-400">{user.email}</span>
                  {!user.isVerified && (
                    <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
                      미승인
                    </span>
                  )}
                </div>

                {/* Role Display/Edit */}
                {editingId === user.id ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="appearance-none rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-sm text-white focus:border-blue-500 focus:outline-none [&>option]:bg-slate-800/95 [&>option]:text-white"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      {Object.entries(roleLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleRoleChange(user.id, selectedRole)}
                      className="rounded-lg bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                    >
                      저장
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="rounded-lg bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        roleColors[user.role]
                      }`}
                    >
                      {roleLabels[user.role]}
                    </span>
                    <span className="text-xs text-gray-500">
                      가입일: {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleVerifyToggle(user.id, user.isVerified)}
                  className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                    user.isVerified
                      ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                      : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  }`}
                >
                  {user.isVerified ? "승인 취소" : "승인"}
                </button>
                <button
                  onClick={() => startEdit(user)}
                  className="rounded-lg bg-blue-500/20 px-3 py-1 text-sm text-blue-400 hover:bg-blue-500/30"
                  disabled={editingId === user.id}
                >
                  역할 변경
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="rounded-lg bg-red-500/20 px-3 py-1 text-sm text-red-400 hover:bg-red-500/30"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="rounded-lg bg-white/5 p-8 text-center text-gray-400">
            등록된 사용자가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
