// Create Prisma schema directly using SQL
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const createTableSQL = `
-- Notice table
CREATE TABLE IF NOT EXISTS "Notice" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "author" TEXT NOT NULL,
  "views" INTEGER NOT NULL DEFAULT 0,
  "date" TEXT NOT NULL,
  "images" TEXT,
  "files" TEXT,
  "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Company table
CREATE TABLE IF NOT EXISTS "Company" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "tag" TEXT NOT NULL,
  "desc" TEXT NOT NULL,
  "detailedDesc" TEXT,
  "year" TEXT,
  "achievements" TEXT,
  "website" TEXT,
  "logo" TEXT,
  "images" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Program table
CREATE TABLE IF NOT EXISTS "Program" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "desc" TEXT NOT NULL,
  "gradient" TEXT NOT NULL,
  "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
  "category" TEXT,
  "startDate" TEXT,
  "endDate" TEXT,
  "capacity" INTEGER,
  "location" TEXT,
  "instructor" TEXT,
  "images" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Partner table
CREATE TABLE IF NOT EXISTS "Partner" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "link" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User table
CREATE TABLE IF NOT EXISTS "User" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'USER',
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "phone" TEXT,
  "company" TEXT,
  "position" TEXT,
  "businessNumber" TEXT UNIQUE,
  "lastLoginAt" TIMESTAMP(3),
  "loginCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CalendarEvent table
CREATE TABLE IF NOT EXISTS "CalendarEvent" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "location" TEXT,
  "category" TEXT,
  "maxParticipants" INTEGER,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Application table
CREATE TABLE IF NOT EXISTS "Application" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "programId" INTEGER,
  "programTitle" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  "reviewedBy" TEXT,
  "reviewNote" TEXT,
  "message" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- EventParticipation table
CREATE TABLE IF NOT EXISTS "EventParticipation" (
  "id" SERIAL PRIMARY KEY,
  "eventId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("eventId") REFERENCES "CalendarEvent"("id") ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  UNIQUE("eventId", "userId")
);

-- EventComment table
CREATE TABLE IF NOT EXISTS "EventComment" (
  "id" SERIAL PRIMARY KEY,
  "eventId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("eventId") REFERENCES "CalendarEvent"("id") ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_notice_category" ON "Notice"("category");
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");
CREATE INDEX IF NOT EXISTS "idx_user_role" ON "User"("role");
CREATE INDEX IF NOT EXISTS "idx_application_user" ON "Application"("userId");
CREATE INDEX IF NOT EXISTS "idx_event_participation" ON "EventParticipation"("eventId", "userId");
`;

async function createSchema() {
  try {
    await client.connect();
    console.log('✅ Connected to Supabase\n');
    console.log('📝 Creating tables...\n');

    await client.query(createTableSQL);

    console.log('✅ All tables created successfully!\n');

    // Verify tables
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('📋 Tables in database:');
    result.rows.forEach(row => {
      console.log('  ✓', row.table_name);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

createSchema();
