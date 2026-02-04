"use client";

import React from "react";
import { motion } from "framer-motion";
import type { PageTitleProps } from "@/app/types";
import { heroTextAnimation } from "@/app/utils/animations";

export function PageTitle({
  label,
  kicker,
  title,
  highlight,
  subtitle,
  align = "left",
}: PageTitleProps) {
  const alignClass =
    align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <header className={`flex flex-col gap-3 pt-10 md:pt-16 ${alignClass}`}>
      {label && (
        <motion.p
          className="text-[0.7rem] font-medium tracking-[0.28em] text-gray-300/80 uppercase"
          variants={heroTextAnimation}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          {label}
        </motion.p>
      )}

      {kicker && (
        <motion.p
          className="text-xs md:text-sm text-gray-200/85"
          variants={heroTextAnimation}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          {kicker}
        </motion.p>
      )}

      <motion.h1
        className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight tracking-[-0.03em]"
        variants={heroTextAnimation}
        initial="hidden"
        animate="visible"
        custom={2}
      >
        {title}
        {highlight && (
          <span className="block bg-gradient-to-r from-[#4E9CFF] via-white to-[#FF8DB2] bg-clip-text text-transparent">
            {highlight}
          </span>
        )}
      </motion.h1>

      {subtitle && (
        <motion.p
          className="max-w-xl text-xs md:text-[0.9rem] leading-relaxed text-gray-200/85"
          variants={heroTextAnimation}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          {subtitle}
        </motion.p>
      )}
    </header>
  );
}
