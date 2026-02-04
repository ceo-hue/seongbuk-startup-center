"use client";

import React from "react";
import { motion } from "framer-motion";
import type { ProgramCard as ProgramCardType } from "@/app/types";
import { cardAnimation } from "@/app/utils/animations";

type ProgramCardProps = ProgramCardType;

export function ProgramCard({ title, desc, gradient }: ProgramCardProps) {
  return (
    <motion.div
      className="relative col-span-1 flex flex-col justify-between overflow-hidden rounded-3xl border border-white/18 bg-white/10 p-7 md:p-8 lg:col-span-5 lg:p-9 backdrop-blur-2xl shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
      variants={cardAnimation}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: gradient }}
      />

      <div className="mb-4 flex items-center gap-2 text-[0.75rem] uppercase tracking-[0.18em] text-gray-200/80">
        <span className="h-[6px] w-[6px] rounded-full bg-white/70" />
        <span>PROGRAM LAYER</span>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold md:text-xl">{title}</h3>
        <p className="text-sm leading-relaxed text-gray-100/95 md:text-[0.9rem]">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}
