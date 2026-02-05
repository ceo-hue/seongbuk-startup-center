import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with initial data...\n');

    // Load seed data
    const seedDataPath = path.join(__dirname, '../prisma/seed-data.json');
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));

    // 1. Seed Partners (no dependencies)
    console.log('🤝 Seeding Partners...');
    for (const partner of seedData.partners) {
      await prisma.partner.upsert({
        where: { name: partner.name },
        update: { link: partner.link },
        create: partner
      });
    }
    console.log(`  ✓ ${seedData.partners.length} partners seeded\n`);

    // 2. Seed Programs
    console.log('📚 Seeding Programs...');
    for (const program of seedData.programs) {
      await prisma.program.create({
        data: program
      });
    }
    console.log(`  ✓ ${seedData.programs.length} programs seeded\n`);

    // 3. Seed Companies
    console.log('🏢 Seeding Companies...');
    for (const company of seedData.companies) {
      await prisma.company.create({
        data: {
          ...company,
          achievements: JSON.stringify(company.achievements)
        }
      });
    }
    console.log(`  ✓ ${seedData.companies.length} companies seeded\n`);

    // 4. Seed Notices
    console.log('📢 Seeding Notices...');
    for (const notice of seedData.notices) {
      await prisma.notice.create({
        data: notice
      });
    }
    console.log(`  ✓ ${seedData.notices.length} notices seeded\n`);

    console.log('✅ Database seeding completed successfully!\n');

    // Summary
    const counts = await Promise.all([
      prisma.notice.count(),
      prisma.company.count(),
      prisma.program.count(),
      prisma.partner.count(),
      prisma.user.count()
    ]);

    console.log('📊 Database Summary:');
    console.log(`  Notices: ${counts[0]}`);
    console.log(`  Companies: ${counts[1]}`);
    console.log(`  Programs: ${counts[2]}`);
    console.log(`  Partners: ${counts[3]}`);
    console.log(`  Users: ${counts[4]}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
