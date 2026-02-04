"use client";

import { useState, useEffect } from "react";

interface Partner {
  id: number;
  name: string;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

export function PartnerManager() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", link: "" });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const res = await fetch("/api/partners");
      const data = await res.json();
      setPartners(data);
    } catch (error) {
      console.error("Failed to fetch partners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingId) {
        await fetch(`/api/partners/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch("/api/partners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      setFormData({ name: "", link: "" });
      setIsAdding(false);
      setEditingId(null);
      fetchPartners();
    } catch (error) {
      console.error("Failed to save partner:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await fetch(`/api/partners/${id}`, { method: "DELETE" });
      fetchPartners();
    } catch (error) {
      console.error("Failed to delete partner:", error);
    }
  };

  const startEdit = (partner: Partner) => {
    setEditingId(partner.id);
    setFormData({ name: partner.name, link: partner.link || "" });
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "", link: "" });
  };

  if (isLoading) {
    return <div className="text-center text-gray-400">로딩 중...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">협력기관 목록</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          + 협력기관 추가
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg bg-white/10 p-4">
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                기관명
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="협력기관 이름을 입력하세요"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                바로가기 링크
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="https://example.com"
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

      <div className="space-y-2">
        {partners.map((partner) => (
          <div
            key={partner.id}
            className="flex items-center justify-between rounded-lg bg-white/5 p-4 transition-colors hover:bg-white/10"
          >
            <div className="flex-1">
              <h3 className="font-medium text-white">{partner.name}</h3>
              {partner.link && (
                <a
                  href={partner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {partner.link}
                </a>
              )}
              <p className="mt-1 text-xs text-gray-400">
                등록일: {new Date(partner.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(partner)}
                className="rounded-lg bg-yellow-500/20 px-3 py-1 text-sm text-yellow-400 hover:bg-yellow-500/30"
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(partner.id)}
                className="rounded-lg bg-red-500/20 px-3 py-1 text-sm text-red-400 hover:bg-red-500/30"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
