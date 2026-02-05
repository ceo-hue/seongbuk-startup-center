import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('📊 Checking Supabase Database...\n');

    const [programs, notices, companies, partners, users] = await Promise.all([
      prisma.program.findMany(),
      prisma.notice.findMany(),
      prisma.company.findMany(),
      prisma.partner.findMany(),
      prisma.user.findMany()
    ]);

    console.log('📚 Programs:', programs.length);
    programs.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.title} (${p.visibility})`);
    });

    console.log('\n📢 Notices:', notices.length);
    notices.forEach((n, i) => {
      console.log(`  ${i + 1}. ${n.title}`);
    });

    console.log('\n🏢 Companies:', companies.length);
    companies.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name}`);
    });

    console.log('\n🤝 Partners:', partners.length);
    console.log('\n👥 Users:', users.length);

    if (programs.length === 0) {
      console.log('\n⚠️  WARNING: No programs found in database!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
