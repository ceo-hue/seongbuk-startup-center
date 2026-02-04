# Vercel + Supabase 배포 가이드

## 1. Supabase 프로젝트 설정

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택 또는 새로 생성
3. **Settings > Database** 메뉴로 이동
4. **Connection string** 섹션에서 다음 두 개의 URL 복사:
   - **Connection pooling** (Transaction mode) - Vercel용
   - **Direct connection** - 마이그레이션용

## 2. Vercel 환경 변수 설정

Vercel Dashboard > Your Project > Settings > Environment Variables에서 다음을 추가:

```bash
# Database (Connection Pooling - Transaction mode)
DATABASE_URL=postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct URL (for migrations)
DIRECT_URL=postgres://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres

# JWT Secret (32자 이상의 강력한 키로 변경!)
JWT_SECRET=your-production-secret-key-at-least-32-characters-long

# Environment
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

## 3. 데이터베이스 마이그레이션 실행

로컬에서 Supabase 데이터베이스에 마이그레이션 실행:

```bash
# 1. .env 파일에 Supabase 연결 정보 임시 설정
DATABASE_URL="postgres://..."
DIRECT_URL="postgres://..."

# 2. Prisma 클라이언트 재생성
npx prisma generate

# 3. 마이그레이션 실행
npx prisma migrate deploy

# 4. 관리자 계정 생성
node scripts/create-admin.mjs

# 5. 로컬 개발용으로 .env 복원
DATABASE_URL="file:./dev.db"
```

## 4. Vercel 배포

```bash
# GitHub에 푸시
git add .
git commit -m "Setup Vercel deployment with Supabase"
git push origin master

# Vercel이 자동으로 배포를 시작합니다
```

## 5. 배포 후 확인사항

- [ ] 사이트 접속 확인
- [ ] 로그인 테스트 (admin@seongbuk.com / admin123)
- [ ] 관리자 페이지 접근 확인
- [ ] API 엔드포인트 동작 확인

## 트러블슈팅

### "Can't reach database server" 오류
- DATABASE_URL의 `pgbouncer=true` 파라미터 확인
- Connection pooling (Transaction mode) URL 사용 확인
- Supabase 프로젝트가 활성 상태인지 확인

### 마이그레이션 실패
- DIRECT_URL (Direct connection) 사용 확인
- Supabase Database Password 확인
- 네트워크 연결 확인

### JWT 토큰 오류
- JWT_SECRET이 32자 이상인지 확인
- Vercel 환경 변수에 올바르게 설정되었는지 확인
