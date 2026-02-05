// Simple data migration script using direct SQL
const { PrismaClient } = require('@prisma/client');
const { Client } = require('pg');

// Supabase connection
const SUPABASE_URL = 'postgresql://postgres.ftafxdsbpaixkjagpgpc:whyst6762%5E%5E@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';

const prismaLocal = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

const supabase = new Client({
  connectionString: SUPABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log('🔄 Connecting to databases...\n');

    await supabase.connect();
    console.log('✅ Connected to Supabase\n');

    // 1. Notices
    console.log('📢 Migrating Notices...');
    const notices = await prismaLocal.notice.findMany();
    for (const n of notices) {
      await supabase.query(`
        INSERT INTO "Notice" (title, content, category, author, views, date, images, files, visibility, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [n.title, n.content, n.category, n.author, n.views, n.date, n.images, n.files, n.visibility, n.createdAt, n.updatedAt]);
    }
    console.log(`  ✓ ${notices.length} notices\n`);

    // 2. Companies
    console.log('🏢 Migrating Companies...');
    const companies = await prismaLocal.company.findMany();
    for (const c of companies) {
      await supabase.query(`
        INSERT INTO "Company" (name, tag, "desc", "detailedDesc", year, achievements, website, logo, images, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [c.name, c.tag, c.desc, c.detailedDesc, c.year, c.achievements, c.website, c.logo, c.images, c.createdAt, c.updatedAt]);
    }
    console.log(`  ✓ ${companies.length} companies\n`);

    // 3. Programs
    console.log('📚 Migrating Programs...');
    const programs = await prismaLocal.program.findMany();
    for (const p of programs) {
      await supabase.query(`
        INSERT INTO "Program" (title, "desc", gradient, visibility, category, "startDate", "endDate", capacity, location, instructor, images, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [p.title, p.desc, p.gradient, p.visibility, p.category, p.startDate, p.endDate, p.capacity, p.location, p.instructor, p.images, p.createdAt, p.updatedAt]);
    }
    console.log(`  ✓ ${programs.length} programs\n`);

    // 4. Partners
    console.log('🤝 Migrating Partners...');
    const partners = await prismaLocal.partner.findMany();
    for (const p of partners) {
      await supabase.query(`
        INSERT INTO "Partner" (name, link, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO NOTHING
      `, [p.name, p.link, p.createdAt, p.updatedAt]);
    }
    console.log(`  ✓ ${partners.length} partners\n`);

    // 5. Users
    console.log('👥 Migrating Users...');
    const users = await prismaLocal.user.findMany();
    for (const u of users) {
      await supabase.query(`
        INSERT INTO "User" (email, password, name, role, "isVerified", phone, company, position, "businessNumber", "lastLoginAt", "loginCount", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (email) DO NOTHING
      `, [u.email, u.password, u.name, u.role, u.isVerified, u.phone, u.company, u.position, u.businessNumber, u.lastLoginAt, u.loginCount, u.createdAt, u.updatedAt]);
    }
    console.log(`  ✓ ${users.length} users\n`);

    console.log('✅ Migration completed!\n');
    console.log('📊 Summary:');
    console.log(`  Notices: ${notices.length}`);
    console.log(`  Companies: ${companies.length}`);
    console.log(`  Programs: ${programs.length}`);
    console.log(`  Partners: ${partners.length}`);
    console.log(`  Users: ${users.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prismaLocal.$disconnect();
    await supabase.end();
  }
}

migrate();
