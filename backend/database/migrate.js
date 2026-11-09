require('dotenv').config({ quiet: true });
const fs = require('node:fs');
const path = require('node:path');
const db = require('../config/database');

const migrations = ['20261022_02_core_commerce.sql'];

async function ensureUsersSchema() {
  const [tables] = await db.execute(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'"
  );
  if (tables.length === 0) {
    throw new Error('The users table is missing. For a new database, import database/schema.sql first.');
  }

  const [columns] = await db.execute(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'"
  );
  if (!columns.some((column) => column.COLUMN_NAME === 'telepon')) {
    await db.execute('ALTER TABLE users ADD COLUMN telepon VARCHAR(20) NULL AFTER email');
  }

  await db.execute(
    "ALTER TABLE users MODIFY role ENUM('admin','kasir','gudang','super_admin','customer') NOT NULL DEFAULT 'customer'"
  );
  await db.execute(
    "UPDATE users SET role = CASE WHEN role IN ('admin','super_admin') THEN 'super_admin' ELSE 'customer' END"
  );
  await db.execute(
    "ALTER TABLE users MODIFY role ENUM('super_admin','customer') NOT NULL DEFAULT 'customer'"
  );
}

async function runMigrations() {
  await ensureUsersSchema();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(190) PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);
  const [appliedRows] = await db.execute('SELECT version FROM schema_migrations');
  const applied = new Set(appliedRows.map((row) => row.version));

  for (const filename of migrations) {
    if (applied.has(filename)) {
      console.log(`Skipping already applied migration: ${filename}`);
      continue;
    }
    const migrationPath = path.join(__dirname, 'migrations', filename);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    const statements = sql.split(';').map((statement) => statement.trim()).filter(Boolean);
    for (const statement of statements) await db.execute(statement);
    await db.execute('INSERT INTO schema_migrations (version) VALUES (?)', [filename]);
    console.log(`Applied migration: ${filename}`);
  }
}

if (require.main === module) {
  runMigrations().then(() => db.end()).catch(async (error) => {
    console.error(`Migration failed: ${error.message}`);
    await db.end();
    process.exitCode = 1;
  });
}

module.exports = { runMigrations, ensureUsersSchema };
