-- ================================================================
-- Database: penjualan_db
-- Sistem Penjualan B2B Damaco Dirgantara Niaga
-- Versi: Sinkronisasi lengkap per 17 Nov 2026
--
-- Tabel yang dipakai web Damaco B2B:
--   users, company_settings, customer_profiles, dealers,
--   products, damaco_orders, quotation_requests,
--   quotation_request_items, offers, offer_items,
--   purchase_orders, purchase_order_items, invoices,
--   receipts, tax_invoices, dealer_quotations,
--   notifications, status_histories, document_counters,
--   schema_migrations
--
-- Tabel DIHAPUS (ritel internal, tidak dipakai web):
--   kategori, supplier, produk, pelanggan, penjualan,
--   detail_penjualan, penawaran, detail_penawaran
-- ================================================================

CREATE DATABASE IF NOT EXISTS penjualan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE penjualan_db;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS = 0;

-- ================================================================
-- BAGIAN 1: TABEL AUTENTIKASI
-- ================================================================

-- ----------------------------------------------------------------
-- Tabel: users (Autentikasi & Role)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `telepon` VARCHAR(20) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('super_admin','admin','customer') NOT NULL DEFAULT 'customer',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- BAGIAN 2: MODUL B2B DAMACO DRONE COMMERCE
-- ================================================================

-- ----------------------------------------------------------------
-- Tabel: company_settings (Pengaturan perusahaan Damaco)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `company_settings` (
  `id` TINYINT(3) UNSIGNED NOT NULL PRIMARY KEY,
  `company_name` VARCHAR(180) NOT NULL,
  `company_code` VARCHAR(30) NOT NULL DEFAULT 'DMC-PNY',
  `email` VARCHAR(180) DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `tax_id` VARCHAR(50) DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Tabel: customer_profiles (Profil perusahaan customer B2B)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `customer_profiles` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT(10) UNSIGNED NOT NULL UNIQUE,
  `company_name` VARCHAR(180) DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `billing_address` TEXT DEFAULT NULL,
  `shipping_address` TEXT DEFAULT NULL,  -- JSON array of saved addresses
  `tax_id` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Tabel: dealers (Jaringan dealer resmi Damaco)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dealers` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(40) NOT NULL UNIQUE,
  `name` VARCHAR(180) NOT NULL,
  `email` VARCHAR(180) DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Tabel: products (Katalog produk B2B Damaco - drone & aksesoris)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `sku` VARCHAR(60) NOT NULL UNIQUE,
  `name` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `category` VARCHAR(100) NOT NULL,
  `brand` VARCHAR(80) DEFAULT NULL,
  `keperluan` VARCHAR(100) DEFAULT NULL,
  `unit` VARCHAR(30) NOT NULL DEFAULT 'unit',
  `buy_price` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `sell_price` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `stock` INT NOT NULL DEFAULT 0,
  `ketersediaan` VARCHAR(30) DEFAULT 'ready_stock', -- ready_stock | stok_terbatas | indent_14_hari
  `is_pilihan` TINYINT(1) NOT NULL DEFAULT 0,
  `badge_text` VARCHAR(100) DEFAULT NULL,
  -- Gambar multi-sudut (URL atau null → pakai SVG ilustrasi)
  `image_depan` VARCHAR(500) DEFAULT NULL,
  `image_samping` VARCHAR(500) DEFAULT NULL,
  `image_atas` VARCHAR(500) DEFAULT NULL,
  `visual_type` VARCHAR(30) DEFAULT 'quadcopter', -- quadcopter | baterai | propeller
  -- Spesifikasi singkat (tampil di chip katalog)
  `durasi` VARCHAR(50) DEFAULT NULL,         -- Waktu terbang singkat, cth: "55 mnt"
  `jarak` VARCHAR(50) DEFAULT NULL,          -- Jarak transmisi singkat, cth: "15 km"
  `kamera` VARCHAR(100) DEFAULT NULL,        -- Sensor/kamera singkat, cth: "20 MP 4/3"
  `berat` VARCHAR(50) DEFAULT NULL,          -- Bobot unit singkat, cth: "0,9 kg"
  -- Spesifikasi detail (tampil di halaman produk)
  `waktu_terbang_detail` TEXT DEFAULT NULL,
  `jarak_transmisi_detail` TEXT DEFAULT NULL,
  `kamera_detail` TEXT DEFAULT NULL,
  `akurasi_rtk` VARCHAR(200) DEFAULT NULL,
  `garansi` VARCHAR(200) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_products_category_active` (`category`, `is_active`),
  KEY `idx_products_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Tabel: document_counters (Counter nomor dokumen otomatis)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `document_counters` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `document_type` VARCHAR(30) NOT NULL,
  `document_prefix` VARCHAR(15) NOT NULL,
  `company_code` VARCHAR(30) NOT NULL,
  `counter_year` SMALLINT(5) UNSIGNED NOT NULL,
  `counter_month` TINYINT(3) UNSIGNED NOT NULL,
  `last_number` INT(10) UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY `uq_document_counter_period` (`document_type`, `counter_year`, `counter_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Tabel: quotation_requests (Permintaan penawaran dari customer)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quotation_requests` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `request_number` VARCHAR(60) NOT NULL UNIQUE,
  `customer_id` INT(10) UNSIGNED NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
  `pdf_path` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_quotation_requests_customer` (`customer_id`, `created_at`),
  FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Tabel: quotation_request_items (Item dalam permintaan penawaran)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quotation_request_items` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `quotation_request_id` BIGINT(20) UNSIGNED NOT NULL,
  `product_id` BIGINT(20) UNSIGNED NOT NULL,
  `quantity` DECIMAL(12,3) NOT NULL,
  `requested_unit_price` DECIMAL(15,2) DEFAULT NULL,
  FOREIGN KEY (`quotation_request_id`) REFERENCES `quotation_requests`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Tabel: offers (Penawaran harga resmi dari admin)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `offers` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `offer_number` VARCHAR(60) NOT NULL UNIQUE,
  `quotation_request_id` BIGINT(20) UNSIGNED NOT NULL,
  `customer_id` INT(10) UNSIGNED NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  `valid_until` DATE DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `pdf_path` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`quotation_request_id`) REFERENCES `quotation_requests`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Tabel: offer_items (Item dalam penawaran harga)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `offer_items` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `offer_id` BIGINT(20) UNSIGNED NOT NULL,
  `product_id` BIGINT(20) UNSIGNED NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `quantity` DECIMAL(12,3) NOT NULL,
  `unit_price` DECIMAL(15,2) NOT NULL,
  FOREIGN KEY (`offer_id`) REFERENCES `offers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Tabel: purchase_orders (PO dari customer ke Damaco)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `po_number` VARCHAR(60) NOT NULL UNIQUE,
  `quotation_id` BIGINT(20) UNSIGNED DEFAULT NULL,
  `dealer_id` BIGINT(20) UNSIGNED NOT NULL,
  `customer_id` INT(10) UNSIGNED DEFAULT NULL,
  `status` ENUM('PO_RECEIVED','DEALER_VERIFIED','AWAITING_PAYMENT','PAID','SHIPPED','RECEIVED','COMPLETED') NOT NULL DEFAULT 'PO_RECEIVED',
  `total_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `notes` TEXT DEFAULT NULL,
  `pdf_path` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_purchase_orders_status` (`status`, `created_at`),
  FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`dealer_id`) REFERENCES `dealers`(`id`),
  FOREIGN KEY (`quotation_id`) REFERENCES `offers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Tabel: purchase_order_items
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `purchase_order_items` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `purchase_order_id` BIGINT(20) UNSIGNED NOT NULL,
  `product_id` BIGINT(20) UNSIGNED NOT NULL,
  `quantity` DECIMAL(12,3) NOT NULL,
  `unit_price` DECIMAL(15,2) NOT NULL,
  FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Tabel: invoices (Faktur/Invoice ke customer)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `invoice_number` VARCHAR(60) NOT NULL UNIQUE,
  `purchase_order_id` BIGINT(20) UNSIGNED NOT NULL,
  `customer_id` INT(10) UNSIGNED NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'ISSUED',
  `amount` DECIMAL(15,2) NOT NULL,
  `due_date` DATE DEFAULT NULL,
  `pdf_path` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Tabel: receipts (Bukti penerimaan pembayaran)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `receipts` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `receipt_number` VARCHAR(60) NOT NULL UNIQUE,
  `invoice_id` BIGINT(20) UNSIGNED NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `payment_method` VARCHAR(40) DEFAULT NULL,
  `received_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `pdf_path` VARCHAR(500) DEFAULT NULL,
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Tabel: tax_invoices (Faktur Pajak)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tax_invoices` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `tax_invoice_number` VARCHAR(60) NOT NULL UNIQUE,
  `invoice_id` BIGINT(20) UNSIGNED NOT NULL,
  `tax_id` VARCHAR(50) DEFAULT NULL,
  `tax_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `pdf_path` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Tabel: dealer_quotations (Penawaran dari dealer)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `dealer_quotations` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `quotation_number` VARCHAR(60) NOT NULL UNIQUE,
  `dealer_id` BIGINT(20) UNSIGNED NOT NULL,
  `purchase_order_id` BIGINT(20) UNSIGNED DEFAULT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
  `total_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `pdf_path` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`dealer_id`) REFERENCES `dealers`(`id`),
  FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Tabel: notifications (Notifikasi sistem ke user)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT(10) UNSIGNED DEFAULT NULL,
  `title` VARCHAR(180) NOT NULL,
  `message` TEXT NOT NULL,
  `read_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_notifications_user_read` (`user_id`, `read_at`, `created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Tabel: status_histories (Riwayat perubahan status entitas)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `status_histories` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `entity_type` VARCHAR(40) NOT NULL,
  `entity_id` BIGINT(20) UNSIGNED NOT NULL,
  `from_status` VARCHAR(30) DEFAULT NULL,
  `to_status` VARCHAR(30) NOT NULL,
  `changed_by` INT(10) UNSIGNED DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_status_histories_entity` (`entity_type`, `entity_id`, `created_at`),
  FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Tabel: damaco_orders (Tabel utama pesanan B2B — raw_data JSON)
-- Tabel ini digunakan oleh backend Express sebagai sumber utama
-- data pesanan (sinkron dengan DamacoContext.jsx frontend)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `damaco_orders` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `nomor` VARCHAR(60) NOT NULL UNIQUE,
  `customer_id` VARCHAR(50) DEFAULT NULL,
  `customer_nama` VARCHAR(180) DEFAULT NULL,
  `contact` VARCHAR(100) DEFAULT NULL,
  `telepon` VARCHAR(30) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `npwp` VARCHAR(50) DEFAULT NULL,
  `detail` TEXT DEFAULT NULL,
  `items` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`items`)),
  `total` DECIMAL(15,2) DEFAULT 0.00,
  `estimasi_margin` DECIMAL(15,2) DEFAULT 0.00,
  `action_group` VARCHAR(50) DEFAULT NULL,
  `tanggal` DATE DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT NULL,
  `status_label` VARCHAR(100) DEFAULT NULL,
  `catatan` TEXT DEFAULT NULL,
  `po_number` VARCHAR(60) DEFAULT NULL,
  `invoice_nomor` VARCHAR(60) DEFAULT NULL,
  `ekspedisi` VARCHAR(100) DEFAULT NULL,
  `no_resi` VARCHAR(100) DEFAULT NULL,
  `raw_data` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`raw_data`)),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------
-- Tabel: schema_migrations (Tracking migrasi)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `schema_migrations` (
  `version` VARCHAR(190) NOT NULL PRIMARY KEY,
  `applied_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ================================================================
-- BAGIAN 3: DATA AWAL (SEEDING)
-- ================================================================

-- ----------------------------------------------------------------
-- Seed: users
-- ----------------------------------------------------------------
INSERT IGNORE INTO `users` (`id`, `nama`, `email`, `telepon`, `password`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
-- Admin Damaco
(7,  'Rina Kusuma',              'rina.kusuma@damaco.com',      '0811-9876-5432', '$2b$10$6GLUVfwIELHTNj0q1i2ljeYsXtX8w.RkT5BitD/C7imf9i0ZLj0gC', 'admin',    1, '2026-11-16 02:26:46', '2026-11-16 02:26:46'),
(28, 'Administrator',            'admin@penjualan.com',          '021-5551234',    '$2b$10$te8mhkpHioxzm9x1Q5tlkeGNYajAd.o/X39DWU4tBNxVjXkTuyN0m', 'admin',    1, '2026-11-17 04:05:26', '2026-11-17 04:05:26'),
-- Customer B2B
(9,  'Raka Pradipta',            'raka@nusantarageo.co.id',     '0812-3456-7890', '$2b$10$6GLUVfwIELHTNj0q1i2ljeYsXtX8w.RkT5BitD/C7imf9i0ZLj0gC', 'customer', 1, '2026-11-16 02:26:46', '2026-11-16 02:26:46'),
(27, 'Alak',                     'alak@gmail.com',               '0812-3456-7890', '$2b$10$ulpafDqq8s8xq6rKepdcX.4qntOh38AGLSiSWjsm96983YYsk4cCa', 'customer', 1, '2026-11-17 03:15:36', '2026-11-17 03:15:36'),
(29, 'Raka Pradipta',            'customer@damaco.com',          '0812-3456-7890', '$2b$10$te8mhkpHioxzm9x1Q5tlkeGNYajAd.o/X39DWU4tBNxVjXkTuyN0m', 'customer', 1, '2026-11-17 04:05:26', '2026-11-17 04:05:26'),
(30, 'Hendra Wijaya',            'hendra@geospasial.co.id',     '0811-2233-4455', '$2b$10$te8mhkpHioxzm9x1Q5tlkeGNYajAd.o/X39DWU4tBNxVjXkTuyN0m', 'customer', 1, '2026-11-17 04:05:26', '2026-11-17 04:05:26'),
(31, 'Ir. Bambang Soeprapto',    'sales@tanimakmur.com',         '0812-3456-7890', '$2b$10$te8mhkpHioxzm9x1Q5tlkeGNYajAd.o/X39DWU4tBNxVjXkTuyN0m', 'customer', 1, '2026-11-17 04:05:26', '2026-11-17 04:05:26'),
(32, 'Ibu Hj. Sri Wahyuni, M.Si','pertanian@malangkab.go.id',   '0341-395123',    '$2b$10$te8mhkpHioxzm9x1Q5tlkeGNYajAd.o/X39DWU4tBNxVjXkTuyN0m', 'customer', 1, '2026-11-17 04:05:26', '2026-11-17 04:05:26'),
(33, 'Aditya Pratama, S.T.',     'aditya@cakrasurvei.id',        '0813-9988-7766', '$2b$10$te8mhkpHioxzm9x1Q5tlkeGNYajAd.o/X39DWU4tBNxVjXkTuyN0m', 'customer', 1, '2026-11-17 04:05:26', '2026-11-17 04:05:26'),
(34, 'Dimas Prasetyo',           'dimas@samudravm.com',          '0817-0011-2233', '$2b$10$te8mhkpHioxzm9x1Q5tlkeGNYajAd.o/X39DWU4tBNxVjXkTuyN0m', 'customer', 1, '2026-11-17 04:05:26', '2026-11-17 04:05:26'),
(35, 'Citra Lestari, M.Sc.',     'citra@geosolusi.co.id',        '0818-5566-7788', '$2b$10$te8mhkpHioxzm9x1Q5tlkeGNYajAd.o/X39DWU4tBNxVjXkTuyN0m', 'customer', 1, '2026-11-17 04:05:26', '2026-11-17 04:05:26');

-- ----------------------------------------------------------------
-- Seed: company_settings
-- ----------------------------------------------------------------
INSERT IGNORE INTO `company_settings` (`id`, `company_name`, `company_code`, `email`, `phone`, `address`, `tax_id`) VALUES
(1, 'PT Damaco Dirgantara Niaga', 'DMC-PNY', 'sales@damaco.co.id', '021-5551234',
 'Graha Dirgantara Lt. 5, Jl. Protokol Halim Perdanakusuma No. 8, Jakarta Timur 13610',
 '01.999.888.7-011.000');

-- ----------------------------------------------------------------
-- Seed: customer_profiles
-- ----------------------------------------------------------------
INSERT IGNORE INTO `customer_profiles` (`id`, `user_id`, `company_name`, `phone`, `billing_address`, `shipping_address`, `tax_id`) VALUES
(2,  9,  'PT Nusantara Geospasial', '0812-3456-7890',
 'Jl. TB Simatupang No. 18, Cilandak, Jakarta Selatan 12430',
 '[{"id":1,"label":"Kantor Pusat","isPrimary":true,"alamat":"Jl. TB Simatupang No. 18, Cilandak, Jakarta Selatan 12430","pic":"Raka Pradipta","telepon":"0812-3456-7890"},{"id":2,"label":"Gudang Cikarang","isPrimary":false,"alamat":"Kawasan Jababeka Blok F-12, Cikarang, Bekasi 17530","pic":"Dewi Anggraini","telepon":"0813-8800-2211"}]',
 '01.234.567.8-012.000'),
(14, 27, 'PT ALAK', '0812-3456-7890',
 '22C, Komp kiara sari asri Jl. Kiarasari utama I no, Margasari, Kec. Buahbatu, Kota Bandung, Jawa Barat 40286',
 '[{"id":1794888564930,"label":"kantor","alamat":"fdjfidj","pic":"Alak","telepon":"0812-3456-7890","isPrimary":true}]',
 '01.234.567.8-012.000');

-- ----------------------------------------------------------------
-- Seed: dealers
-- ----------------------------------------------------------------
INSERT IGNORE INTO `dealers` (`id`, `code`, `name`, `email`, `phone`, `address`, `is_active`) VALUES
(1, 'DLR-JKT',      'Damaco Authorized Partner Hub Jakarta',                  'partner-jkt@damaco.co.id',  '021-5552345', 'Kawasan Industri Pulogadung, Jakarta Timur', 1),
(2, 'DLR-JATIM',    'Dealer Distribusi Wilayah Jawa Timur & Bali',            'dealer-jatim@damaco.co.id', '031-8987654', 'Kawasan Agrobisnis Puspa Agro Blok B-12, Sidoarjo, Jawa Timur', 1),
(3, 'DLR-CIKARANG', 'Principal Direct Import Clearance (Gudang Pusat Cikarang)','warehouse-cikarang@damaco.co.id','021-8983344','Kawasan Jababeka Blok F-12, Cikarang, Bekasi 17530', 1),
(4, 'DLR-BDG',      'Dealer Spesialis Sensor Survei Geospasial Bandung',      'sensor-bdg@damaco.co.id',   '022-7234567', 'Grand Surya Office Park No. 8, Jl. Soekarno Hatta, Bandung', 1);

-- ----------------------------------------------------------------
-- Seed: products (Katalog B2B Damaco — 30 produk aktif)
-- Kolom baru (brand, keperluan, ketersediaan, visual_type, dll)
-- di-seed dengan nilai default yang sesuai. Admin dapat mengupdate
-- via halaman Kelola Produk.
-- ----------------------------------------------------------------
INSERT IGNORE INTO `products` (`id`,`sku`,`name`,`description`,`category`,`brand`,`keperluan`,`unit`,`buy_price`,`sell_price`,`stock`,`ketersediaan`,`visual_type`,`is_active`) VALUES
-- Drone
(49,'AVN-M4',    'Atlas M4 RTK',           'Drone survei generasi mutakhir dengan sistem navigasi RTK tingkat sentimeter, sensor shutter mekanis, dan transmisi stabil hingga 15 km.','Drone','AVIAN','Survei & Pemetaan','unit',126225000,148500000,15,'ready_stock','quadcopter',1),
(50,'TW2-01',    'Terra Wing S2',          'Drone Fixed Wing aerodinamis efisiensi tinggi untuk pemetaan koridor jalan, tambang luas, dan batas wilayah.','Drone','TERRA','Survei & Pemetaan','unit',122400000,144000000,8,'ready_stock','quadcopter',1),
(51,'AG20-STD',  'Agri 20 Pro Sprayer',    'Drone semprot pertanian kapasitas tangki 20 liter dengan radar penyesuaian kontur tanah dan nozel sentrifugal ganda.','Drone','AGRI','Pertanian Presisi','unit',328992500,387050000,5,'stok_terbatas','quadcopter',1),
(52,'L5P-01',    'Lumen 5 Pro',            'Drone visual profesional dengan kamera Hasselblad 4/3 CMOS dan profil warna D-Log 10-bit untuk dokumenter dan inspeksi visual.','Drone','LUMEN','Sinematografi Udara','unit',35700000,42000000,12,'ready_stock','quadcopter',1),
(53,'SCM-01',    'Scout Mini Rover UGV',   'Robot UGV penjelajah darat multi-terrain dengan kontrol telemetri ROS2 dan sensor pemindai terowongan.','Drone','AVIAN','Inspeksi & Keamanan','unit',31875000,37500000,4,'stok_terbatas','quadcopter',1),
(54,'AVN-X8',    'Vector X8 Heavy Lift',   'Platform drone oktokopter heavy-duty dengan daya angkut muatan sensor lidar besar hingga 8 kg.','Drone','AVIAN','Survei & Pemetaan','unit',182750000,215000000,3,'indent_14_hari','quadcopter',1),
(55,'LUM-SP',    'Spectra Dual Thermal',   'Drone inspeksi termal presisi untuk utilitas PLN, instalasi solar panel, dan regu penyelamat darurat.','Drone','LUMEN','Inspeksi & Keamanan','unit',57800000,68000000,6,'ready_stock','quadcopter',1),
-- Starter Pack
(56,'SP-ATL01',  'Starter Pack Survei Atlas',       'Paket operasional lengkap: 1x drone Atlas M4 RTK, 3x Smart Battery TB65, 1x Charging Station Hub, 1x Hardcase IP67, dan pelatihan operator 2 hari.','Starter Pack','AVIAN','Survei & Pemetaan','paket',135915000,159900000,10,'ready_stock','quadcopter',1),
(57,'SP-AGR02',  'Starter Pack Agri 20',            'Paket starter semprot lahan: unit Agri 20, generator genset fast-charge, 4 unit baterai cerdas, dan tangki spare ekstra.','Starter Pack','AGRI','Pertanian Presisi','paket',122315000,143900000,7,'ready_stock','quadcopter',1),
(58,'SP-LUM03',  'Starter Pack Cinema Lumen 5',     'Paket kreasi visual: drone Lumen 5 Pro, 3x baterai cadangan, set filter polaroid/ND, smart remote pro, dan tas selempang kulit.','Starter Pack','LUMEN','Sinematografi Udara','paket',45900000,54000000,8,'ready_stock','quadcopter',1),
(59,'SP-TER04',  'Starter Pack Fixed Wing Explorer','Solusi lengkap pemetaan batas tambang dan perkebunan: Terra Wing S2, antena pelacak sinyal otomatis, modul RTK stasiun bumi, dan laptop kontrol.','Starter Pack','TERRA','Survei & Pemetaan','paket',146200000,172000000,5,'ready_stock','quadcopter',1),
-- Baterai
(60,'BAT-TB65',  'Smart Flight Battery TB65 (Atlas M4)',           'Baterai lithium berkapasitas tinggi 5880 mAh dengan sistem pemanas otomatis.','Baterai','AVIAN','Aksesoris','buah',7225000,8500000,30,'ready_stock','baterai',1),
(61,'BAT-AG30',  'Intelligent Battery Agri 20 (30.000mAh)',        'Baterai khusus traksi tinggi bersertifikat tahan cairan pestisida.','Baterai','AGRI','Aksesoris','buah',15470000,18200000,20,'ready_stock','baterai',1),
(62,'BAT-TERRA', 'Ultra Endurance LiPo Terra Wing',                'Baterai LiPo multi-cell berdaya simpan tinggi untuk penerbangan Fixed Wing jarak jauh.','Baterai','TERRA','Aksesoris','buah',13770000,16200000,15,'ready_stock','baterai',1),
(63,'BAT-LUMEN', 'High Capacity Battery Lumen 5',                  'Baterai penerbangan cadangan untuk Lumen 5 Pro, mendukung pengisian cepat USB-C PD 100W.','Baterai','LUMEN','Aksesoris','buah',3230000,3800000,25,'ready_stock','baterai',1),
-- Propeller
(64,'PRP-CFM4',  'Carbon Fiber Low-Noise Propellers (Atlas M4)',   'Baling-baling serat karbon presisi tinggi aerodinamis ujung melengkung.','Propeller','AVIAN','Aksesoris','set',1232500,1450000,50,'ready_stock','propeller',1),
(65,'PRP-AGR20', 'High-Lift Folding Propeller Set Agri 20',        'Baling-baling lipat tahan benturan ranting pohon dan debu lumpur.','Propeller','AGRI','Aksesoris','set',2380000,2800000,30,'ready_stock','propeller',1),
(66,'PRP-LUM5',  'Quick-Release Propeller Lumen 5',                'Set baling-baling cadangan resmi dengan mekanisme pasang cepat putar-dan-kunci.','Propeller','LUMEN','Aksesoris','set',722500,850000,40,'ready_stock','propeller',1),
(67,'PRP-TW20',  'Propeller Set Fixed Wing Terra Wing',            'Baling-baling pendorong (pusher) untuk motor brushless Terra Wing S2.','Propeller','TERRA','Aksesoris','set',1657500,1950000,20,'ready_stock','propeller',1),
-- Controller
(68,'CTR-MST7',  'Damaco Master Remote Controller V2 with 7" High-Bright Screen','Remote kontrol profesional terintegrasi layar sentuh FHD 7 inci kecerahan 2.000 nits.','Controller','DAMACO','Aksesoris','unit',15725000,18500000,10,'ready_stock','quadcopter',1),
(69,'CTR-GCS2',  'Dual-Screen Ground Control Station Rugged',      'Stasiun komando darat berlayar ganda dalam koper militer IP67.','Controller','DAMACO','Aksesoris','unit',27200000,32000000,4,'stok_terbatas','quadcopter',1),
-- Charger
(70,'CHG-OCTA',  'Octa-Hub Fast Charging Station 2000W',           'Stasiun pengisi daya cerdas 8 saluran simultan untuk baterai Atlas M4 dan TB65.','Charger','DAMACO','Aksesoris','unit',12325000,14500000,8,'ready_stock','baterai',1),
(71,'CHG-DUAL',  'Dual Intelligent Battery Charger Hub',           'Hub pengisi daya portabel kompak untuk kerja lapangan.','Charger','DAMACO','Aksesoris','unit',2720000,3200000,20,'ready_stock','baterai',1),
-- Payload & Kamera
(72,'PLD-LIDAR', 'Lidar Scanner Sensor V3 Millimeter Accuracy',    'Sensor pemindai Lidar terpasang gimbal terintegrasi kamera fotogrametri RGB.','Payload & Kamera','DAMACO','Survei & Pemetaan','unit',83300000,98000000,3,'indent_14_hari','quadcopter',1),
(73,'PLD-MULTI', 'Multispectral 5-Band Sensor Agrobisnis',         'Sensor multispektral 5-band untuk monitoring indeks vegetasi tanaman.','Payload & Kamera','DAMACO','Pertanian Presisi','unit',38250000,45000000,5,'stok_terbatas','quadcopter',1),
-- Tas & Case
(74,'CAS-M4HD',  'Rugged IP67 Hardcase Foam Atlas M4',             'Koper pelindung berbahan polimer resin tahan banting ekstrem.','Tas & Case','DAMACO','Aksesoris','buah',3570000,4200000,15,'ready_stock','quadcopter',1),
(75,'CAS-BP01',  'Modular Tactical Field Backpack Kit',             'Ransel ergonomis khusus surveyor lapangan di medan perbukitan, hutan, dan lokasi terpencil.','Tas & Case','DAMACO','Aksesoris','buah',1785000,2100000,20,'ready_stock','quadcopter',1),
-- Aksesoris
(76,'ACC-DRTK',  'D-RTK 2 High Precision GNSS Mobile Station',     'Stasiun referensi GNSS dasar mobile dengan kemampuan koreksi diferensial real-time.','Aksesoris','AVIAN','Survei & Pemetaan','unit',32300000,38000000,6,'ready_stock','quadcopter',1),
(77,'ACC-DROP',  'Heavy Payload Drop Mechanism System',             'Modul pelepas kargo darurat untuk pengantaran pelampung SAR dan obat-obatan.','Aksesoris','DAMACO','Inspeksi & Keamanan','unit',6375000,7500000,10,'ready_stock','quadcopter',1),
(78,'ACC-SPML',  'Searchlight & Megaphone Combo Unit',              'Kombinasi lampu sorot berdaya tinggi dan pengeras suara jarak jauh untuk patroli keamanan.','Aksesoris','DAMACO','Inspeksi & Keamanan','unit',7820000,9200000,8,'ready_stock','quadcopter',1);

-- ----------------------------------------------------------------
-- Seed: schema_migrations
-- ----------------------------------------------------------------
INSERT IGNORE INTO `schema_migrations` (`version`, `applied_at`) VALUES
('20261022_02_core_commerce.sql', '2026-10-22 07:51:44'),
('20261117_01_sync_penjualan_db.sql', NOW());

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================================
-- CATATAN SINKRONISASI
-- ================================================================
-- • Tabel users: role diperluas menjadi ENUM('super_admin','admin','customer')
--   sesuai web Damaco. Kolom telepon ditambahkan.
-- • Tabel products: ditambahkan kolom brand, keperluan, ketersediaan,
--   is_pilihan, badge_text, image_depan/samping/atas, visual_type,
--   durasi, jarak, kamera, berat, waktu_terbang_detail,
--   jarak_transmisi_detail, kamera_detail, akurasi_rtk, garansi, stock
--   sesuai form KelolaProdukPage.jsx dan tampilan ProductDetailView.jsx.
-- • Tabel damaco_orders: tabel utama pesanan B2B Damaco (digunakan API).
-- • Tabel penjualan/produk/pelanggan: tabel ritel internal tetap dipertahankan
--   untuk kompatibilitas modul kasir.
-- ================================================================
