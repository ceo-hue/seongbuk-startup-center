"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Company } from "@/app/types";

type CompanyModalProps = {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
};

export function CompanyModal({
  company,
  isOpen,
  onClose,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
}: CompanyModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && hasPrev && onPrev) {
        onPrev();
      } else if (e.key === "ArrowRight" && hasNext && onNext) {
        onNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasNext, hasPrev, onNext, onPrev, onClose]);

  if (!company) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            {/* Previous button */}
            {hasPrev && onPrev && (
              <motion.button
                onClick={onPrev}
                className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl transition-all hover:bg-white/20 md:left-8"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="이전 기업"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            )}

            <motion.div
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[40px] border border-white/25 bg-white/10 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.65)] p-8 md:p-12"
              key={company.name}
              initial={{ scale: 0.9, opacity: 0, x: 20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.9, opacity: 0, x: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white"
                aria-label="닫기"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {/* Content */}
              <div className="text-white">
                <div className="mb-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-xs uppercase tracking-[0.16em] text-gray-200/90">
                        {company.tag}
                      </p>
                      <h2 className="mt-4 text-3xl font-bold md:text-4xl">
                        {company.name}
                      </h2>
                      {company.year && (
                        <p className="mt-2 text-sm text-gray-300/80">
                          {company.year}
                        </p>
                      )}
                    </div>
                    {/* 로고 */}
                    {company.logo && (
                      <div className="flex-shrink-0">
                        <div className="h-20 w-20 overflow-hidden rounded-xl border border-white/20 bg-white/5 p-2">
                          <img
                            src={company.logo}
                            alt={`${company.name} 로고`}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-gray-100">
                      기업 소개
                    </h3>
                    <p className="text-[0.95rem] leading-relaxed text-gray-100/90">
                      {company.detailedDesc || company.desc}
                    </p>
                  </div>

                  {company.achievements && company.achievements.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-lg font-semibold text-gray-100">
                        주요 성과
                      </h3>
                      <ul className="space-y-2">
                        {company.achievements.map((achievement, index) => (
                          <li
                            key={index}
                            className="flex items-start text-[0.95rem] leading-relaxed text-gray-100/90"
                          >
                            <span className="mr-3 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-r from-[#4E9CFF] to-[#FF8DB2]" />
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 이미지 갤러리 */}
                  {company.images && company.images.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-lg font-semibold text-gray-100">
                        갤러리
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {company.images.map((image, index) => (
                          <a
                            key={index}
                            href={image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative aspect-video overflow-hidden rounded-xl border border-white/20 bg-white/5 transition-all hover:border-white/40 hover:shadow-xl"
                          >
                            <img
                              src={image}
                              alt={`${company.name} 이미지 ${index + 1}`}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                              <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-white">
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {company.website && (
                    <div className="pt-4">
                      <a
                        href={`https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-white/25"
                      >
                        <span>웹사이트 방문</span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6 3H3V13H13V10M10 3H13M13 3V6M13 3L6 10"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Next button */}
            {hasNext && onNext && (
              <motion.button
                onClick={onNext}
                className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl transition-all hover:bg-white/20 md:right-8"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="다음 기업"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            )}
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
