"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NoticeItem } from "@/app/components/ui/NoticeItem";
import { NoticeModal } from "@/app/components/ui/NoticeModal";
import { fadeInUp, scaleIn, viewportOptions } from "@/app/utils/animations";
import type { Notice } from "@/app/types";

export function NoticesSection() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;

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

  const handleNoticeClick = (notice: Notice) => {
    const index = notices.findIndex((n) => n.title === notice.title);
    setCurrentIndex(index);
    setSelectedNotice(notice);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedNotice(null), 300);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % notices.length;
    setCurrentIndex(nextIndex);
    setSelectedNotice(notices[nextIndex]);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + notices.length) % notices.length;
    setCurrentIndex(prevIndex);
    setSelectedNotice(notices[prevIndex]);
  };

  const hasNext = currentIndex < notices.length - 1;
  const hasPrev = currentIndex > 0;

  // 슬라이드 페이지 계산
  const totalPages = Math.ceil(notices.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotices = notices.slice(startIndex, endIndex);

  const hasNextPage = currentPage < totalPages - 1;
  const hasPrevPage = currentPage > 0;

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <section id="notices" className="relative mx-auto mt-32 max-w-6xl px-6 md:px-10">
      <motion.header
        className="mb-10 pt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOptions}
        variants={fadeInUp}
      >
        <div>
          <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
            공지글 · 블로그
            <span className="block text-base font-normal text-gray-200/85 md:text-lg">
              지금 놓치면 아쉬운 소식들
            </span>
          </h2>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-gray-200/80 md:text-[0.82rem]">
          교육 모집, 입주 공고, 특강, 네트워크 행사 등 중장년 창업자에게 꼭 필요한 정보를 한눈에 확인할 수 있는
          공지 영역입니다.
        </p>
      </motion.header>

      <div className="relative">
        {/* 이전 페이지 버튼 (위) */}
        {hasPrevPage && !isLoading && notices.length > itemsPerPage && (
          <button
            onClick={handlePrevPage}
            className="absolute -top-6 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl transition-all hover:bg-white/20"
            aria-label="이전 페이지"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 12.5L10 7.5L5 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        <motion.div
          className="space-y-3 rounded-3xl border border-white/15 bg-white/6 p-6 backdrop-blur-xl"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          variants={scaleIn}
          key={currentPage}
        >
          {isLoading ? (
            <div className="py-8 text-center text-gray-400">로딩 중...</div>
          ) : notices.length === 0 ? (
            <div className="py-8 text-center text-gray-400">등록된 공지사항이 없습니다.</div>
          ) : (
            currentNotices.map((notice) => (
              <NoticeItem
                key={notice.id}
                {...notice}
                onClick={() => handleNoticeClick(notice)}
              />
            ))
          )}
        </motion.div>

        {/* 다음 페이지 버튼 (아래) */}
        {hasNextPage && !isLoading && notices.length > itemsPerPage && (
          <button
            onClick={handleNextPage}
            className="absolute -bottom-6 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl transition-all hover:bg-white/20"
            aria-label="다음 페이지"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* 페이지 인디케이터 */}
      {!isLoading && notices.length > itemsPerPage && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentPage
                  ? "w-8 bg-blue-400"
                  : "w-2 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`페이지 ${index + 1}`}
            />
          ))}
        </div>
      )}

      <NoticeModal
        notice={selectedNotice}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={hasNext}
        hasPrev={hasPrev}
      />
    </section>
  );
}
