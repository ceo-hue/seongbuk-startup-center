"use client";

import React from "react";
import type { ProgramCard as ProgramCardType } from "@/app/types";

type ProgramCardProps = ProgramCardType;

export function ProgramCard({ title, desc }: ProgramCardProps) {
  return (
    <div
      className="group relative col-span-1 flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl shadow-lg transition-all duration-[400ms] hover:scale-105 hover:border-rose-400/50 hover:shadow-[0_0_20px_rgba(251,207,232,0.3)] lg:col-span-5"
      style={{ minHeight: '250px' }}
    >
      {/* Glass Shine 효과 - ::before처럼 왼쪽→오른쪽 스윕 */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-full -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-all duration-500 group-hover:translate-x-full"
      />

      {/* 프로그램 타이틀 */}
      <h3 className="relative z-10 mb-4 text-lg font-bold text-white md:text-xl">
        {title}
      </h3>

      {/* 프로그램 설명 */}
      <div className="relative z-10">
        <p className="text-sm leading-relaxed text-gray-200/90">{desc}</p>
      </div>
    </div>
  );
}
