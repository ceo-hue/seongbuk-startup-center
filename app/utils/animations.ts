import { Variants } from "framer-motion";

// 페이드인 + 위로 슬라이드 애니메이션
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 60,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1], // 애플 스타일 easing
    },
  },
};

// 페이드인만 (텍스트용)
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 1,
      ease: "easeOut",
    },
  },
};

// 스케일 + 페이드인
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// 순차 애니메이션을 위한 컨테이너
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

// 카드 애니메이션
export const cardAnimation: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// 히어로 텍스트 특별 효과
export const heroTextAnimation: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      delay: custom * 0.15,
    },
  }),
};

// 애플 스타일 스크롤 뷰포트 옵션
export const viewportOptions = {
  once: true, // 한 번만 애니메이션 실행
  margin: "-100px", // 뷰포트에 100px 들어왔을 때 트리거
  amount: 0.2, // 요소의 20%가 보일 때 트리거
};
