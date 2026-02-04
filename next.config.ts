import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 카페24 Node.js 호스팅용 standalone 출력 모드
  output: 'standalone',

  // Prisma 외부 패키지 설정
  serverExternalPackages: ['@prisma/client', 'prisma'],

  // 이미지 최적화 설정
  images: {
    unoptimized: true, // 카페24 호스팅에서 이미지 최적화 비활성화
  },

  // 프로덕션 최적화
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
