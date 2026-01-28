"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PartnerCard } from "@/app/components/ui/PartnerCard";
import { fadeInUp, staggerContainer, viewportOptions } from "@/app/utils/animations";
import type { Partner } from "@/app/types";

export function PartnersSection() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <section id="partners" className="relative mx-auto mt-32 max-w-6xl px-6 md:px-10">
      <motion.header
        className="mb-10 pt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOptions}
        variants={fadeInUp}
      >
        <div>
          <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
            창업지원 기관
            <span className="block text-base font-normal text-gray-200/85 md:text-lg">
              함께 만드는 지역 창업 생태계
            </span>
          </h2>
        </div>
        <p className="max-w-md text-xs leading-relaxed text-gray-200/80 md:text-[0.82rem]">
          센터와 협력하는 주요 기관의 로고를 통해, 창업자가 어떤 공공·민간 네트워크와 함께 성장하게 되는지
          직관적으로 보여줍니다.
        </p>
      </motion.header>

      <motion.div
        className="grid grid-cols-2 gap-4 rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl md:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOptions}
        variants={staggerContainer}
      >
        {isLoading ? (
          <div className="col-span-full py-8 text-center text-gray-400">로딩 중...</div>
        ) : partners.length === 0 ? (
          <div className="col-span-full py-8 text-center text-gray-400">등록된 협력기관이 없습니다.</div>
        ) : (
          partners.map((partner) => (
            <PartnerCard
              key={typeof partner === 'string' ? partner : partner.id}
              name={typeof partner === 'string' ? partner : partner.name}
              link={typeof partner === 'string' ? undefined : partner.link}
            />
          ))
        )}
      </motion.div>
    </section>
  );
}
