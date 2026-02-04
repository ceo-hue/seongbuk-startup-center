// Test Supabase Database Connection
require('dotenv').config();
const { Client } = require('pg');

console.log('=== Supabase Connection Test ===\n');
console.log('Environment variables:');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DIRECT_URL exists:', !!process.env.DIRECT_URL);

// Parse connection string
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  const url = new URL(dbUrl);
  console.log('\nConnection details:');
  console.log('Host:', url.hostname);
  console.log('Port:', url.port);
  console.log('Database:', url.pathname.substring(1));
  console.log('Username:', url.username);
  console.log('Password length:', url.password.length);
  console.log('Has pgbouncer:', url.searchParams.has('pgbouncer'));
}

console.log('\n=== Testing Connection ===\n');

// Test with Connection Pooling
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('✅ Connection successful!\n');

    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query successful!');
    console.log('Server time:', result.rows[0].now);

    // Check existing tables
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('\n📋 Existing tables:');
    tables.rows.forEach(row => {
      console.log('  -', row.table_name);
    });

  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await client.end();
  }
}

testConnection();
