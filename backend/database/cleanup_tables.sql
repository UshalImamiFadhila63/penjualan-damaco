-- ================================================================
-- CLEANUP: Hapus tabel yang tidak digunakan oleh web Damaco B2B
-- Jalankan file ini di phpMyAdmin → pilih database penjualan_db
-- → klik tab SQL → paste seluruh isi file ini → klik Go
-- ================================================================

USE `penjualan_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- Tabel ritel internal (tidak dipakai web Damaco B2B):
DROP TABLE IF EXISTS `detail_penawaran`;   -- duplikat offer_items (ritel)
DROP TABLE IF EXISTS `detail_penjualan`;   -- duplikat purchase_order_items (ritel)
DROP TABLE IF EXISTS `penawaran`;          -- duplikat offers (ritel)
DROP TABLE IF EXISTS `penjualan`;          -- duplikat damaco_orders (ritel)
DROP TABLE IF EXISTS `pelanggan`;          -- duplikat customer_profiles (ritel)
DROP TABLE IF EXISTS `produk`;             -- duplikat products (ritel)
DROP TABLE IF EXISTS `kategori`;           -- kategori ritel (Makanan, Minuman) bukan drone
DROP TABLE IF EXISTS `supplier`;           -- supplier ritel, tidak dipakai B2B

SET FOREIGN_KEY_CHECKS = 1;

-- Tambahkan kolom baru ke tabel products jika belum ada
-- (agar sinkron dengan form KelolaProdukPage.jsx)
ALTER TABLE `products`
  ADD COLUMN IF NOT EXISTS `brand`                   VARCHAR(80)  DEFAULT NULL AFTER `category`,
  ADD COLUMN IF NOT EXISTS `keperluan`               VARCHAR(100) DEFAULT NULL AFTER `brand`,
  ADD COLUMN IF NOT EXISTS `stock`                   INT          NOT NULL DEFAULT 0 AFTER `sell_price`,
  ADD COLUMN IF NOT EXISTS `ketersediaan`            VARCHAR(30)  DEFAULT 'ready_stock' AFTER `stock`,
  ADD COLUMN IF NOT EXISTS `is_pilihan`              TINYINT(1)   NOT NULL DEFAULT 0 AFTER `ketersediaan`,
  ADD COLUMN IF NOT EXISTS `badge_text`              VARCHAR(100) DEFAULT NULL AFTER `is_pilihan`,
  ADD COLUMN IF NOT EXISTS `image_depan`             VARCHAR(500) DEFAULT NULL AFTER `badge_text`,
  ADD COLUMN IF NOT EXISTS `image_samping`           VARCHAR(500) DEFAULT NULL AFTER `image_depan`,
  ADD COLUMN IF NOT EXISTS `image_atas`              VARCHAR(500) DEFAULT NULL AFTER `image_samping`,
  ADD COLUMN IF NOT EXISTS `visual_type`             VARCHAR(30)  DEFAULT 'quadcopter' AFTER `image_atas`,
  ADD COLUMN IF NOT EXISTS `durasi`                  VARCHAR(50)  DEFAULT NULL AFTER `visual_type`,
  ADD COLUMN IF NOT EXISTS `jarak`                   VARCHAR(50)  DEFAULT NULL AFTER `durasi`,
  ADD COLUMN IF NOT EXISTS `kamera`                  VARCHAR(100) DEFAULT NULL AFTER `jarak`,
  ADD COLUMN IF NOT EXISTS `berat`                   VARCHAR(50)  DEFAULT NULL AFTER `kamera`,
  ADD COLUMN IF NOT EXISTS `waktu_terbang_detail`    TEXT         DEFAULT NULL AFTER `berat`,
  ADD COLUMN IF NOT EXISTS `jarak_transmisi_detail`  TEXT         DEFAULT NULL AFTER `waktu_terbang_detail`,
  ADD COLUMN IF NOT EXISTS `kamera_detail`           TEXT         DEFAULT NULL AFTER `jarak_transmisi_detail`,
  ADD COLUMN IF NOT EXISTS `akurasi_rtk`             VARCHAR(200) DEFAULT NULL AFTER `kamera_detail`,
  ADD COLUMN IF NOT EXISTS `garansi`                 VARCHAR(200) DEFAULT NULL AFTER `akurasi_rtk`;

-- Update brand & keperluan default untuk produk yang sudah ada
UPDATE `products` SET
  `brand`      = CASE
    WHEN `sku` LIKE 'AVN%' OR `sku` LIKE 'SP-ATL%' OR `sku` LIKE 'BAT-TB%' OR `sku` LIKE 'PRP-CFM%' OR `sku` LIKE 'ACC-DRTK' THEN 'AVIAN'
    WHEN `sku` LIKE 'TW%'  OR `sku` LIKE 'SP-TER%' OR `sku` LIKE 'BAT-TERRA' OR `sku` LIKE 'PRP-TW%' THEN 'TERRA'
    WHEN `sku` LIKE 'L5P%' OR `sku` LIKE 'SP-LUM%' OR `sku` LIKE 'BAT-LUMEN' OR `sku` LIKE 'PRP-LUM%' OR `sku` LIKE 'LUM%' THEN 'LUMEN'
    WHEN `sku` LIKE 'AG%'  OR `sku` LIKE 'SP-AGR%' OR `sku` LIKE 'BAT-AG%'  OR `sku` LIKE 'PRP-AGR%' THEN 'AGRI'
    ELSE 'DAMACO'
  END,
  `keperluan`  = CASE
    WHEN `category` IN ('Baterai','Propeller','Controller','Charger','Tas & Case','Aksesoris') THEN 'Aksesoris'
    WHEN `name` LIKE '%Agri%' OR `name` LIKE '%Sprayer%' OR `name` LIKE '%Semprot%' OR `name` LIKE '%Multispectral%' THEN 'Pertanian Presisi'
    WHEN `name` LIKE '%Lumen%' OR `name` LIKE '%Cinema%' OR `name` LIKE '%Visual%' THEN 'Sinematografi Udara'
    WHEN `name` LIKE '%Thermal%' OR `name` LIKE '%Inspek%' OR `name` LIKE '%Scout%' OR `name` LIKE '%Searchlight%' OR `name` LIKE '%Drop%' THEN 'Inspeksi & Keamanan'
    ELSE 'Survei & Pemetaan'
  END,
  `ketersediaan` = CASE
    WHEN `name` LIKE '%Heavy Lift%' OR `name` LIKE '%Lidar%' OR `name` LIKE '%Dual-Screen%' THEN 'indent_14_hari'
    WHEN `stock` < 6 THEN 'stok_terbatas'
    ELSE 'ready_stock'
  END,
  `visual_type` = CASE
    WHEN `category` = 'Baterai' THEN 'baterai'
    WHEN `category` = 'Propeller' THEN 'propeller'
    ELSE 'quadcopter'
  END
WHERE `brand` IS NULL OR `keperluan` IS NULL;

-- Verifikasi hasil
SHOW TABLES;
SELECT COUNT(*) AS total_products FROM `products`;
SELECT COUNT(*) AS total_orders FROM `damaco_orders`;
SELECT COUNT(*) AS total_users FROM `users`;

