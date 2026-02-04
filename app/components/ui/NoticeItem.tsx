"use client";

import React from "react";
import type { Notice } from "@/app/types";

type NoticeItemProps = Notice & {
  onClick?: () => void;
};

export function NoticeItem({ title, date, onClick }: NoticeItemProps) {
  return (
    <div
      className="group flex cursor-pointer flex-col justify-between gap-2 border-b border-white/10 pb-3 last:border-b-0 last:pb-0 md:flex-row md:items-center"
      onClick={onClick}
    >
      <div className="flex-1">
        <p className="text-[0.8rem] text-gray-300/80">{date}</p>
        <p className="text-sm font-medium text-white group-hover:text-[#4E9CFF] transition-colors md:text-[0.95rem]">
          {title}
        </p>
      </div>
      <button
        className="mt-1 inline-flex w-max items-center justify-center rounded-full border border-white/30 px-3 py-1 text-[0.75rem] text-gray-100 transition-colors hover:border-white hover:bg-white/10 hover:text-white"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
      >
        자세히 보기
      </button>
    </div>
  );
}
