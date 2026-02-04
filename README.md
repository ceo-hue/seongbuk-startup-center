# 성북구 중장년 기술창업센터

Next.js 15 + Prisma + TypeScript로 구축된 창업지원센터 웹사이트

## 주요 기능

- 🏢 입주기업 관리 및 소개
- 📢 공지사항 및 소식
- 📚 프로그램 안내 및 신청
- 👥 회원 관리 (일반/정회원/관리자)
- 📅 캘린더 일정 관리 (정회원 전용)
- 🔐 JWT 인증 시스템
- 👨‍💼 관리자 대시보드

## 기술 스택

- **Frontend**: Next.js 15, React 18, TailwindCSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**:
  - 로컬 개발: SQLite
  - 프로덕션: PostgreSQL (Supabase)
- **ORM**: Prisma
- **인증**: JWT + HTTP-only Cookies
- **배포**: Vercel

## 로컬 개발 환경 설정

### 1. 저장소 클론

\`\`\`bash
git clone https://github.com/ceo-hue/seongbuk-startup-center.git
cd seongbuk-startup-center
\`\`\`

### 2. 의존성 설치

\`\`\`bash
npm install
\`\`\`

### 3. 환경 변수 설정

\`\`\`bash
# .env 파일 생성 (SQLite 사용)
cp .env.local.example .env
\`\`\`

### 4. 데이터베이스 초기화

\`\`\`bash
# Prisma 클라이언트 생성
npx prisma generate

# 마이그레이션 실행
npx prisma migrate dev --name init

# 관리자 계정 생성
node scripts/create-admin.mjs
\`\`\`

### 5. 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

http://localhost:3000 에서 확인

## 기본 관리자 계정

- **이메일**: admin@seongbuk.com
- **비밀번호**: admin123

⚠️ **프로덕션 배포 전 반드시 비밀번호를 변경하세요!**

## Vercel 배포

자세한 배포 가이드는 [VERCEL_SETUP.md](./VERCEL_SETUP.md) 참고

## 프로젝트 구조

\`\`\`
.
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── admin/             # 관리자 페이지
│   ├── components/        # React 컴포넌트
│   ├── login/             # 로그인 페이지
│   ├── register/          # 회원가입 페이지
│   └── mypage/            # 마이페이지
├── lib/                   # 유틸리티 및 라이브러리
│   ├── core/              # 코어 기능 (에러처리, 보안 등)
│   ├── auth.ts            # 인증 로직
│   └── prisma.ts          # Prisma 클라이언트
├── prisma/                # 데이터베이스 스키마 및 마이그레이션
├── public/                # 정적 파일
└── scripts/               # 유틸리티 스크립트
\`\`\`

## 환경 변수

### 로컬 개발 (.env)

\`\`\`bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
\`\`\`

### Vercel 프로덕션

\`\`\`bash
DATABASE_URL="postgresql://..."  # Supabase Connection Pooling URL
DIRECT_URL="postgresql://..."    # Supabase Direct Connection URL
JWT_SECRET="production-secret-key-at-least-32-characters"
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
\`\`\`

## API 엔드포인트

- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/logout` - 로그아웃
- `GET/POST /api/notices` - 공지사항 조회/생성
- `GET/POST /api/programs` - 프로그램 조회/생성
- `GET/POST /api/companies` - 입주기업 조회/생성
- `GET/POST /api/partners` - 협력기관 조회/생성
- `GET/POST /api/users` - 회원 조회/생성 (관리자)

## 라이센스

MIT

## 문의

성북구 중장년 기술창업센터
