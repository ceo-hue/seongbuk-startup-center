"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { heroTextAnimation } from "@/app/utils/animations";
import { CenterInfoModal } from "@/app/components/ui/CenterInfoModal";

export function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="hero" className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 text-center md:px-12">
      <header className="flex flex-col gap-3 pt-10 md:pt-16 items-center text-center">
        {/* 센터소개 텍스트 제거 */}

        {/* 성북구 중장년 기술창업센터 - 적당히 크게 */}
        <motion.p
          className="text-lg md:text-xl lg:text-2xl text-gray-200/85 font-medium"
          variants={heroTextAnimation}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          성북구 중장년 기술창업센터
        </motion.p>

        <motion.h1
          className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight tracking-[-0.03em]"
          variants={heroTextAnimation}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          다시, 도전할 수 있는 중장년 기술창업의 플랫폼
          <span className="block bg-gradient-to-r from-[#4E9CFF] via-white to-[#FF8DB2] bg-clip-text text-transparent">
            경력과 경험이 새로운 비즈니스가 되는 공간
          </span>
        </motion.h1>

        {/* 부제목 - 약간 크게 */}
        <motion.p
          className="max-w-2xl text-sm md:text-base lg:text-lg leading-relaxed text-gray-200/85 mt-4"
          variants={heroTextAnimation}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          성북구 중장년 기술창업센터는 단순한 사무공간이 아니라, 교육·멘토링·네트워크·투자 연계를 통해 중장년이 다시 도전하고 성장할 수 있도록 설계된 통합 창업 지원 허브입니다.
        </motion.p>

        {/* 센터소개 버튼 */}
        <motion.div
          className="mt-8"
          variants={heroTextAnimation}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          <button
            onClick={() => setIsModalOpen(true)}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-blue-500/50 md:px-10 md:py-4 md:text-base"
          >
            <span className="relative z-10 flex items-center gap-2">
              성북구 중장년 기술창업센터 소개
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        </motion.div>
      </header>

      {/* 센터소개 모달 */}
      <CenterInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
