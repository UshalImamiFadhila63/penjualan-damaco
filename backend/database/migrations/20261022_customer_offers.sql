-- Run once against an existing penjualan_db database.
ALTER TABLE users
  MODIFY role ENUM('admin', 'kasir', 'gudang', 'super_admin', 'customer') NOT NULL DEFAULT 'customer';

UPDATE users
SET role = CASE WHEN role IN ('admin', 'super_admin') THEN 'super_admin' ELSE 'customer' END;

ALTER TABLE users
  ADD COLUMN telepon VARCHAR(20) NULL AFTER email,
  MODIFY role ENUM('super_admin', 'customer') NOT NULL DEFAULT 'customer';

CREATE TABLE IF NOT EXISTS penawaran (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nomor_penawaran VARCHAR(50) NOT NULL UNIQUE,
  user_id INT UNSIGNED NOT NULL,
  catatan TEXT,
  status ENUM('menunggu', 'diproses', 'diterima', 'ditolak') NOT NULL DEFAULT 'menunggu',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS detail_penawaran (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  penawaran_id INT UNSIGNED NOT NULL,
  produk_id INT UNSIGNED NOT NULL,
  nama_produk VARCHAR(200) NOT NULL,
  harga_satuan DECIMAL(15, 2) NOT NULL,
  jumlah INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (penawaran_id) REFERENCES penawaran(id) ON DELETE CASCADE,
  FOREIGN KEY (produk_id) REFERENCES produk(id)
);
