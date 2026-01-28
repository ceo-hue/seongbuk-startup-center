"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CenterInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 카운팅 애니메이션 훅
function useCountUp(end: number, duration: number = 2000, isActive: boolean = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isActive]);

  return count;
}

export function CenterInfoModal({ isOpen, onClose }: CenterInfoModalProps) {
  const years = useCountUp(2025 - 2014, 2000, isOpen);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 shadow-2xl backdrop-blur-xl"
            >
              {/* Header */}
              <div className="relative border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-8 py-6">
                <h2 className="text-3xl font-bold text-white">
                  성북구 중장년 기술창업센터
                </h2>
                <p className="mt-2 text-sm text-gray-300">
                  전문 경력을 보유한 중장년의 창업을 지원하는 통합 창업 허브
                </p>
                <button
                  onClick={onClose}
                  className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                  aria-label="닫기"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[calc(90vh-120px)] overflow-y-auto px-8 py-6">
                {/* 센터 개요 - 통계 카드 */}
                <section className="mb-8">
                  <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <motion.div
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="group rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-6 text-center"
                    >
                      <p className="mb-2 text-sm font-medium text-blue-300">운영 기간</p>
                      <div className="flex items-baseline gap-2 justify-center">
                        <span className="text-4xl font-bold text-white">{years}</span>
                        <span className="text-xl text-blue-400">년+</span>
                      </div>
                      <p className="mt-2 text-xs text-gray-400">2014년 6월 1일 개소</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-6 text-center"
                    >
                      <p className="mb-2 text-sm font-medium text-purple-300">지원 대상</p>
                      <span className="text-3xl font-bold text-white">중장년</span>
                      <p className="mt-2 text-xs text-gray-400">전문 경력 보유 창업자</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-600/10 p-6 text-center"
                    >
                      <p className="mb-2 text-sm font-medium text-green-300">지원 유형</p>
                      <span className="text-2xl font-bold text-white">통합 지원</span>
                      <p className="mt-2 text-xs text-gray-400">공간·교육·상담·자문</p>
                    </motion.div>
                  </div>

                  <p className="rounded-xl border border-white/10 bg-white/5 p-6 leading-relaxed text-gray-300">
                    성북구 중장년 기술창업센터는 <strong className="text-blue-400">전문 경력을 보유하고 기술 창업을 준비중인 중장년의 창업을 지원</strong>하기 위해
                    <strong className="text-purple-400"> 2014년 6월 1일</strong>부터 운영되고 있습니다.
                  </p>
                </section>

                {/* 추진 배경 & 기대효과 */}
                <div className="mb-8 grid gap-6 md:grid-cols-2">
                  <section>
                    <h3 className="mb-4 text-xl font-bold text-white">추진 배경</h3>
                    <div className="space-y-3">
                      {["베이비부머 세대의 조기퇴직으로 인한 경제환경 변화 대응", "경험을 바탕으로 한 준비된 창업자 육성 필요", "기업가정신 고취 및 창업 실패의 두려움 해소 필요"].map((text, i) => (
                        <motion.div key={i} whileHover={{ x: 5 }} className="flex gap-3 rounded-lg bg-purple-500/10 p-3">
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/30 text-xs font-bold text-purple-300">{i + 1}</span>
                          <p className="text-sm text-gray-300">{text}</p>
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-4 text-xl font-bold text-white">기대효과</h3>
                    <div className="space-y-3">
                      {["베이비부머 세대 퇴직 및 고령화 대책", "시니어의 사회경험을 바탕으로 지역사회 발전 기여", "시니어 창업 생태계 조성"].map((text, i) => (
                        <motion.div key={i} whileHover={{ x: -5 }} className="flex gap-3 rounded-lg bg-green-500/10 p-3">
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500/30 text-xs font-bold text-green-300">{i + 1}</span>
                          <p className="text-sm text-gray-300">{text}</p>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* 주요 추진 전략 */}
                <section className="mb-8">
                  <h3 className="mb-4 text-xl font-bold text-white">주요 추진 전략</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-6 text-center cursor-pointer"
                    >
                      <h4 className="mb-2 font-bold text-white">스타트업 창업교육</h4>
                      <p className="text-sm text-gray-400">체계적인 창업 교육 프로그램</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-6 text-center cursor-pointer"
                    >
                      <h4 className="mb-2 font-bold text-white">디자인 융합지원</h4>
                      <p className="text-sm text-gray-400">디자인 기반 제품/서비스 개발</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-600/10 p-6 text-center cursor-pointer"
                    >
                      <h4 className="mb-2 font-bold text-white">창업네트워크 강화</h4>
                      <p className="text-sm text-gray-400">멘토링 및 네트워킹 지원</p>
                    </motion.div>
                  </div>
                </section>

                {/* 사업 목표 - 단계별 스케일업 */}
                <section className="mb-8">
                  <h3 className="mb-6 text-xl font-bold text-white text-center">사업 목표</h3>
                  <div className="flex flex-col items-center gap-4 md:flex-row md:items-stretch md:justify-center">
                    {/* STEP 1 */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="relative flex flex-col items-center w-full md:w-1/3"
                    >
                      <div className="w-full h-full rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-6 text-center flex flex-col items-center justify-center min-h-[180px]">
                        <div className="mb-3 flex justify-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/30 text-lg font-bold text-blue-400">
                            1
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-blue-300 mb-2">STEP 1</p>
                        <p className="text-sm font-medium text-white">시니어 성공창업을<br/>위한 프로그램 구축</p>
                      </div>
                      {/* 화살표 (모바일에서는 아래, 데스크탑에서는 오른쪽) */}
                      <div className="my-2 text-gray-400 md:hidden">↓</div>
                      <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-2xl text-gray-400 md:block">→</div>
                    </motion.div>

                    {/* STEP 2 */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="relative flex flex-col items-center w-full md:w-1/3"
                    >
                      <div className="w-full h-full rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-6 text-center flex flex-col items-center justify-center min-h-[180px]">
                        <div className="mb-3 flex justify-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/30 text-xl font-bold text-purple-400">
                            2
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-purple-300 mb-2">STEP 2</p>
                        <p className="text-base font-medium text-white">창업활성화<br/>및 일자리 창출</p>
                      </div>
                      {/* 화살표 */}
                      <div className="my-2 text-gray-400 md:hidden">↓</div>
                      <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-2xl text-gray-400 md:block">→</div>
                    </motion.div>

                    {/* STEP 3 */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="flex flex-col items-center w-full md:w-1/3"
                    >
                      <div className="w-full h-full rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-600/10 p-6 text-center flex flex-col items-center justify-center min-h-[180px] shadow-lg shadow-green-500/20">
                        <div className="mb-3 flex justify-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/30 text-2xl font-bold text-green-400">
                            3
                          </div>
                        </div>
                        <p className="text-base font-semibold text-green-300 mb-2">STEP 3</p>
                        <p className="text-lg font-bold text-white">시니어 창업<br/>표준모델 수립</p>
                      </div>
                    </motion.div>
                  </div>
                </section>

                {/* 위치 정보 */}
                <section>
                  <h3 className="mb-4 text-xl font-bold text-white text-center">오시는 길</h3>
                  <div className="space-y-4 max-w-3xl mx-auto">
                    {/* 네이버 지도 */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="rounded-lg overflow-hidden border border-indigo-500/30 bg-white"
                    >
                      <iframe
                        src="https://map.naver.com/p/search/서울특별시%20성북구%20화랑로%20211/place/1363726009?c=15.00,0,0,0,dh&placePath=%3Fentry%253Dbmp"
                        width="100%"
                        height="300"
                        frameBorder="0"
                        allowFullScreen={true}
                      />
                    </motion.div>

                    {/* 2x2 그리드 정보 */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* 1. 주소 (상단 좌) */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="rounded-lg bg-indigo-500/10 p-6 text-center h-full flex flex-col items-center justify-start min-h-[200px]"
                      >
                        <div className="flex justify-center mb-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/30 text-indigo-400">
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        <p className="font-semibold text-white text-lg mb-3">주소</p>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-300 leading-relaxed">서울특별시 성북구 화랑로 211</p>
                          <p className="text-sm text-gray-300 leading-relaxed">성북구벤처창업지원센터</p>
                          <p className="text-sm text-gray-300 leading-relaxed">B104·B105</p>
                        </div>
                      </motion.div>

                      {/* 2. 교통 안내 (상단 우) */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="rounded-lg bg-purple-500/10 p-6 text-center h-full flex flex-col items-center justify-start min-h-[200px]"
                      >
                        <div className="flex justify-center mb-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/30 text-purple-400">
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        <p className="font-semibold text-white text-lg mb-3">교통 안내</p>
                        <div className="space-y-2 text-sm text-gray-300">
                          <div>
                            <p className="text-blue-300 font-medium mb-1">🚇 지하철</p>
                            <p className="text-xs">6호선 상월곡역 2번 출구</p>
                            <p className="text-xs">6호선 돌곶이역 1번 출구 (도보 5분)</p>
                          </div>
                          <div className="mt-2">
                            <p className="text-green-300 font-medium mb-1">🚌 버스</p>
                            <p className="text-xs">1111번, 163번, 120번</p>
                            <p className="text-xs">새석관시장 하차 (도보 3분)</p>
                          </div>
                        </div>
                      </motion.div>

                      {/* 3. 전화 (하단 좌) */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="rounded-lg bg-blue-500/10 p-6 text-center h-full flex flex-col items-center justify-center min-h-[160px]"
                      >
                        <div className="flex justify-center mb-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/30 text-blue-400">
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        <p className="font-semibold text-white text-lg mb-4">전화</p>
                        <p className="text-lg font-medium text-blue-300">02-941-7257</p>
                      </motion.div>

                      {/* 4. 이메일 (하단 우) */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="rounded-lg bg-green-500/10 p-6 text-center h-full flex flex-col items-center justify-center min-h-[160px]"
                      >
                        <div className="flex justify-center mb-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/30 text-green-400">
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        <p className="font-semibold text-white text-lg mb-4">이메일</p>
                        <p className="text-base font-medium text-green-300">senior@hansung.ac.kr</p>
                      </motion.div>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
