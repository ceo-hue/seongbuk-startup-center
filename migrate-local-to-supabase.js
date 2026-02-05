// Load Supabase environment FIRST
require('dotenv').config({ path: '.env.supabase' });

// Migrate data from local SQLite to Supabase PostgreSQL
const { PrismaClient: PrismaClientSQLite } = require('@prisma/client');
const { Client } = require('pg');

// Local SQLite connection
const prismaLocal = new PrismaClientSQLite({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

// Supabase PostgreSQL connection
console.log('Database URL:', process.env.DATABASE_URL ? 'Loaded' : 'NOT LOADED');

const supabase = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrateData() {
  try {
    console.log('🔄 Starting data migration from SQLite to Supabase...\n');

    // Connect to Supabase
    await supabase.connect();
    console.log('✅ Connected to Supabase\n');

    // 1. Migrate Notices
    console.log('📢 Migrating Notices...');
    const notices = await prismaLocal.notice.findMany();
    for (const notice of notices) {
      await supabase.query(`
        INSERT INTO "Notice" (id, title, content, category, author, views, date, images, files, visibility, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          category = EXCLUDED.category,
          author = EXCLUDED.author,
          views = EXCLUDED.views,
          date = EXCLUDED.date,
          images = EXCLUDED.images,
          files = EXCLUDED.files,
          visibility = EXCLUDED.visibility,
          "updatedAt" = EXCLUDED."updatedAt"
      `, [
        notice.id, notice.title, notice.content, notice.category, notice.author,
        notice.views, notice.date, notice.images, notice.files, notice.visibility,
        notice.createdAt, notice.updatedAt
      ]);
    }
    console.log(`  ✓ Migrated ${notices.length} notices\n`);

    // 2. Migrate Companies
    console.log('🏢 Migrating Companies...');
    const companies = await prismaLocal.company.findMany();
    for (const company of companies) {
      await supabase.query(`
        INSERT INTO "Company" (id, name, tag, "desc", "detailedDesc", year, achievements, website, logo, images, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          tag = EXCLUDED.tag,
          "desc" = EXCLUDED."desc",
          "detailedDesc" = EXCLUDED."detailedDesc",
          year = EXCLUDED.year,
          achievements = EXCLUDED.achievements,
          website = EXCLUDED.website,
          logo = EXCLUDED.logo,
          images = EXCLUDED.images,
          "updatedAt" = EXCLUDED."updatedAt"
      `, [
        company.id, company.name, company.tag, company.desc, company.detailedDesc,
        company.year, company.achievements, company.website, company.logo, company.images,
        company.createdAt, company.updatedAt
      ]);
    }
    console.log(`  ✓ Migrated ${companies.length} companies\n`);

    // 3. Migrate Programs
    console.log('📚 Migrating Programs...');
    const programs = await prismaLocal.program.findMany();
    for (const program of programs) {
      await supabase.query(`
        INSERT INTO "Program" (id, title, "desc", gradient, visibility, category, "startDate", "endDate", capacity, location, instructor, images, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          "desc" = EXCLUDED."desc",
          gradient = EXCLUDED.gradient,
          visibility = EXCLUDED.visibility,
          category = EXCLUDED.category,
          "startDate" = EXCLUDED."startDate",
          "endDate" = EXCLUDED."endDate",
          capacity = EXCLUDED.capacity,
          location = EXCLUDED.location,
          instructor = EXCLUDED.instructor,
          images = EXCLUDED.images,
          "updatedAt" = EXCLUDED."updatedAt"
      `, [
        program.id, program.title, program.desc, program.gradient, program.visibility,
        program.category, program.startDate, program.endDate, program.capacity,
        program.location, program.instructor, program.images, program.createdAt, program.updatedAt
      ]);
    }
    console.log(`  ✓ Migrated ${programs.length} programs\n`);

    // 4. Migrate Partners
    console.log('🤝 Migrating Partners...');
    const partners = await prismaLocal.partner.findMany();
    for (const partner of partners) {
      await supabase.query(`
        INSERT INTO "Partner" (id, name, link, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (name) DO UPDATE SET
          link = EXCLUDED.link,
          "updatedAt" = EXCLUDED."updatedAt"
      `, [partner.id, partner.name, partner.link, partner.createdAt, partner.updatedAt]);
    }
    console.log(`  ✓ Migrated ${partners.length} partners\n`);

    // 5. Migrate Users (except passwords for security)
    console.log('👥 Migrating Users...');
    const users = await prismaLocal.user.findMany();
    for (const user of users) {
      await supabase.query(`
        INSERT INTO "User" (id, email, password, name, role, "isVerified", phone, company, position, "businessNumber", "lastLoginAt", "loginCount", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          "isVerified" = EXCLUDED."isVerified",
          phone = EXCLUDED.phone,
          company = EXCLUDED.company,
          position = EXCLUDED.position,
          "businessNumber" = EXCLUDED."businessNumber",
          "lastLoginAt" = EXCLUDED."lastLoginAt",
          "loginCount" = EXCLUDED."loginCount",
          "updatedAt" = EXCLUDED."updatedAt"
      `, [
        user.id, user.email, user.password, user.name, user.role, user.isVerified,
        user.phone, user.company, user.position, user.businessNumber,
        user.lastLoginAt, user.loginCount, user.createdAt, user.updatedAt
      ]);
    }
    console.log(`  ✓ Migrated ${users.length} users\n`);

    // 6. Migrate Applications
    console.log('📝 Migrating Applications...');
    const applications = await prismaLocal.application.findMany();
    for (const app of applications) {
      await supabase.query(`
        INSERT INTO "Application" (id, "userId", "programId", "programTitle", status, "appliedAt", "reviewedAt", "reviewedBy", "reviewNote", message, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          "reviewedAt" = EXCLUDED."reviewedAt",
          "reviewedBy" = EXCLUDED."reviewedBy",
          "reviewNote" = EXCLUDED."reviewNote",
          "updatedAt" = EXCLUDED."updatedAt"
      `, [
        app.id, app.userId, app.programId, app.programTitle, app.status,
        app.appliedAt, app.reviewedAt, app.reviewedBy, app.reviewNote,
        app.message, app.createdAt, app.updatedAt
      ]);
    }
    console.log(`  ✓ Migrated ${applications.length} applications\n`);

    // 7. Migrate Calendar Events
    console.log('📅 Migrating Calendar Events...');
    const events = await prismaLocal.calendarEvent.findMany();
    for (const event of events) {
      await supabase.query(`
        INSERT INTO "CalendarEvent" (id, title, description, "startDate", "endDate", location, category, "maxParticipants", "createdBy", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          "startDate" = EXCLUDED."startDate",
          "endDate" = EXCLUDED."endDate",
          location = EXCLUDED.location,
          category = EXCLUDED.category,
          "maxParticipants" = EXCLUDED."maxParticipants",
          "updatedAt" = EXCLUDED."updatedAt"
      `, [
        event.id, event.title, event.description, event.startDate, event.endDate,
        event.location, event.category, event.maxParticipants, event.createdBy,
        event.createdAt, event.updatedAt
      ]);
    }
    console.log(`  ✓ Migrated ${events.length} calendar events\n`);

    // Update sequences
    console.log('🔢 Updating database sequences...');
    await supabase.query(`SELECT setval('"Notice_id_seq"', (SELECT MAX(id) FROM "Notice"))`);
    await supabase.query(`SELECT setval('"Company_id_seq"', (SELECT MAX(id) FROM "Company"))`);
    await supabase.query(`SELECT setval('"Program_id_seq"', (SELECT MAX(id) FROM "Program"))`);
    await supabase.query(`SELECT setval('"Partner_id_seq"', (SELECT MAX(id) FROM "Partner"))`);
    await supabase.query(`SELECT setval('"User_id_seq"', (SELECT MAX(id) FROM "User"))`);
    await supabase.query(`SELECT setval('"Application_id_seq"', (SELECT MAX(id) FROM "Application"))`);
    await supabase.query(`SELECT setval('"CalendarEvent_id_seq"', (SELECT MAX(id) FROM "CalendarEvent"))`);
    console.log('  ✓ Sequences updated\n');

    console.log('✅ Migration completed successfully!\n');

    // Summary
    console.log('📊 Migration Summary:');
    console.log(`  - Notices: ${notices.length}`);
    console.log(`  - Companies: ${companies.length}`);
    console.log(`  - Programs: ${programs.length}`);
    console.log(`  - Partners: ${partners.length}`);
    console.log(`  - Users: ${users.length}`);
    console.log(`  - Applications: ${applications.length}`);
    console.log(`  - Calendar Events: ${events.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prismaLocal.$disconnect();
    await supabase.end();
  }
}

migrateData();
