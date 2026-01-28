"use client";

import { useState, useEffect } from "react";

interface Notice {
  id: number;
  title: string;
  content: string;
  category: string;
  author: string;
  views: number;
  date: string;
  images?: string[];
  files?: string[];
  createdAt: string;
  updatedAt: string;
}

export function NoticeManager() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "교육모집",
    author: "성북구 중장년 기술창업센터",
    date: new Date().toISOString().split("T")[0].replace(/-/g, ".").slice(2),
    images: [] as string[],
    files: [] as string[],
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await fetch("/api/notices");
      const data = await res.json();
      setNotices(data);
    } catch (error) {
      console.error("Failed to fetch notices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: "image" | "file") => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "notices");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("파일 업로드 실패");
      }

      const data = await res.json();

      if (type === "image") {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, data.url],
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          files: [...prev.files, data.url],
        }));
      }
    } catch (error) {
      console.error("File upload error:", error);
      alert("파일 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    try {
      if (editingId) {
        await fetch(`/api/notices/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch("/api/notices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      setFormData({
        title: "",
        content: "",
        category: "교육모집",
        author: "성북구 중장년 기술창업센터",
        date: new Date().toISOString().split("T")[0].replace(/-/g, ".").slice(2),
        images: [],
        files: [],
      });
      setIsAdding(false);
      setEditingId(null);
      fetchNotices();
    } catch (error) {
      console.error("Failed to save notice:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await fetch(`/api/notices/${id}`, { method: "DELETE" });
      fetchNotices();
    } catch (error) {
      console.error("Failed to delete notice:", error);
    }
  };

  const startEdit = (notice: Notice) => {
    setEditingId(notice.id);
    setFormData({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      author: notice.author,
      date: notice.date,
      images: notice.images || [],
      files: notice.files || [],
    });
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      title: "",
      content: "",
      category: "교육모집",
      author: "성북구 중장년 기술창업센터",
      date: new Date().toISOString().split("T")[0].replace(/-/g, ".").slice(2),
      images: [],
      files: [],
    });
  };

  if (isLoading) {
    return <div className="text-center text-gray-400">로딩 중...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">공지사항 목록</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          + 공지사항 추가
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg bg-white/10 p-4">
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                제목
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="공지사항 제목"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                카테고리
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full appearance-none rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white focus:border-blue-500 focus:outline-none [&>option]:bg-slate-800/95 [&>option]:text-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="교육모집">교육모집</option>
                <option value="입주모집">입주모집</option>
                <option value="교육안내">교육안내</option>
                <option value="공지">공지</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                작성자
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                날짜 (YY.MM.DD)
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                placeholder="25.03.10"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              내용
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              placeholder="공지사항 내용을 입력하세요"
              rows={10}
              required
            />
          </div>

          {/* 이미지 업로드 섹션 */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              이미지 첨부
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

          {/* 파일 업로드 섹션 */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              파일 첨부
            </label>
            <div className="space-y-3">
              <div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, "file");
                      e.target.value = "";
                    }
                  }}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 ${
                    uploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {uploading ? "업로드 중..." : "파일 선택"}
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  지원 형식: PDF, DOC, DOCX, XLS, XLSX (최대 10MB)
                </p>
              </div>

              {/* 파일 목록 */}
              {formData.files.length > 0 && (
                <div className="space-y-2">
                  {formData.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-white/20 bg-white/5 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-300">
                          {file.split('/').pop()}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-400 transition-colors hover:text-red-300"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      <div className="space-y-3">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="rounded-lg bg-white/5 p-4 transition-colors hover:bg-white/10"
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">
                    {notice.category}
                  </span>
                  <span className="text-xs text-gray-400">{notice.date}</span>
                  <span className="text-xs text-gray-500">조회 {notice.views}</span>
                </div>
                <h3 className="mb-1 font-semibold text-white">{notice.title}</h3>
                <p className="mb-2 line-clamp-2 text-sm text-gray-300">
                  {notice.content}
                </p>
                <p className="text-xs text-gray-400">작성자: {notice.author}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(notice)}
                  className="rounded-lg bg-yellow-500/20 px-3 py-1 text-sm text-yellow-400 hover:bg-yellow-500/30"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(notice.id)}
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
