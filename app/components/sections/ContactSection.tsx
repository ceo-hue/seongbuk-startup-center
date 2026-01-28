"use client";

import React from "react";
import { motion } from "framer-motion";
import { scaleIn, viewportOptions } from "@/app/utils/animations";

export function ContactSection() {
  return (
    <section id="contact" className="relative mx-auto mt-32 max-w-6xl px-6 pb-24 text-center md:px-10">
      <motion.div
        className="relative overflow-hidden rounded-[40px] border border-white/25 bg-white/10 p-10 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.65)]"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOptions}
        variants={scaleIn}
      >
        <h2 className="text-2xl font-semibold md:text-3xl">
          궁금할수록,
          <span className="block bg-gradient-to-r from-[#4E9CFF] to-[#FF8DB2] bg-clip-text text-transparent">
            혼자 고민하지 말고 먼저 문의하세요
          </span>
        </h2>
        <p className="mt-4 mx-auto max-w-2xl text-sm leading-relaxed text-gray-100 md:text-[0.95rem]">
          전화 한 통, 상담 신청 한 번이 새로운 창업 여정의 시작이 될 수 있습니다. 프로그램 문의, 입주 관련 질문,
          협력 제안 등 어떤 내용이든 편하게 연락 주세요.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 text-sm text-gray-100 md:text-[0.95rem]">
          <div className="flex flex-col gap-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-blue-400">
                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-white font-medium">서울특별시 성북구 화랑로 211 성북구벤처창업지원센터 B104·B105</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-green-400">
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-white font-medium">02-941-7257</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-purple-400">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-white font-medium">senior@hansung.ac.kr</p>
            </div>
          </div>
          <motion.button
            className="mt-4 inline-flex items-center justify-center rounded-full bg-white/90 px-6 py-2 text-sm font-medium text-[#050609] transition-colors hover:bg-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            문의하기 폼으로 이동
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}
