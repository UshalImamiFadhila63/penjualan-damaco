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
  telepon VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'customer') NOT NULL DEFAULT 'customer',
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
-- Tabel: penawaran (Permintaan penawaran dari customer)
-- ----------------------------------------------------------------
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

-- ----------------------------------------------------------------
-- Data Awal (Seeding)
-- ----------------------------------------------------------------

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

-- Core quotation, dealer, purchasing, and document schema (also applied by database/migrate.js).
CREATE TABLE IF NOT EXISTS customer_profiles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  company_name VARCHAR(180) NULL,
  phone VARCHAR(30) NULL,
  billing_address TEXT NULL,
  shipping_address TEXT NULL,
  tax_id VARCHAR(50) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_customer_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS dealers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  email VARCHAR(180) NULL,
  phone VARCHAR(30) NULL,
  address TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sku VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT NULL,
  category VARCHAR(100) NOT NULL,
  unit VARCHAR(30) NOT NULL DEFAULT 'unit',
  buy_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  sell_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  image_url VARCHAR(500) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_category_active (category, is_active),
  INDEX idx_products_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quotation_requests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  request_number VARCHAR(60) NOT NULL UNIQUE,
  customer_id INT UNSIGNED NOT NULL,
  notes TEXT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
  pdf_path VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_quotation_requests_customer FOREIGN KEY (customer_id) REFERENCES users(id),
  INDEX idx_quotation_requests_customer (customer_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quotation_request_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quotation_request_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  quantity DECIMAL(12,3) NOT NULL,
  requested_unit_price DECIMAL(15,2) NULL,
  CONSTRAINT fk_quotation_request_items_request FOREIGN KEY (quotation_request_id) REFERENCES quotation_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_quotation_request_items_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS offers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  offer_number VARCHAR(60) NOT NULL UNIQUE,
  quotation_request_id BIGINT UNSIGNED NOT NULL,
  customer_id INT UNSIGNED NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  valid_until DATE NULL,
  notes TEXT NULL,
  pdf_path VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_offers_request FOREIGN KEY (quotation_request_id) REFERENCES quotation_requests(id),
  CONSTRAINT fk_offers_customer FOREIGN KEY (customer_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS offer_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  offer_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  description VARCHAR(255) NULL,
  quantity DECIMAL(12,3) NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  CONSTRAINT fk_offer_items_offer FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
  CONSTRAINT fk_offer_items_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS purchase_orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  po_number VARCHAR(60) NOT NULL UNIQUE,
  quotation_id BIGINT UNSIGNED NULL,
  dealer_id BIGINT UNSIGNED NOT NULL,
  customer_id INT UNSIGNED NULL,
  status ENUM('PO_RECEIVED','DEALER_VERIFIED','AWAITING_PAYMENT','PAID','SHIPPED','RECEIVED','COMPLETED') NOT NULL DEFAULT 'PO_RECEIVED',
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  pdf_path VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_purchase_orders_quotation FOREIGN KEY (quotation_id) REFERENCES offers(id) ON DELETE SET NULL,
  CONSTRAINT fk_purchase_orders_dealer FOREIGN KEY (dealer_id) REFERENCES dealers(id),
  CONSTRAINT fk_purchase_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_purchase_orders_status (status, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  purchase_order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  quantity DECIMAL(12,3) NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  CONSTRAINT fk_purchase_order_items_order FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_purchase_order_items_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS status_histories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(40) NOT NULL,
  entity_id BIGINT UNSIGNED NOT NULL,
  from_status VARCHAR(30) NULL,
  to_status VARCHAR(30) NOT NULL,
  changed_by INT UNSIGNED NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_status_histories_user FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status_histories_entity (entity_type, entity_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS dealer_quotations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  quotation_number VARCHAR(60) NOT NULL UNIQUE,
  dealer_id BIGINT UNSIGNED NOT NULL,
  purchase_order_id BIGINT UNSIGNED NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  pdf_path VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_dealer_quotations_dealer FOREIGN KEY (dealer_id) REFERENCES dealers(id),
  CONSTRAINT fk_dealer_quotations_po FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(60) NOT NULL UNIQUE,
  purchase_order_id BIGINT UNSIGNED NOT NULL,
  customer_id INT UNSIGNED NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ISSUED',
  amount DECIMAL(15,2) NOT NULL,
  due_date DATE NULL,
  pdf_path VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoices_po FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id),
  CONSTRAINT fk_invoices_customer FOREIGN KEY (customer_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS receipts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  receipt_number VARCHAR(60) NOT NULL UNIQUE,
  invoice_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_method VARCHAR(40) NULL,
  received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  pdf_path VARCHAR(500) NULL,
  CONSTRAINT fk_receipts_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tax_invoices (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tax_invoice_number VARCHAR(60) NOT NULL UNIQUE,
  invoice_id BIGINT UNSIGNED NOT NULL,
  tax_id VARCHAR(50) NULL,
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  pdf_path VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tax_invoices_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS document_counters (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  document_type VARCHAR(30) NOT NULL,
  document_prefix VARCHAR(15) NOT NULL,
  company_code VARCHAR(30) NOT NULL,
  counter_year SMALLINT UNSIGNED NOT NULL,
  counter_month TINYINT UNSIGNED NOT NULL,
  last_number INT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uq_document_counter_period (document_type, counter_year, counter_month)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  title VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  read_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user_read (user_id, read_at, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS company_settings (
  id TINYINT UNSIGNED PRIMARY KEY,
  company_name VARCHAR(180) NOT NULL,
  company_code VARCHAR(30) NOT NULL DEFAULT 'DMC-PNY',
  email VARCHAR(180) NULL,
  phone VARCHAR(30) NULL,
  address TEXT NULL,
  tax_id VARCHAR(50) NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;


