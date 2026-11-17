const mysql = require('mysql2/promise');

(async () => {
  const c = await mysql.createConnection({
    host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'penjualan_db'
  });

  const [tables] = await c.query('SHOW TABLES');
  console.log('=== TABEL TERSISA ===');
  console.log(tables.map(r => Object.values(r)[0]).join('\n'));

  const [cols] = await c.query(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='penjualan_db' AND TABLE_NAME='products' ORDER BY ORDINAL_POSITION"
  );
  console.log('\n=== KOLOM PRODUCTS ===');
  console.log(cols.map(r => r.COLUMN_NAME).join(', '));

  const [[{ n }]] = await c.query('SELECT COUNT(*) n FROM products');
  console.log(`\nTotal produk: ${n}`);

  await c.end();
})();

