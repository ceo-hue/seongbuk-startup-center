const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

async function checkData() {
  try {
    const notices = await prisma.notice.findMany();
    const companies = await prisma.company.findMany();
    const programs = await prisma.program.findMany();
    const partners = await prisma.partner.findMany();
    const users = await prisma.user.findMany();

    console.log('📊 Local Database Content:\n');
    console.log(`📢 Notices: ${notices.length}`);
    console.log(`🏢 Companies: ${companies.length}`);
    console.log(`📚 Programs: ${programs.length}`);
    console.log(`🤝 Partners: ${partners.length}`);
    console.log(`👥 Users: ${users.length}`);

    if (notices.length > 0) {
      console.log('\n최근 공지사항:');
      notices.slice(0, 3).forEach(n => console.log(`  - ${n.title}`));
    }

    if (companies.length > 0) {
      console.log('\n입주기업:');
      companies.forEach(c => console.log(`  - ${c.name}: ${c.tag}`));
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
