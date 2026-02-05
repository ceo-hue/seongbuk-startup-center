"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CompanyCard } from "@/app/components/ui/CompanyCard";
import { CompanyModal } from "@/app/components/ui/CompanyModal";
import { fadeInUp, staggerContainer, viewportOptions } from "@/app/utils/animations";
import type { Company } from "@/app/types";

export function CompaniesSection() {
  const [residentCompanies, setResidentCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/companies");
      if (!res.ok) {
        console.error("API Error:", res.status, res.statusText);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setResidentCompanies(data);
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (company: Company) => {
    const index = residentCompanies.findIndex((c) => c.name === company.name);
    setCurrentIndex(index);
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedCompany(null), 300);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % residentCompanies.length;
    setCurrentIndex(nextIndex);
    setSelectedCompany(residentCompanies[nextIndex]);
  };

  const handlePrev = () => {
    const prevIndex =
      (currentIndex - 1 + residentCompanies.length) % residentCompanies.length;
    setCurrentIndex(prevIndex);
    setSelectedCompany(residentCompanies[prevIndex]);
  };

  const hasNext = currentIndex < residentCompanies.length - 1;
  const hasPrev = currentIndex > 0;

  // 슬라이드 페이지 계산
  const totalPages = Math.ceil(residentCompanies.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCompanies = residentCompanies.slice(startIndex, endIndex);

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
    <section id="companies" className="relative mx-auto mt-32 max-w-6xl px-6 md:px-10">
      <motion.header
        className="mb-12 pt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOptions}
        variants={fadeInUp}
      >
        <div>
          <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
            입주 · 졸업기업 소개
            <span className="block text-base font-normal text-gray-200/85 md:text-lg">
              함께 성장한 기업들
            </span>
          </h2>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-gray-200/80 md:text-[0.82rem]">
          실제로 이 공간에서 시작해, 제품을 만들고, 고객을 만나고, 투자와 확장까지 이어간 기업들의 이야기는 앞으로
          도전할 중장년 창업자에게 가장 강력한 설득 자료가 됩니다.
        </p>
      </motion.header>

      <div className="relative">
        {/* 이전 페이지 버튼 */}
        {hasPrevPage && !isLoading && residentCompanies.length > itemsPerPage && (
          <button
            onClick={handlePrevPage}
            className="absolute -left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl transition-all hover:bg-white/20 md:-left-12"
            aria-label="이전 페이지"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          variants={staggerContainer}
          key={currentPage}
        >
          {isLoading ? (
            <div className="col-span-full py-8 text-center text-gray-400">로딩 중...</div>
          ) : residentCompanies.length === 0 ? (
            <div className="col-span-full py-8 text-center text-gray-400">등록된 입주기업이 없습니다.</div>
          ) : (
            currentCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                {...company}
                onClick={() => handleCardClick(company)}
              />
            ))
          )}
        </motion.div>

        {/* 다음 페이지 버튼 */}
        {hasNextPage && !isLoading && residentCompanies.length > itemsPerPage && (
          <button
            onClick={handleNextPage}
            className="absolute -right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl transition-all hover:bg-white/20 md:-right-12"
            aria-label="다음 페이지"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* 페이지 인디케이터 */}
      {!isLoading && residentCompanies.length > itemsPerPage && (
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

      <CompanyModal
        company={selectedCompany}
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
