"use client";

import React from "react";
import type { ProgramCard as ProgramCardType } from "@/app/types";

type ProgramCardProps = ProgramCardType;

export function ProgramCard({ title, desc }: ProgramCardProps) {
  return (
    <div
      className="group relative col-span-1 flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl shadow-lg transition-all duration-300 hover:scale-105 hover:border-rose-400/50 hover:shadow-[0_0_30px_rgba(251,207,232,0.3)] lg:col-span-5"
      style={{ minHeight: '250px' }}
    >
      {/* Glass Shine 효과 - 빛이 스치고 지나감 */}
      <div
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-all duration-500 group-hover:translate-x-full group-hover:opacity-100"
        style={{
          width: '100%',
          transform: 'skewX(-20deg)',
        }}
      />

      {/* 프로그램 타이틀 */}
      <h3 className="relative z-10 mb-4 text-lg font-bold text-white transition-colors duration-300 group-hover:text-rose-100 md:text-xl">
        {title}
      </h3>

      {/* 프로그램 설명 */}
      <div className="relative z-10">
        <p className="text-sm leading-relaxed text-gray-200/90">{desc}</p>
      </div>
    </div>
  );
}
