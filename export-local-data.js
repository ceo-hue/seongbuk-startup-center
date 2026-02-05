const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('./prisma/dev.db', { readonly: true });

try {
  const notices = db.prepare('SELECT * FROM Notice').all();
  const companies = db.prepare('SELECT * FROM Company').all();
  const programs = db.prepare('SELECT * FROM Program').all();
  const partners = db.prepare('SELECT * FROM Partner').all();
  const users = db.prepare('SELECT * FROM User').all();

  console.log('📊 Local Database Content:\n');
  console.log(`📢 Notices: ${notices.length}`);
  console.log(`🏢 Companies: ${companies.length}`);
  console.log(`📚 Programs: ${programs.length}`);
  console.log(`🤝 Partners: ${partners.length}`);
  console.log(`👥 Users: ${users.length}\n`);

  // Export to JSON
  const data = {
    notices,
    companies,
    programs,
    partners,
    users: users.map(u => ({ ...u, password: '***' })) // Hide passwords
  };

  fs.writeFileSync('./local-data-export.json', JSON.stringify(data, null, 2));
  console.log('✅ Data exported to local-data-export.json\n');

  // Preview
  if (notices.length > 0) {
    console.log('최근 공지사항:');
    notices.slice(0, 3).forEach(n => console.log(`  - ${n.title}`));
  }

  if (companies.length > 0) {
    console.log('\n입주기업:');
    companies.forEach(c => console.log(`  - ${c.name}`));
  }

} catch (error) {
  console.error('Error:', error.message);
} finally {
  db.close();
}
