const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./leads.db');

db.all('SELECT id, phone, language, created_at, status FROM leads ORDER BY id DESC', [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('\n📱 Current Subscribers in Database:\n');
    console.log('ID | Phone         | Language | Date/Time              | Status');
    console.log('---|---------------|----------|------------------------|--------');
    rows.forEach(row => {
      const phone = '+' + row.phone.padEnd(13);
      const lang = row.language.padEnd(8);
      const dt = row.created_at.substring(0, 19).padEnd(22);
      console.log(`${String(row.id).padEnd(2)} | ${phone} | ${lang} | ${dt} | ${row.status}`);
    });
    console.log(`\n📊 Total Subscribers: ${rows.length}\n`);
  }
  db.close();
});
