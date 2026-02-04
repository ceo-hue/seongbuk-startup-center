"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ProgramCard } from "@/app/components/ui/ProgramCard";
import { fadeInUp, staggerContainer, viewportOptions } from "@/app/utils/animations";
import type { ProgramCard as ProgramCardType } from "@/app/types";

export function ProgramsSection() {
  const [programCards, setProgramCards] = useState<ProgramCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await fetch("/api/programs");
      const data = await res.json();
      setProgramCards(data);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="programs" className="relative mx-auto mt-24 max-w-6xl px-6 md:px-10">
      <motion.header
        className="mb-14 pt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOptions}
        variants={fadeInUp}
      >
        <div>
          <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
            중장년 맞춤형
            <span className="block text-base font-normal text-gray-200/85 md:text-lg">
              교육 · 멘토링 · 네트워크 구조
            </span>
          </h2>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-gray-200/80 md:text-[0.82rem]">
          각 프로그램은 "어디서부터 시작해야 할지 모르는 상태"에서 "나만의 사업 방향과 실행계획이 보이는 상태"까지
          단계적으로 이동할 수 있도록 설계되어 있습니다.
        </p>
      </motion.header>

      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-10"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOptions}
        variants={staggerContainer}
      >
        {isLoading ? (
          <div className="col-span-full py-8 text-center text-gray-400">로딩 중...</div>
        ) : programCards.length === 0 ? (
          <div className="col-span-full py-8 text-center text-gray-400">등록된 프로그램이 없습니다.</div>
        ) : (
          programCards.map((item) => (
            <ProgramCard key={item.id} {...item} />
          ))
        )}
      </motion.div>
    </section>
  );
}
