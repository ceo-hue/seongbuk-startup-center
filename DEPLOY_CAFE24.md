# 카페24 Node.js 호스팅 배포 가이드

## 1. 사전 요구사항

### 카페24 호스팅 요구사항
- **카페24 Node.js 호스팅** 상품 필요 (일반 웹호스팅 X)
- Node.js 18.17.0 이상 지원 확인
- MySQL 데이터베이스 (권장)

### 로컬 빌드 확인
```bash
npm run build
```

---

## 2. 배포 전 설정

### 2.1 환경 변수 설정
1. `.env.production.example` 파일을 `.env.production`으로 복사
2. 실제 프로덕션 값으로 수정:

```env
# 카페24 MySQL 사용 시
DATABASE_URL="mysql://사용자명:비밀번호@localhost:3306/데이터베이스명"

# JWT Secret (반드시 변경!)
JWT_SECRET=최소32자이상의안전한비밀키를입력하세요
```

### 2.2 데이터베이스 변경 (SQLite → MySQL)

현재 SQLite를 사용 중입니다. 카페24 MySQL을 사용하려면:

1. `prisma/schema.prisma` 수정:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

2. Prisma 마이그레이션 실행:
```bash
npx prisma migrate dev --name init
```

---

## 3. 배포 파일 준비

### 3.1 필요한 파일/폴더
빌드 후 다음 파일들을 카페24에 업로드:

```
.next/standalone/       <- 메인 서버 파일
.next/static/           <- 정적 파일
public/                 <- 공개 파일
prisma/                 <- 데이터베이스 스키마
.env.production         <- 환경 변수 (이름을 .env로 변경)
```

### 3.2 폴더 구조 (카페24 업로드 후)
```
/home/사용자명/www/
├── .next/
│   ├── standalone/
│   │   ├── .next/
│   │   ├── node_modules/
│   │   ├── server.js      <- 엔트리포인트
│   │   └── package.json
│   └── static/            <- .next/standalone/.next/static으로 복사 필요
├── public/
├── prisma/
└── .env
```

---

## 4. 카페24 배포 단계

### 4.1 FTP/SFTP 업로드
1. 카페24 관리자 페이지에서 FTP 정보 확인
2. FileZilla 등으로 접속
3. 위 파일들을 `/www` 또는 지정된 폴더에 업로드

### 4.2 static 폴더 복사 (중요!)
```bash
# SSH 접속 후
cp -r .next/static .next/standalone/.next/
```

### 4.3 Node.js 앱 시작 설정
카페24 관리자에서:
- **시작 파일**: `.next/standalone/server.js`
- **Node.js 버전**: 18 이상
- **포트**: 카페24에서 지정한 포트 또는 3000

### 4.4 환경 변수 설정
카페24 관리자 패널에서 환경 변수 설정 또는 `.env` 파일 업로드

---

## 5. 데이터베이스 마이그레이션

### SSH 접속 후:
```bash
cd /home/사용자명/www
npx prisma migrate deploy
npx prisma db seed  # 초기 데이터 필요 시
```

---

## 6. 문제 해결

### 6.1 서버 시작 실패
- Node.js 버전 확인: `node -v` (18.17.0 이상 필요)
- 환경 변수 확인: `.env` 파일 존재 여부
- 로그 확인: 카페24 관리자 패널에서 에러 로그 확인

### 6.2 데이터베이스 연결 실패
- `DATABASE_URL` 형식 확인
- MySQL 권한 확인
- 방화벽 설정 확인

### 6.3 정적 파일 404 에러
- `.next/static` 폴더가 `.next/standalone/.next/static`에 있는지 확인
- `public` 폴더 업로드 확인

---

## 7. 주의사항

1. **SQLite 제한**: 파일 기반 DB라 카페24에서 제한적. MySQL 권장
2. **파일 업로드**: `public/uploads` 폴더 쓰기 권한 필요
3. **메모리 제한**: 카페24 호스팅 플랜에 따라 메모리 제한 있음
4. **SSL**: 카페24에서 제공하는 SSL 인증서 사용

---

## 8. 빠른 배포 체크리스트

- [ ] `npm run build` 성공
- [ ] `.env.production` 파일 생성 및 설정
- [ ] 데이터베이스 설정 (MySQL 권장)
- [ ] `.next/standalone` 폴더 업로드
- [ ] `.next/static` → `.next/standalone/.next/static` 복사
- [ ] `public` 폴더 업로드
- [ ] `prisma` 폴더 업로드
- [ ] 환경 변수 설정
- [ ] Node.js 앱 시작 설정
- [ ] 데이터베이스 마이그레이션
- [ ] 사이트 접속 테스트
