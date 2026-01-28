import React from "react";
import { TopNav } from "@/app/components/layout/TopNav";
import { HeroSection } from "@/app/components/sections/HeroSection";
import { ProgramsSection } from "@/app/components/sections/ProgramsSection";
import { CompaniesSection } from "@/app/components/sections/CompaniesSection";
import { NoticesSection } from "@/app/components/sections/NoticesSection";
import { PartnersSection } from "@/app/components/sections/PartnersSection";
import { ContactSection } from "@/app/components/sections/ContactSection";

export default function InteractiveShowcase() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden pt-16 text-white">
      <TopNav />

      {/* 🔹 1. 배경 이미지 레이어 */}
      <div
        className="pointer-events-none fixed inset-0 -z-30 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=90&w=3840')"
        }}
      />

      {/* 🔹 2. 다크 오버레이 (텍스트 가독성) */}
      <div className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-b from-[#050609]/70 via-[#050609]/75 to-[#050609]/80" />

      {/* 🔹 3. 컬러 그라디언트 레이어 */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 mix-blend-screen opacity-25"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(68,132,255,0.3), transparent 60%), radial-gradient(circle at 70% 80%, rgba(255,87,87,0.25), transparent 55%)"
        }}
      />

      {/* Sections */}
      <HeroSection />
      <ProgramsSection />
      <CompaniesSection />
      <NoticesSection />
      <PartnersSection />
      <ContactSection />
    </div>
  );
}
