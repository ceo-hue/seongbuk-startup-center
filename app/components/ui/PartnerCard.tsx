"use client";

import React from "react";
import { motion } from "framer-motion";
import { cardAnimation } from "@/app/utils/animations";

type PartnerCardProps = {
  name: string;
  link?: string;
};

export function PartnerCard({ name, link }: PartnerCardProps) {
  const content = (
    <motion.div
      className={`flex h-20 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-center text-xs font-medium text-gray-100/90 transition-colors md:text-sm ${
        link ? "cursor-pointer hover:bg-white/20" : ""
      }`}
      variants={cardAnimation}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
    >
      <div className="flex items-center gap-1">
        {name}
        {link && (
          <svg className="h-3 w-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        )}
      </div>
    </motion.div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}
