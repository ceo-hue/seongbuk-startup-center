"use client";

import React from "react";
import type { ProgramCard as ProgramCardType } from "@/app/types";

type ProgramCardProps = ProgramCardType;

export function ProgramCard({ title, desc }: ProgramCardProps) {
  return (
    <div
      className="group relative col-span-1 flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl shadow-lg transition-all hover:border-white/25 hover:bg-white/8 lg:col-span-5"
      style={{ minHeight: '250px' }}
    >
      {/* 유리 반사 효과 */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-white/30 to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-tl from-white/20 to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      {/* 프로그램 타이틀 */}
      <h3 className="relative z-10 mb-4 text-lg font-bold text-white md:text-xl">{title}</h3>

      {/* 프로그램 설명 */}
      <div className="relative z-10">
        <p className="text-sm leading-relaxed text-gray-200/90">{desc}</p>
      </div>
    </div>
  );
}
