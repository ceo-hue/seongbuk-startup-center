// Data migration with retry logic for circuit breaker
const Database = require('better-sqlite3');
const { Client } = require('pg');

const SUPABASE_URL = 'postgresql://postgres.ftafxdsbpaixkjagpgpc:whyst6762%5E%5E@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function connectWithRetry(maxRetries = 3, delayMs = 5000) {
  const client = new Client({
    connectionString: SUPABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Connection attempt ${attempt}/${maxRetries}...`);
      await client.connect();
      console.log('✅ Connected to Supabase!\n');
      return client;
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed: ${error.message}`);

      if (attempt < maxRetries) {
        console.log(`⏳ Waiting ${delayMs/1000} seconds before retry...\n`);
        await sleep(delayMs);
      } else {
        throw new Error(`Failed to connect after ${maxRetries} attempts. Please wait 10-15 minutes for Circuit Breaker to reset.`);
      }
    }
  }
}

async function migrate() {
  const localDb = new Database('./prisma/dev.db', { readonly: true });
  let supabase;

  try {
    console.log('🚀 Starting data migration...\n');

    // Connect with retry
    supabase = await connectWithRetry();

    // Load local data
    const notices = localDb.prepare('SELECT * FROM Notice').all();
    const companies = localDb.prepare('SELECT * FROM Company').all();
    const programs = localDb.prepare('SELECT * FROM Program').all();
    const partners = localDb.prepare('SELECT * FROM Partner').all();
    const users = localDb.prepare('SELECT * FROM User').all();

    console.log('📊 Data to migrate:');
    console.log(`  Notices: ${notices.length}`);
    console.log(`  Companies: ${companies.length}`);
    console.log(`  Programs: ${programs.length}`);
    console.log(`  Partners: ${partners.length}`);
    console.log(`  Users: ${users.length}\n`);

    // Migrate Notices
    console.log('📢 Migrating Notices...');
    for (const n of notices) {
      await supabase.query(`
        INSERT INTO "Notice" (title, content, category, author, views, date, images, files, visibility, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, to_timestamp($10::bigint / 1000.0), to_timestamp($11::bigint / 1000.0))
      `, [n.title, n.content, n.category, n.author, n.views, n.date, n.images, n.files, n.visibility, n.createdAt, n.updatedAt]);
    }
    console.log(`  ✓ ${notices.length} notices migrated\n`);

    // Migrate Companies
    console.log('🏢 Migrating Companies...');
    for (const c of companies) {
      await supabase.query(`
        INSERT INTO "Company" (name, tag, "desc", "detailedDesc", year, achievements, website, logo, images, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, to_timestamp($10::bigint / 1000.0), to_timestamp($11::bigint / 1000.0))
      `, [c.name, c.tag, c.desc, c.detailedDesc, c.year, c.achievements, c.website, c.logo, c.images, c.createdAt, c.updatedAt]);
    }
    console.log(`  ✓ ${companies.length} companies migrated\n`);

    // Migrate Programs
    console.log('📚 Migrating Programs...');
    for (const p of programs) {
      await supabase.query(`
        INSERT INTO "Program" (title, "desc", gradient, visibility, category, "startDate", "endDate", capacity, location, instructor, images, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, to_timestamp($12::bigint / 1000.0), to_timestamp($13::bigint / 1000.0))
      `, [p.title, p.desc, p.gradient, p.visibility, p.category, p.startDate, p.endDate, p.capacity, p.location, p.instructor, p.images, p.createdAt, p.updatedAt]);
    }
    console.log(`  ✓ ${programs.length} programs migrated\n`);

    // Migrate Partners
    console.log('🤝 Migrating Partners...');
    for (const p of partners) {
      await supabase.query(`
        INSERT INTO "Partner" (name, link, "createdAt", "updatedAt")
        VALUES ($1, $2, to_timestamp($3::bigint / 1000.0), to_timestamp($4::bigint / 1000.0))
        ON CONFLICT (name) DO NOTHING
      `, [p.name, p.link, p.createdAt, p.updatedAt]);
    }
    console.log(`  ✓ ${partners.length} partners migrated\n`);

    // Migrate Users
    console.log('👥 Migrating Users...');
    for (const u of users) {
      await supabase.query(`
        INSERT INTO "User" (email, password, name, role, "isVerified", phone, company, position, "businessNumber", "lastLoginAt", "loginCount", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, to_timestamp($12::bigint / 1000.0), to_timestamp($13::bigint / 1000.0))
        ON CONFLICT (email) DO NOTHING
      `, [u.email, u.password, u.name, u.role, u.isVerified ? 1 : 0, u.phone, u.company, u.position, u.businessNumber, u.lastLoginAt ? new Date(u.lastLoginAt) : null, u.loginCount, u.createdAt, u.updatedAt]);
    }
    console.log(`  ✓ ${users.length} users migrated\n`);

    console.log('✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n💡 Tip: If you see "Circuit breaker" error, wait 10-15 minutes and try again.');
    process.exit(1);
  } finally {
    localDb.close();
    if (supabase) await supabase.end();
  }
}

console.log('╔════════════════════════════════════════════╗');
console.log('║  Data Migration: SQLite → Supabase         ║');
console.log('╚════════════════════════════════════════════╝\n');

migrate();
