// 권한 관리 유틸리티

export type Visibility = 'PUBLIC' | 'MEMBER_ONLY' | 'ADMIN_ONLY';
export type UserRole = 'USER' | 'RESIDENT_COMPANY' | 'GRADUATED_COMPANY' | 'ADMIN';

/**
 * 컨텐츠에 접근할 수 있는지 체크
 * @param userRole 사용자 역할 (null = 비로그인)
 * @param contentVisibility 컨텐츠 공개 범위
 * @returns 접근 가능 여부
 */
export function canAccessContent(
  userRole: UserRole | null,
  contentVisibility: Visibility
): boolean {
  switch (contentVisibility) {
    case 'PUBLIC':
      // 모든 사용자 접근 가능 (비로그인 포함)
      return true;

    case 'MEMBER_ONLY':
      // 입주기업 + 졸업기업 + 관리자만 접근 가능
      return userRole === 'RESIDENT_COMPANY' ||
             userRole === 'GRADUATED_COMPANY' ||
             userRole === 'ADMIN';

    case 'ADMIN_ONLY':
      // 관리자만 접근 가능
      return userRole === 'ADMIN';

    default:
      return false;
  }
}

/**
 * 정회원인지 체크 (입주기업 + 졸업기업)
 * @param role 사용자 역할
 * @returns 정회원 여부
 */
export function isMemberCompany(role: UserRole | null): boolean {
  return role === 'RESIDENT_COMPANY' || role === 'GRADUATED_COMPANY';
}

/**
 * 관리자인지 체크
 * @param role 사용자 역할
 * @returns 관리자 여부
 */
export function isAdmin(role: UserRole | null): boolean {
  return role === 'ADMIN';
}

// 역할별 레이블
export const ROLE_LABELS: Record<UserRole, string> = {
  USER: '일반 회원',
  RESIDENT_COMPANY: '입주기업',
  GRADUATED_COMPANY: '졸업기업',
  ADMIN: '관리자',
};

// 역할별 색상
export const ROLE_COLORS: Record<UserRole, string> = {
  USER: 'bg-gray-500/20 text-gray-400',
  RESIDENT_COMPANY: 'bg-green-500/20 text-green-400',
  GRADUATED_COMPANY: 'bg-blue-500/20 text-blue-400',
  ADMIN: 'bg-purple-500/20 text-purple-400',
};

// 권한별 레이블
export const VISIBILITY_LABELS: Record<Visibility, string> = {
  PUBLIC: '전체 공개',
  MEMBER_ONLY: '정회원 전용',
  ADMIN_ONLY: '관리자 전용',
};

// 권한별 색상
export const VISIBILITY_COLORS: Record<Visibility, string> = {
  PUBLIC: 'bg-green-500/20 text-green-400',
  MEMBER_ONLY: 'bg-blue-500/20 text-blue-400',
  ADMIN_ONLY: 'bg-purple-500/20 text-purple-400',
};

// 권한별 아이콘
export const VISIBILITY_ICONS: Record<Visibility, string> = {
  PUBLIC: '🌐',
  MEMBER_ONLY: '🔒',
  ADMIN_ONLY: '⚙️',
};

// 신청 상태 레이블
export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: '승인 대기',
  APPROVED: '승인됨',
  REJECTED: '반려됨',
};

// 신청 상태 색상
export const APPLICATION_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  APPROVED: 'bg-green-500/20 text-green-400',
  REJECTED: 'bg-red-500/20 text-red-400',
};
