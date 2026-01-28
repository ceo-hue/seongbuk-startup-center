"use client";

import { useState, useEffect } from "react";

interface Company {
  id: number;
  name: string;
  tag: string;
  desc: string;
  detailedDesc: string | null;
  year: string | null;
  achievements: string[] | null;
  website: string | null;
  logo: string | null;
  images: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export function CompanyManager() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    tag: "",
    desc: "",
    detailedDesc: "",
    year: "",
    achievements: "",
    website: "",
    logo: "",
    images: [] as string[],
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/companies");
      const data = await res.json();
      setCompanies(data);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: "logo" | "image") => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "companies");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("파일 업로드 실패");
      }

      const data = await res.json();

      if (type === "logo") {
        setFormData(prev => ({
          ...prev,
          logo: data.url,
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, data.url],
        }));
      }
    } catch (error) {
      console.error("File upload error:", error);
      alert("파일 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({
      ...prev,
      logo: "",
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.tag.trim() || !formData.desc.trim()) return;

    const payload = {
      ...formData,
      achievements: formData.achievements
        ? formData.achievements.split("\n").filter((a) => a.trim())
        : [],
      logo: formData.logo || null,
      images: formData.images.length > 0 ? formData.images : null,
    };

    try {
      if (editingId) {
        await fetch(`/api/companies/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setFormData({
        name: "",
        tag: "",
        desc: "",
        detailedDesc: "",
        year: "",
        achievements: "",
        website: "",
        logo: "",
        images: [],
      });
      setIsAdding(false);
      setEditingId(null);
      fetchCompanies();
    } catch (error) {
      console.error("Failed to save company:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await fetch(`/api/companies/${id}`, { method: "DELETE" });
      fetchCompanies();
    } catch (error) {
      console.error("Failed to delete company:", error);
    }
  };

  const startEdit = (company: Company) => {
    setEditingId(company.id);
    setFormData({
      name: company.name,
      tag: company.tag,
      desc: company.desc,
      detailedDesc: company.detailedDesc || "",
      year: company.year || "",
      achievements: company.achievements ? company.achievements.join("\n") : "",
      website: company.website || "",
      logo: company.logo || "",
      images: company.images || [],
    });
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      name: "",
      tag: "",
      desc: "",
      detailedDesc: "",
      year: "",
      achievements: "",
      website: "",
      logo: "",
      images: [],
    });
  };

  if (isLoading) {
    return <div className="text-center text-gray-400">로딩 중...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">입주기업 목록</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          + 입주기업 추가
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg bg-white/10 p-4">
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                기업명
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="기업명"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                태그
              </label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="예: 제조·기술"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                연도
              </label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="예: 2024년 입주"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                웹사이트
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="www.company.com"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              간단 설명
            </label>
            <textarea
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="기업에 대한 간단한 설명"
              rows={2}
              required
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              상세 설명
            </label>
            <textarea
              value={formData.detailedDesc}
              onChange={(e) => setFormData({ ...formData, detailedDesc: e.target.value })}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="기업에 대한 상세한 설명"
              rows={4}
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              주요 성과 (한 줄에 하나씩)
            </label>
            <textarea
              value={formData.achievements}
              onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="성과 1&#10;성과 2&#10;성과 3"
              rows={4}
            />
          </div>

          {/* 로고 업로드 섹션 */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              로고 이미지
            </label>
            <div className="space-y-3">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, "logo");
                      e.target.value = "";
                    }
                  }}
                  className="hidden"
                  id="logo-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="logo-upload"
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 ${
                    uploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {uploading ? "업로드 중..." : "로고 선택"}
                </label>
              </div>

              {/* 로고 미리보기 */}
              {formData.logo && (
                <div className="group relative inline-block aspect-square w-32 overflow-hidden rounded-lg border border-white/20">
                  <img
                    src={formData.logo}
                    alt="로고 미리보기"
                    className="h-full w-full object-contain bg-white/5"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 이미지 업로드 섹션 */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              추가 이미지
            </label>
            <div className="space-y-3">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, "image");
                      e.target.value = "";
                    }
                  }}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="image-upload"
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 ${
                    uploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {uploading ? "업로드 중..." : "이미지 선택"}
                </label>
              </div>

              {/* 이미지 미리보기 */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border border-white/20">
                      <img
                        src={image}
                        alt={`미리보기 ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
              disabled={uploading}
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <div
            key={company.id}
            className="rounded-lg bg-white/5 p-4 transition-colors hover:bg-white/10"
          >
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-white">{company.name}</h3>
                <span className="text-xs text-blue-400">{company.tag}</span>
              </div>
            </div>
            <p className="mb-2 text-sm text-gray-300">{company.desc}</p>
            {company.year && (
              <p className="mb-2 text-xs text-gray-400">{company.year}</p>
            )}
            {company.achievements && company.achievements.length > 0 && (
              <div className="mb-2">
                <p className="mb-1 text-xs font-medium text-gray-400">주요 성과:</p>
                <ul className="list-inside list-disc text-xs text-gray-300">
                  {company.achievements.slice(0, 2).map((achievement, idx) => (
                    <li key={idx}>{achievement}</li>
                  ))}
                  {company.achievements.length > 2 && (
                    <li className="text-gray-500">
                      외 {company.achievements.length - 2}건
                    </li>
                  )}
                </ul>
              </div>
            )}
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => startEdit(company)}
                className="rounded-lg bg-yellow-500/20 px-3 py-1 text-sm text-yellow-400 hover:bg-yellow-500/30"
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(company.id)}
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
