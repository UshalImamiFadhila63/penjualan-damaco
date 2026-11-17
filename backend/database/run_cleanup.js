// Script untuk membersihkan tabel lama dan update struktur products
// Jalankan: node backend/database/run_cleanup.js

const mysql = require('mysql2/promise');

const SQL_STEPS = [
  {
    label: 'Nonaktifkan FK checks',
    sql: 'SET FOREIGN_KEY_CHECKS = 0'
  },
  {
    label: 'Drop detail_penawaran',
    sql: 'DROP TABLE IF EXISTS `detail_penawaran`'
  },
  {
    label: 'Drop detail_penjualan',
    sql: 'DROP TABLE IF EXISTS `detail_penjualan`'
  },
  {
    label: 'Drop penawaran',
    sql: 'DROP TABLE IF EXISTS `penawaran`'
  },
  {
    label: 'Drop penjualan',
    sql: 'DROP TABLE IF EXISTS `penjualan`'
  },
  {
    label: 'Drop pelanggan',
    sql: 'DROP TABLE IF EXISTS `pelanggan`'
  },
  {
    label: 'Drop produk',
    sql: 'DROP TABLE IF EXISTS `produk`'
  },
  {
    label: 'Drop kategori',
    sql: 'DROP TABLE IF EXISTS `kategori`'
  },
  {
    label: 'Drop supplier',
    sql: 'DROP TABLE IF EXISTS `supplier`'
  },
  {
    label: 'Aktifkan kembali FK checks',
    sql: 'SET FOREIGN_KEY_CHECKS = 1'
  },
  {
    label: 'Tambah kolom brand ke products',
    sql: "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `brand` VARCHAR(80) DEFAULT NULL AFTER `category`"
  },
  {
    label: 'Tambah kolom keperluan ke products',
    sql: "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `keperluan` VARCHAR(100) DEFAULT NULL AFTER `brand`"
  },
  {
    label: 'Tambah kolom stock ke products',
    sql: "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `stock` INT NOT NULL DEFAULT 0 AFTER `sell_price`"
  },
  {
    label: 'Tambah kolom ketersediaan ke products',
    sql: "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `ketersediaan` VARCHAR(30) DEFAULT 'ready_stock' AFTER `stock`"
  },
  {
    label: 'Tambah kolom is_pilihan ke products',
    sql: "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `is_pilihan` TINYINT(1) NOT NULL DEFAULT 0 AFTER `ketersediaan`"
  },
  {
    label: 'Tambah kolom badge_text ke products',
    sql: "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `badge_text` VARCHAR(100) DEFAULT NULL AFTER `is_pilihan`"
  },
  {
    label: 'Tambah kolom image_depan ke products',
    sql: "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `image_depan` VARCHAR(500) DEFAULT NULL AFTER `badge_text`"
  },
  {
    label: 'Tambah kolom image_samping ke products',
    sql: "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `image_samping` VARCHAR(500) DEFAULT NULL AFTER `image_depan`"
  },
  {
    label: 'Tambah kolom image_atas ke products',
    sql: "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `image_atas` VARCHAR(500) DEFAULT NULL AFTER `image_samping`"
  },
  {
    label: 'Tambah kolom visual_type ke products',
    sql: "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `visual_type` VARCHAR(30) DEFAULT 'quadcopter' AFTER `image_atas`"
  },
  {
    label: 'Tambah kolom durasi ke products',
    sql: "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `durasi` VARCHAR(50) DEFAULT NULL AFTER `visual_type`"
  },
  {
    label: 'Tambah kolom jarak ke products',
    sql: "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `jarak` VARCHAR(50) DEFAULT NULL AFTER `durasi`"
  },
  {
    label: 'Tambah kolom kamera ke products',
    sql: "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `kamera` VARCHAR(100) DEFAULT NULL AFTER `jarak`"
  },
  {
    label: 'Tambah kolom berat ke products',
    sql: "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `berat` VARCHAR(50) DEFAULT NULL AFTER `kamera`"
  },
  {
    label: 'Tambah kolom waktu_terbang_detail ke products',
    sql: "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `waktu_terbang_detail` TEXT DEFAULT NULL AFTER `berat`"
  },
  {
    label: 'Tambah kolom jarak_transmisi_detail ke products',
    sql: "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `jarak_transmisi_detail` TEXT DEFAULT NULL AFTER `waktu_terbang_detail`"
  },
  {
    label: 'Tambah kolom kamera_detail ke products',
    sql: "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `kamera_detail` TEXT DEFAULT NULL AFTER `jarak_transmisi_detail`"
  },
  {
    label: 'Tambah kolom akurasi_rtk ke products',
    sql: "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `akurasi_rtk` VARCHAR(200) DEFAULT NULL AFTER `kamera_detail`"
  },
  {
    label: 'Tambah kolom garansi ke products',
    sql: "ALTER TABLE `products` ADD COLUMN IF NOT EXISTS `garansi` VARCHAR(200) DEFAULT NULL AFTER `akurasi_rtk`"
  },
  {
    label: 'Update brand & keperluan untuk produk yang sudah ada',
    sql: `UPDATE \`products\` SET
      \`brand\` = CASE
        WHEN \`sku\` LIKE 'AVN%' OR \`sku\` LIKE 'SP-ATL%' OR \`sku\` LIKE 'BAT-TB%' OR \`sku\` LIKE 'PRP-CFM%' OR \`sku\` LIKE 'ACC-DRTK' THEN 'AVIAN'
        WHEN \`sku\` LIKE 'TW%'  OR \`sku\` LIKE 'SP-TER%' OR \`sku\` LIKE 'BAT-TERRA' OR \`sku\` LIKE 'PRP-TW%' THEN 'TERRA'
        WHEN \`sku\` LIKE 'L5P%' OR \`sku\` LIKE 'SP-LUM%' OR \`sku\` LIKE 'BAT-LUMEN' OR \`sku\` LIKE 'PRP-LUM%' OR \`sku\` LIKE 'LUM%' THEN 'LUMEN'
        WHEN \`sku\` LIKE 'AG%'  OR \`sku\` LIKE 'SP-AGR%' OR \`sku\` LIKE 'BAT-AG%'  OR \`sku\` LIKE 'PRP-AGR%' THEN 'AGRI'
        ELSE 'DAMACO'
      END,
      \`keperluan\` = CASE
        WHEN \`category\` IN ('Baterai','Propeller','Controller','Charger','Tas & Case','Aksesoris') THEN 'Aksesoris'
        WHEN \`name\` LIKE '%Agri%' OR \`name\` LIKE '%Sprayer%' OR \`name\` LIKE '%Semprot%' OR \`name\` LIKE '%Multispectral%' THEN 'Pertanian Presisi'
        WHEN \`name\` LIKE '%Lumen%' OR \`name\` LIKE '%Cinema%' OR \`name\` LIKE '%Visual%' THEN 'Sinematografi Udara'
        WHEN \`name\` LIKE '%Thermal%' OR \`name\` LIKE '%Inspek%' OR \`name\` LIKE '%Scout%' OR \`name\` LIKE '%Searchlight%' OR \`name\` LIKE '%Drop%' THEN 'Inspeksi & Keamanan'
        ELSE 'Survei & Pemetaan'
      END,
      \`ketersediaan\` = CASE
        WHEN \`name\` LIKE '%Heavy Lift%' OR \`name\` LIKE '%Lidar%' OR \`name\` LIKE '%Dual-Screen%' THEN 'indent_14_hari'
        WHEN \`stock\` < 6 THEN 'stok_terbatas'
        ELSE 'ready_stock'
      END,
      \`visual_type\` = CASE
        WHEN \`category\` = 'Baterai' THEN 'baterai'
        WHEN \`category\` = 'Propeller' THEN 'propeller'
        ELSE 'quadcopter'
      END
    WHERE \`brand\` IS NULL OR \`keperluan\` IS NULL`
  }
];

async function runCleanup() {
  let conn;
  try {
    console.log('🔌 Menghubungkan ke MySQL penjualan_db...');
    conn = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      database: 'penjualan_db',
      multipleStatements: false
    });
    console.log('✅ Terhubung!\n');

    for (const step of SQL_STEPS) {
      try {
        process.stdout.write(`⏳ ${step.label}... `);
        await conn.execute(step.sql);
        console.log('✅ OK');
      } catch (err) {
        console.log(`⚠️  SKIP (${err.message})`);
      }
    }

    console.log('\n📊 Verifikasi hasil:');
    const [tables] = await conn.execute('SHOW TABLES');
    const tableNames = tables.map(r => Object.values(r)[0]);
    console.log('Tabel tersisa:', tableNames.join(', '));

    const [cols] = await conn.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='penjualan_db' AND TABLE_NAME='products' ORDER BY ORDINAL_POSITION");
    console.log('\nKolom products:', cols.map(r => r.COLUMN_NAME).join(', '));

    const [[{ total }]] = await conn.execute('SELECT COUNT(*) as total FROM `products`');
    console.log(`\nTotal produk: ${total}`);
    console.log('\n🎉 Cleanup selesai!');

  } catch (err) {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

runCleanup();

