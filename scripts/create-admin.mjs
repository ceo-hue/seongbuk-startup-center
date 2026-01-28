import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@seongbuk.com';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email }
  });

  if (existingAdmin) {
    console.log('관리자 계정이 이미 존재합니다.');
    console.log('이메일:', email);

    // Update to ADMIN role if not already
    if (existingAdmin.role !== 'ADMIN') {
      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN', isVerified: true }
      });
      console.log('기존 계정을 관리자로 업데이트했습니다.');
    }
  } else {
    // Create new admin user
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: '관리자',
        role: 'ADMIN',
        isVerified: true,
      },
    });

    console.log('관리자 계정이 생성되었습니다!');
    console.log('이메일:', email);
    console.log('비밀번호:', password);
    console.log('역할:', admin.role);
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
