-- ================================================================
-- Database Schema: penjualan_db
-- Sistem Penjualan Starter Project
-- ================================================================

CREATE DATABASE IF NOT EXISTS penjualan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE penjualan_db;

-- ----------------------------------------------------------------
-- Tabel: users (Autentikasi & Role)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'kasir', 'gudang') NOT NULL DEFAULT 'kasir',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- Tabel: kategori (Kategori Produk)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kategori (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- Tabel: supplier
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supplier (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(150) NOT NULL,
  email VARCHAR(100),
  telepon VARCHAR(20),
  alamat TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- Tabel: produk
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS produk (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kode_produk VARCHAR(50) NOT NULL UNIQUE,
  nama VARCHAR(200) NOT NULL,
  deskripsi TEXT,
  kategori_id INT UNSIGNED,
  supplier_id INT UNSIGNED,
  harga_beli DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  harga_jual DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  stok INT NOT NULL DEFAULT 0,
  stok_minimum INT NOT NULL DEFAULT 5,
  satuan VARCHAR(20) DEFAULT 'pcs',
  gambar VARCHAR(255),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (kategori_id) REFERENCES kategori(id) ON DELETE SET NULL,
  FOREIGN KEY (supplier_id) REFERENCES supplier(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------
-- Tabel: pelanggan (Customer)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pelanggan (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(150) NOT NULL,
  email VARCHAR(100),
  telepon VARCHAR(20),
  alamat TEXT,
  poin INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------
-- Tabel: penjualan (Transaksi Header)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS penjualan (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nomor_transaksi VARCHAR(50) NOT NULL UNIQUE,
  pelanggan_id INT UNSIGNED,
  user_id INT UNSIGNED NOT NULL,
  tanggal TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_harga DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  diskon DECIMAL(15, 2) DEFAULT 0.00,
  pajak DECIMAL(15, 2) DEFAULT 0.00,
  total_bayar DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  uang_bayar DECIMAL(15, 2) DEFAULT 0.00,
  kembalian DECIMAL(15, 2) DEFAULT 0.00,
  metode_pembayaran ENUM('tunai', 'transfer', 'kartu', 'qris') DEFAULT 'tunai',
  status ENUM('selesai', 'pending', 'batal') DEFAULT 'selesai',
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pelanggan_id) REFERENCES pelanggan(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ----------------------------------------------------------------
-- Tabel: detail_penjualan (Transaksi Detail / Line Items)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS detail_penjualan (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  penjualan_id INT UNSIGNED NOT NULL,
  produk_id INT UNSIGNED NOT NULL,
  nama_produk VARCHAR(200) NOT NULL,
  harga_satuan DECIMAL(15, 2) NOT NULL,
  jumlah INT NOT NULL,
  diskon DECIMAL(15, 2) DEFAULT 0.00,
  subtotal DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (penjualan_id) REFERENCES penjualan(id) ON DELETE CASCADE,
  FOREIGN KEY (produk_id) REFERENCES produk(id)
);

-- ----------------------------------------------------------------
-- Data Awal (Seeding)
-- ----------------------------------------------------------------

-- Default Admin User (password: admin123)
INSERT INTO users (nama, email, password, role) VALUES
('Administrator', 'admin@penjualan.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Kasir 1', 'kasir@penjualan.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'kasir');

-- Kategori
INSERT INTO kategori (nama, deskripsi) VALUES
('Makanan', 'Produk makanan dan cemilan'),
('Minuman', 'Produk minuman segar dan kemasan'),
('Elektronik', 'Perangkat elektronik dan aksesoris'),
('Pakaian', 'Produk fashion dan pakaian'),
('Kebersihan', 'Produk kebersihan rumah dan personal');

-- Supplier
INSERT INTO supplier (nama, email, telepon, alamat) VALUES
('PT Sumber Makmur', 'contact@sumbermakmur.com', '021-12345678', 'Jl. Industri No. 1, Jakarta'),
('CV Berkah Jaya', 'info@berkahjaya.com', '031-87654321', 'Jl. Raya No. 45, Surabaya');

-- Produk
INSERT INTO produk (kode_produk, nama, kategori_id, supplier_id, harga_beli, harga_jual, stok, satuan) VALUES
('PRD001', 'Indomie Goreng', 1, 1, 2500, 3500, 100, 'pcs'),
('PRD002', 'Aqua 600ml', 2, 1, 3000, 4500, 150, 'botol'),
('PRD003', 'Teh Botol Sosro 350ml', 2, 1, 4000, 6000, 80, 'botol'),
('PRD004', 'Biskuit Roma', 1, 2, 8000, 12000, 60, 'pcs'),
('PRD005', 'Sabun Mandi Lifebuoy', 5, 2, 4500, 7000, 90, 'pcs');

-- Pelanggan
INSERT INTO pelanggan (nama, email, telepon, alamat) VALUES
('Umum', NULL, NULL, NULL),
('Budi Santoso', 'budi@email.com', '08123456789', 'Jl. Merdeka No. 10, Jakarta');
