# Supabase 연결 설정 가이드

## 1. Supabase Dashboard에서 연결 정보 확인

### 방법 1: Connection String 직접 복사 (권장)

1. https://app.supabase.com 접속
2. 프로젝트 선택: **ftafxdsbpaixkjagpgpc**
3. 좌측 메뉴에서 **Settings** (⚙️) 클릭
4. **Database** 메뉴 선택
5. **Connection string** 섹션으로 스크롤

#### Transaction Pooling (Vercel용)
```
Mode: Transaction
URI 복사 버튼 클릭
```
이것이 `DATABASE_URL`입니다.

#### Direct Connection (마이그레이션용)
```
Connection parameters 탭 클릭
Host, Database name, Port, User 확인
또는 아래 Session Pooling의 URI를 복사
```
이것이 `DIRECT_URL`입니다.

### 방법 2: Connection Pooler 설정 확인

**Connection pooler (Supavisor):**
- Host: `aws-0-ap-northeast-2.pooler.supabase.com`
- Database: `postgres`
- Port:
  - Transaction mode (Vercel): `6543`
  - Session mode (Direct): `5432`
- User: `postgres.ftafxdsbpaixkjagpgpc`

## 2. 데이터베이스 비밀번호 찾기

### 옵션 A: 기존 비밀번호 사용
프로젝트 생성 시 설정한 비밀번호를 사용합니다.

### 옵션 B: 비밀번호 재설정
1. Supabase Dashboard > Settings > Database
2. **Database password** 섹션에서 **Reset database password** 클릭
3. 새 비밀번호 설정 및 저장

⚠️ **주의**: 비밀번호를 재설정하면 기존 연결이 모두 끊어집니다.

## 3. 연결 문자열 구성

비밀번호를 확인한 후 다음 형식으로 작성:

### DATABASE_URL (Transaction pooling)
```
postgresql://postgres.ftafxdsbpaixkjagpgpc:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### DIRECT_URL (Direct connection)
```
postgresql://postgres.ftafxdsbpaixkjagpgpc:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres
```

`[YOUR-PASSWORD]`를 실제 비밀번호로 교체하세요.

## 4. 로컬에서 Supabase 마이그레이션 테스트

```bash
# 1. .env.supabase 파일 수정 (비밀번호 입력)

# 2. 임시로 .env를 .env.supabase로 교체
cp .env .env.backup
cp .env.supabase .env

# 3. Prisma 클라이언트 재생성
npx prisma generate

# 4. 마이그레이션 실행
npx prisma migrate deploy

# 5. 관리자 계정 생성
node scripts/create-admin.mjs

# 6. 로컬 개발용 .env 복원
cp .env.backup .env
```

## 5. Vercel 환경 변수 설정

Vercel Dashboard > Your Project > Settings > Environment Variables

다음 변수들을 추가:

| Key | Value | Environment |
|-----|-------|-------------|
| DATABASE_URL | `postgresql://postgres.ftafxdsbpaixkjagpgpc:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true` | Production, Preview |
| DIRECT_URL | `postgresql://postgres.ftafxdsbpaixkjagpgpc:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres` | Production, Preview |
| JWT_SECRET | `seongbuk-startup-center-production-jwt-secret-key-2024-very-secure` | Production, Preview |
| NODE_ENV | `production` | Production |
| NEXT_PUBLIC_SITE_URL | `https://seongbuk-startup-center.vercel.app` | Production, Preview |
| NEXT_PUBLIC_SUPABASE_URL | `https://ftafxdsbpaixkjagpgpc.supabase.co` | Production, Preview |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | (위에서 제공된 anon key) | Production, Preview |

## 6. 배포 확인

1. Vercel에서 자동 배포 트리거
2. 배포 로그에서 빌드 성공 확인
3. 배포된 사이트 접속 테스트
4. 로그인 기능 테스트

## 트러블슈팅

### "Can't reach database server" 오류
- 비밀번호가 올바른지 확인
- URL 인코딩이 필요한 특수문자 확인 (예: `@` → `%40`)
- Supabase 프로젝트가 일시 중지되지 않았는지 확인

### 마이그레이션 실패
- DIRECT_URL을 사용하고 있는지 확인 (포트 5432)
- `pgbouncer=true` 파라미터가 없는지 확인

### Vercel 빌드 실패
- 환경 변수가 모두 설정되었는지 확인
- `prisma generate`가 빌드 스크립트에 포함되어 있는지 확인
