"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Company } from "@/app/types";
import { cardAnimation } from "@/app/utils/animations";

type CompanyCardProps = Company & {
  onClick?: () => void;
};

export function CompanyCard({ name, tag, desc, logo, onClick }: CompanyCardProps) {
  return (
    <motion.div
      className="cursor-pointer rounded-3xl border border-white/18 bg-white/8 p-6 backdrop-blur-2xl shadow-[0_14px_40px_rgba(0,0,0,0.55)] transition-all hover:border-white/30"
      variants={cardAnimation}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[0.7rem] uppercase tracking-[0.16em] text-gray-200/85">
            {tag}
          </p>
        </div>
        {logo && (
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-white/20 bg-white/5 p-1.5">
            <img
              src={logo}
              alt={`${name} 로고`}
              className="h-full w-full object-contain"
            />
          </div>
        )}
      </div>
      <h3 className="mt-3 text-lg font-semibold text-white">{name}</h3>
      <p className="mt-3 text-sm leading-relaxed text-gray-100/90">{desc}</p>
      <div className="mt-4 flex items-center text-xs text-gray-300/70">
        <span>자세히 보기</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="ml-1"
        >
          <path
            d="M5 3L9 7L5 11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </motion.div>
  );
}
