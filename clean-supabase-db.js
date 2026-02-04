// Clean Supabase Database and Prepare for Fresh Schema
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function cleanDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to Supabase\n');

    // Drop all existing tables
    console.log('🗑️  Dropping existing tables...\n');

    const dropTables = [
      'DROP TABLE IF EXISTS "EventComment" CASCADE',
      'DROP TABLE IF EXISTS "EventParticipation" CASCADE',
      'DROP TABLE IF EXISTS "CalendarEvent" CASCADE',
      'DROP TABLE IF EXISTS "Application" CASCADE',
      'DROP TABLE IF EXISTS "User" CASCADE',
      'DROP TABLE IF EXISTS "Program" CASCADE',
      'DROP TABLE IF EXISTS "Partner" CASCADE',
      'DROP TABLE IF EXISTS "Company" CASCADE',
      'DROP TABLE IF EXISTS "Notice" CASCADE',
      'DROP TABLE IF EXISTS applications CASCADE',
      'DROP TABLE IF EXISTS companies CASCADE',
      'DROP TABLE IF EXISTS contacts CASCADE',
      'DROP TABLE IF EXISTS notices CASCADE',
      'DROP TABLE IF EXISTS partners CASCADE',
      'DROP TABLE IF EXISTS programs CASCADE',
      'DROP TABLE IF EXISTS "_prisma_migrations" CASCADE'
    ];

    for (const dropSql of dropTables) {
      try {
        await client.query(dropSql);
        console.log(`  ✓ ${dropSql}`);
      } catch (err) {
        console.log(`  ⚠ ${dropSql.substring(0, 50)}... (already dropped)`);
      }
    }

    console.log('\n✅ Database cleaned successfully!');
    console.log('📌 Now you can run: npx prisma db push\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

cleanDatabase();
