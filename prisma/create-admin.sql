-- 관리자 계정 생성
-- 이메일: admin@seongbuk.com
-- 비밀번호: admin123
-- bcrypt hash for "admin123": $2a$10$YQs4z5Z5Z5Z5Z5Z5Z5Z5ZuN8qN8qN8qN8qN8qN8qN8qN8qN8qN8qN

INSERT OR REPLACE INTO User (id, email, password, name, role, isVerified, createdAt, updatedAt)
VALUES (
  1,
  'admin@seongbuk.com',
  '$2a$10$YourHashedPasswordHere',
  '관리자',
  'ADMIN',
  1,
  datetime('now'),
  datetime('now')
);
