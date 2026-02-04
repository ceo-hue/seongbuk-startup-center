"use client";

import { useState, useEffect } from "react";
import {
  VISIBILITY_LABELS,
  VISIBILITY_COLORS,
  VISIBILITY_ICONS,
  type Visibility,
} from "@/lib/permissions";

interface Program {
  id: number;
  title: string;
  desc: string;
  gradient: string;
  visibility: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  location?: string;
  instructor?: string;
  createdAt: string;
  updatedAt: string;
}

export function ProgramManager() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    gradient: "linear-gradient(145deg, #7AB8FF40, #FF8DB240)",
    visibility: "PUBLIC" as Visibility,
    category: "",
    startDate: "",
    endDate: "",
    capacity: undefined as number | undefined,
    location: "",
    instructor: "",
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await fetch("/api/programs");
      const data = await res.json();
      setPrograms(data);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.desc.trim()) return;

    try {
      if (editingId) {
        await fetch(`/api/programs/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch("/api/programs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      setFormData({
        title: "",
        desc: "",
        gradient: "linear-gradient(145deg, #7AB8FF40, #FF8DB240)",
        visibility: "PUBLIC",
        category: "",
        startDate: "",
        endDate: "",
        capacity: undefined,
        location: "",
        instructor: "",
      });
      setIsAdding(false);
      setEditingId(null);
      fetchPrograms();
    } catch (error) {
      console.error("Failed to save program:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await fetch(`/api/programs/${id}`, { method: "DELETE" });
      fetchPrograms();
    } catch (error) {
      console.error("Failed to delete program:", error);
    }
  };

  const startEdit = (program: Program) => {
    setEditingId(program.id);
    setFormData({
      title: program.title,
      desc: program.desc,
      gradient: program.gradient,
      visibility: program.visibility as Visibility,
      category: program.category || "",
      startDate: program.startDate || "",
      endDate: program.endDate || "",
      capacity: program.capacity,
      location: program.location || "",
      instructor: program.instructor || "",
    });
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      title: "",
      desc: "",
      gradient: "linear-gradient(145deg, #7AB8FF40, #FF8DB240)",
      visibility: "PUBLIC",
      category: "",
      startDate: "",
      endDate: "",
      capacity: undefined,
      location: "",
      instructor: "",
    });
  };

  if (isLoading) {
    return <div className="text-center text-gray-400">로딩 중...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">프로그램 목록</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          + 프로그램 추가
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg bg-white/10 p-4">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              프로그램 제목
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="프로그램 제목을 입력하세요"
              required
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              프로그램 설명
            </label>
            <textarea
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="프로그램 설명을 입력하세요"
              rows={3}
              required
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              그라디언트 (CSS)
            </label>
            <input
              type="text"
              value={formData.gradient}
              onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="linear-gradient(145deg, #7AB8FF40, #FF8DB240)"
              required
            />
            <div
              className="mt-2 h-16 rounded-lg"
              style={{ background: formData.gradient }}
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              공개 범위 ⭐
            </label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value as Visibility })}
              className="w-full appearance-none rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white focus:border-blue-500 focus:outline-none [&>option]:bg-slate-800/95 [&>option]:text-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="PUBLIC">🌐 전체 공개 (모든 사용자)</option>
              <option value="MEMBER_ONLY">🔒 정회원 전용 (입주/졸업기업만)</option>
              <option value="ADMIN_ONLY">⚙️ 관리자 전용</option>
            </select>
            <p className="mt-1 text-xs text-gray-400">
              {formData.visibility === "PUBLIC" && "모든 사용자가 볼 수 있습니다"}
              {formData.visibility === "MEMBER_ONLY" && "입주기업과 졸업기업만 볼 수 있습니다"}
              {formData.visibility === "ADMIN_ONLY" && "관리자만 볼 수 있습니다"}
            </p>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                카테고리
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="예: 멘토링, 교육"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                정원
              </label>
              <input
                type="number"
                value={formData.capacity || ""}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="예: 20"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              {editingId ? "수정" : "추가"}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              취소
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {programs.map((program) => (
          <div
            key={program.id}
            className="rounded-lg bg-white/5 p-4 transition-colors hover:bg-white/10"
          >
            <div
              className="mb-3 h-20 rounded-lg"
              style={{ background: program.gradient }}
            />
            <div className="mb-2 flex items-center gap-2">
              <h3 className="font-semibold text-white">{program.title}</h3>
              <span className={`rounded-full px-2 py-0.5 text-xs ${VISIBILITY_COLORS[program.visibility as Visibility]}`}>
                {VISIBILITY_ICONS[program.visibility as Visibility]} {VISIBILITY_LABELS[program.visibility as Visibility]}
              </span>
            </div>
            <p className="mb-3 text-sm text-gray-300">{program.desc}</p>
            {program.category && (
              <p className="mb-1 text-xs text-gray-400">카테고리: {program.category}</p>
            )}
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                등록일: {new Date(program.createdAt).toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(program)}
                  className="rounded-lg bg-yellow-500/20 px-3 py-1 text-sm text-yellow-400 hover:bg-yellow-500/30"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(program.id)}
                  className="rounded-lg bg-red-500/20 px-3 py-1 text-sm text-red-400 hover:bg-red-500/30"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
