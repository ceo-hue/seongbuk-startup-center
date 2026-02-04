// 페이지 타이틀 관련 타입
export type PageTitleProps = {
  label?: string;
  kicker?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: "left" | "center";
};

// 프로그램 카드 타입
export type ProgramCard = {
  id?: number;
  title: string;
  desc: string;
  gradient: string;
  createdAt?: string;
  updatedAt?: string;
};

// 입주/졸업 기업 타입
export type Company = {
  id?: number;
  name: string;
  tag: string;
  desc: string;
  detailedDesc?: string;
  year?: string;
  achievements?: string[];
  website?: string;
  logo?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
};

// 공지사항 타입
export type Notice = {
  id?: number;
  title: string;
  date: string;
  content?: string;
  author?: string;
  category?: string;
  views?: number;
  images?: string[];
  files?: string[];
  createdAt?: string;
  updatedAt?: string;
};

// 협력 기관 타입 (문자열 또는 객체)
export type Partner = string | {
  id: number;
  name: string;
  link?: string;
  createdAt?: string;
  updatedAt?: string;
};
