const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'penjualan_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper to extract data from DamacoContext.jsx
function extractFromContext(varName) {
  const contextPath = path.join(__dirname, '../../frontend/src/context/DamacoContext.jsx');
  const content = fs.readFileSync(contextPath, 'utf8');
  const start = content.indexOf('export const ' + varName + ' = [');
  if (start === -1) return [];
  const end = content.indexOf(';\n', start);
  const jsonStr = content.substring(start + ('export const ' + varName + ' = ').length, end);
  return eval('(' + jsonStr + ')');
}

async function syncAllData() {
  console.log('🔄 Memulai sinkronisasi web Damaco dengan database penjualan_db...\n');
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Modifikasi ENUM role pada tabel users agar mendukung 'admin' selain 'super_admin' & 'customer'
    console.log('1️⃣ Memperbarui struktur tabel users...');
    await conn.query(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('super_admin', 'admin', 'customer') NOT NULL DEFAULT 'customer'
    `);

    // 2. Buat tabel damaco_orders untuk menyimpan snapshot lengkap pesanan B2B
    console.log('2️⃣ Mempersiapkan tabel sinkronisasi damaco_orders...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS damaco_orders (
        id VARCHAR(50) PRIMARY KEY,
        nomor VARCHAR(60) NOT NULL UNIQUE,
        customer_id VARCHAR(50),
        customer_nama VARCHAR(180),
        contact VARCHAR(100),
        telepon VARCHAR(30),
        email VARCHAR(100),
        npwp VARCHAR(50),
        detail TEXT,
        items JSON,
        total DECIMAL(15,2) DEFAULT 0.00,
        estimasi_margin DECIMAL(15,2) DEFAULT 0.00,
        action_group VARCHAR(50),
        tanggal DATE,
        status VARCHAR(50),
        status_label VARCHAR(100),
        catatan TEXT,
        po_number VARCHAR(60),
        invoice_nomor VARCHAR(60),
        ekspedisi VARCHAR(100),
        no_resi VARCHAR(100),
        raw_data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // 3. Sinkronisasi Company Settings
    console.log('3️⃣ Menyinkronkan Pengaturan Perusahaan (company_settings)...');
    await conn.query(`
      INSERT INTO company_settings (id, company_name, company_code, email, phone, address, tax_id)
      VALUES (1, 'PT Damaco Dirgantara Niaga', 'DMC-PNY', 'sales@damaco.co.id', '021-5551234', 
              'Graha Dirgantara Lt. 5, Jl. Protokol Halim Perdanakusuma No. 8, Jakarta Timur 13610', 
              '01.999.888.7-011.000')
      ON DUPLICATE KEY UPDATE
        company_name = VALUES(company_name),
        company_code = VALUES(company_code),
        email = VALUES(email),
        phone = VALUES(phone),
        address = VALUES(address),
        tax_id = VALUES(tax_id)
    `);

    // 4. Sinkronisasi Dealers
    console.log('4️⃣ Menyinkronkan Data Dealer (dealers)...');
    const dealers = [
      {
        code: 'DLR-JKT',
        name: 'Damaco Authorized Partner Hub Jakarta',
        email: 'partner-jkt@damaco.co.id',
        phone: '021-5552345',
        address: 'Kawasan Industri Pulogadung, Jakarta Timur',
      },
      {
        code: 'DLR-JATIM',
        name: 'Dealer Distribusi Wilayah Jawa Timur & Bali',
        email: 'dealer-jatim@damaco.co.id',
        phone: '031-8987654',
        address: 'Kawasan Agrobisnis Puspa Agro Blok B-12, Sidoarjo, Jawa Timur',
      },
      {
        code: 'DLR-CIKARANG',
        name: 'Principal Direct Import Clearance (Gudang Pusat Cikarang)',
        email: 'warehouse-cikarang@damaco.co.id',
        phone: '021-8983344',
        address: 'Kawasan Jababeka Blok F-12, Cikarang, Bekasi 17530',
      },
      {
        code: 'DLR-BDG',
        name: 'Dealer Spesialis Sensor Survei Geospasial Bandung',
        email: 'sensor-bdg@damaco.co.id',
        phone: '022-7234567',
        address: 'Grand Surya Office Park No. 8, Jl. Soekarno Hatta, Bandung',
      },
    ];

    for (const d of dealers) {
      await conn.query(`
        INSERT INTO dealers (code, name, email, phone, address, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          email = VALUES(email),
          phone = VALUES(phone),
          address = VALUES(address)
      `, [d.code, d.name, d.email, d.phone, d.address]);
    }

    // 5. Sinkronisasi Akun Users (Admin & Customer)
    console.log('5️⃣ Menyinkronkan Akun Pengguna (users)...');
    const defaultPasswordHash = await bcrypt.hash('password', 10);
    const usersToSync = [
      { nama: 'Administrator', email: 'admin@penjualan.com', telepon: '021-5551234', role: 'admin' },
      { nama: 'Rina Kusuma', email: 'rina.kusuma@damaco.com', telepon: '0811-9876-5432', role: 'admin' },
      { nama: 'Raka Pradipta', email: 'customer@damaco.com', telepon: '0812-3456-7890', role: 'customer' },
      { nama: 'Raka Pradipta', email: 'raka@nusantarageo.co.id', telepon: '0812-3456-7890', role: 'customer' },
      { nama: 'Hendra Wijaya', email: 'hendra@geospasial.co.id', telepon: '0811-2233-4455', role: 'customer' },
      { nama: 'Ir. Bambang Soeprapto', email: 'sales@tanimakmur.com', telepon: '0812-3456-7890', role: 'customer' },
      { nama: 'Ibu Hj. Sri Wahyuni, M.Si', email: 'pertanian@malangkab.go.id', telepon: '0341-395123', role: 'customer' },
      { nama: 'Aditya Pratama, S.T.', email: 'aditya@cakrasurvei.id', telepon: '0813-9988-7766', role: 'customer' },
      { nama: 'Dimas Prasetyo', email: 'dimas@samudravm.com', telepon: '0817-0011-2233', role: 'customer' },
      { nama: 'Citra Lestari, M.Sc.', email: 'citra@geosolusi.co.id', telepon: '0818-5566-7788', role: 'customer' },
    ];

    const userEmailToId = {};
    for (const u of usersToSync) {
      const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [u.email]);
      let uId;
      if (existing.length > 0) {
        uId = existing[0].id;
        await conn.query('UPDATE users SET nama = ?, telepon = ?, role = ?, is_active = 1 WHERE id = ?', [
          u.nama, u.telepon, u.role, uId
        ]);
      } else {
        const [res] = await conn.query(
          'INSERT INTO users (nama, email, telepon, password, role, is_active) VALUES (?, ?, ?, ?, ?, 1)',
          [u.nama, u.email, u.telepon, defaultPasswordHash, u.role]
        );
        uId = res.insertId;
      }
      userEmailToId[u.email] = uId;
    }

    // 6. Sinkronisasi Profil Customer (customer_profiles)
    console.log('6️⃣ Menyinkronkan Profil Perusahaan Customer (customer_profiles)...');
    const customerProfiles = [
      {
        email: 'customer@damaco.com',
        company_name: 'PT Nusantara Geospasial',
        phone: '0812-3456-7890',
        tax_id: '01.234.567.8-012.000',
        billing_address: 'Jl. TB Simatupang No. 18, Cilandak, Jakarta Selatan 12430',
        shipping_address: JSON.stringify([
          { id: 1, label: 'Kantor Pusat', isPrimary: true, alamat: 'Jl. TB Simatupang No. 18, Cilandak, Jakarta Selatan 12430', pic: 'Raka Pradipta', telepon: '0812-3456-7890' },
          { id: 2, label: 'Gudang Cikarang', isPrimary: false, alamat: 'Kawasan Jababeka Blok F-12, Cikarang, Bekasi 17530', pic: 'Dewi Anggraini', telepon: '0813-8800-2211' }
        ]),
      },
      {
        email: 'raka@nusantarageo.co.id',
        company_name: 'PT Nusantara Geospasial',
        phone: '0812-3456-7890',
        tax_id: '01.234.567.8-012.000',
        billing_address: 'Jl. TB Simatupang No. 18, Cilandak, Jakarta Selatan 12430',
        shipping_address: JSON.stringify([
          { id: 1, label: 'Kantor Pusat', isPrimary: true, alamat: 'Jl. TB Simatupang No. 18, Cilandak, Jakarta Selatan 12430', pic: 'Raka Pradipta', telepon: '0812-3456-7890' },
          { id: 2, label: 'Gudang Cikarang', isPrimary: false, alamat: 'Kawasan Jababeka Blok F-12, Cikarang, Bekasi 17530', pic: 'Dewi Anggraini', telepon: '0813-8800-2211' }
        ]),
      },
      {
        email: 'hendra@geospasial.co.id',
        company_name: 'PT Nusantara Geospasial',
        phone: '0811-2233-4455',
        tax_id: '01.234.567.8-012.000',
        billing_address: 'Gedung Cyber 2 Tower Lt. 14, Jl. HR Rasuna Said, Jakarta Selatan',
        shipping_address: 'Gedung Cyber 2 Tower Lt. 14, Jl. HR Rasuna Said, Jakarta Selatan',
      },
      {
        email: 'sales@tanimakmur.com',
        company_name: 'CV Tani Makmur Sejahtera',
        phone: '0812-3456-7890',
        tax_id: '02.345.678.9-023.000',
        billing_address: 'Kawasan Agrobisnis Puspa Agro Blok B-12, Sidoarjo, Jawa Timur',
        shipping_address: 'Kawasan Agrobisnis Puspa Agro Blok B-12, Sidoarjo, Jawa Timur',
      },
      {
        email: 'pertanian@malangkab.go.id',
        company_name: 'Dinas Pertanian Kab. Malang',
        phone: '0341-395123',
        tax_id: '00.123.456.7-034.000',
        billing_address: 'Jl. Panji No. 119, Kepanjen, Kabupaten Malang, Jawa Timur',
        shipping_address: 'Jl. Panji No. 119, Kepanjen, Kabupaten Malang, Jawa Timur',
      },
    ];

    for (const cp of customerProfiles) {
      const uId = userEmailToId[cp.email];
      if (uId) {
        await conn.query(`
          INSERT INTO customer_profiles (user_id, company_name, phone, billing_address, shipping_address, tax_id)
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            company_name = VALUES(company_name),
            phone = VALUES(phone),
            billing_address = VALUES(billing_address),
            shipping_address = VALUES(shipping_address),
            tax_id = VALUES(tax_id)
        `, [uId, cp.company_name, cp.phone, cp.billing_address, cp.shipping_address, cp.tax_id]);
      }
    }

    // 7. Sinkronisasi 30 Produk B2B Katalog Damaco (products)
    console.log('7️⃣ Menyinkronkan 30 Produk B2B Damaco (products)...');
    const initialProducts = extractFromContext('INITIAL_PRODUCTS');
    const productIdMap = {};

    for (const p of initialProducts) {
      const sku = p.kode || p.id;
      const buyPrice = Math.round(p.harga * 0.85);
      const sellPrice = p.harga;
      const unit = p.satuan || 'unit';
      const desc = p.deskripsi || p.nama;

      await conn.query(`
        INSERT INTO products (sku, name, description, category, unit, buy_price, sell_price, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          description = VALUES(description),
          category = VALUES(category),
          unit = VALUES(unit),
          buy_price = VALUES(buy_price),
          sell_price = VALUES(sell_price),
          is_active = 1
      `, [sku, p.nama, desc, p.kategori, unit, buyPrice, sellPrice]);

      const [pRows] = await conn.query('SELECT id FROM products WHERE sku = ?', [sku]);
      if (pRows.length > 0) {
        productIdMap[p.nama] = pRows[0].id;
        productIdMap[sku] = pRows[0].id;
      }
    }

    // 8. Sinkronisasi Pesanan (damaco_orders, quotation_requests, offers, purchase_orders, invoices)
    console.log('8️⃣ Menyinkronkan Daftar Pesanan B2B...');
    const initialOrders = extractFromContext('INITIAL_ORDERS');
    const [dlrRows] = await conn.query('SELECT id FROM dealers LIMIT 1');
    const defaultDealerId = dlrRows.length > 0 ? dlrRows[0].id : 1;

    for (const order of initialOrders) {
      // 8a. Simpan ke damaco_orders
      await conn.query(`
        INSERT INTO damaco_orders 
          (id, nomor, customer_id, customer_nama, contact, telepon, email, npwp, detail, items, total, 
           estimasi_margin, action_group, tanggal, status, status_label, catatan, po_number, invoice_nomor, 
           ekspedisi, no_resi, raw_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          customer_nama = VALUES(customer_nama),
          contact = VALUES(contact),
          telepon = VALUES(telepon),
          email = VALUES(email),
          items = VALUES(items),
          total = VALUES(total),
          status = VALUES(status),
          status_label = VALUES(status_label),
          action_group = VALUES(action_group),
          po_number = VALUES(po_number),
          invoice_nomor = VALUES(invoice_nomor),
          no_resi = VALUES(no_resi),
          raw_data = VALUES(raw_data)
      `, [
        order.id,
        order.nomor,
        order.customerId || 'CUST-001',
        order.customerNama || '',
        order.contact || '',
        order.telepon || '',
        order.email || '',
        order.npwp || '',
        order.detail || '',
        JSON.stringify(order.items || []),
        order.total || 0,
        order.estimasiMarginKotor || 0,
        order.actionGroup || '',
        order.tanggal || '2026-11-11',
        order.status || '',
        order.statusLabel || '',
        order.catatan || '',
        order.poNumber || null,
        order.invoiceNomor || null,
        order.ekspedisi || null,
        order.noResi || null,
        JSON.stringify(order)
      ]);

      // 8b. Simpan ke quotation_requests
      const custUserId = userEmailToId[order.email] || userEmailToId['raka@nusantarageo.co.id'] || 2;
      const [qrRows] = await conn.query('SELECT id FROM quotation_requests WHERE request_number = ?', [order.nomor]);
      let qrId;
      if (qrRows.length > 0) {
        qrId = qrRows[0].id;
      } else {
        const [qrRes] = await conn.query(
          'INSERT INTO quotation_requests (request_number, customer_id, notes, status, created_at) VALUES (?, ?, ?, ?, ?)',
          [order.nomor, custUserId, order.catatan || null, 'SUBMITTED', order.tanggal ? new Date(order.tanggal) : new Date()]
        );
        qrId = qrRes.insertId;

        // quotation_request_items
        if (order.items && order.items.length > 0) {
          for (const itm of order.items) {
            const pId = productIdMap[itm.nama] || 1;
            await conn.query(
              'INSERT INTO quotation_request_items (quotation_request_id, product_id, quantity, requested_unit_price) VALUES (?, ?, ?, ?)',
              [qrId, pId, itm.qty || 1, itm.harga || 0]
            );
          }
        }
      }

      // 8c. Simpan ke offers jika status >= draft_penawaran
      const [offRows] = await conn.query('SELECT id FROM offers WHERE offer_number = ?', [order.nomor]);
      let offerId;
      if (offRows.length > 0) {
        offerId = offRows[0].id;
      } else {
        const [offRes] = await conn.query(
          'INSERT INTO offers (offer_number, quotation_request_id, customer_id, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [order.nomor, qrId, custUserId, order.status === 'draft_penawaran' ? 'DRAFT' : 'ISSUED', order.catatan || null, order.tanggal ? new Date(order.tanggal) : new Date()]
        );
        offerId = offRes.insertId;

        if (order.items && order.items.length > 0) {
          for (const itm of order.items) {
            const pId = productIdMap[itm.nama] || 1;
            await conn.query(
              'INSERT INTO offer_items (offer_id, product_id, description, quantity, unit_price) VALUES (?, ?, ?, ?, ?)',
              [offerId, pId, itm.nama, itm.qty || 1, itm.harga || 0]
            );
          }
        }
      }

      // 8d. Simpan ke purchase_orders jika memiliki PO
      if (order.poNumber || ['po_diterima', 'koordinasi_dealer', 'siap_invoice', 'menunggu_pembayaran', 'siap_dikirim', 'dalam_pengiriman', 'diterima', 'selesai'].includes(order.status)) {
        const poNum = order.poNumber || `PO-${order.nomor.replace(/\//g, '-')}`;
        const [poRows] = await conn.query('SELECT id FROM purchase_orders WHERE po_number = ?', [poNum]);
        let poId;
        let poStatus = 'PO_RECEIVED';
        if (['koordinasi_dealer'].includes(order.status)) poStatus = 'DEALER_VERIFIED';
        if (['siap_invoice', 'menunggu_pembayaran'].includes(order.status)) poStatus = 'AWAITING_PAYMENT';
        if (['siap_dikirim'].includes(order.status)) poStatus = 'PAID';
        if (['dalam_pengiriman'].includes(order.status)) poStatus = 'SHIPPED';
        if (['diterima'].includes(order.status)) poStatus = 'RECEIVED';
        if (['selesai'].includes(order.status)) poStatus = 'COMPLETED';

        if (poRows.length > 0) {
          poId = poRows[0].id;
          await conn.query('UPDATE purchase_orders SET status = ?, total_amount = ? WHERE id = ?', [poStatus, order.total || 0, poId]);
        } else {
          const [poRes] = await conn.query(
            'INSERT INTO purchase_orders (po_number, quotation_id, dealer_id, customer_id, status, total_amount, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [poNum, offerId, defaultDealerId, custUserId, poStatus, order.total || 0, order.catatan || null, order.tanggal ? new Date(order.tanggal) : new Date()]
          );
          poId = poRes.insertId;

          if (order.items && order.items.length > 0) {
            for (const itm of order.items) {
              const pId = productIdMap[itm.nama] || 1;
              await conn.query(
                'INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
                [poId, pId, itm.qty || 1, itm.harga || 0]
              );
            }
          }
        }

        // 8e. Simpan ke invoices jika memiliki nomor invoice
        if (order.invoiceNomor || ['menunggu_pembayaran', 'siap_dikirim', 'dalam_pengiriman', 'diterima', 'selesai'].includes(order.status)) {
          const invNum = order.invoiceNomor || `INV/${order.nomor.replace('QT/', '')}`;
          const [invRows] = await conn.query('SELECT id FROM invoices WHERE invoice_number = ?', [invNum]);
          const invStatus = ['siap_dikirim', 'dalam_pengiriman', 'diterima', 'selesai'].includes(order.status) ? 'PAID' : 'ISSUED';
          if (invRows.length === 0) {
            await conn.query(
              'INSERT INTO invoices (invoice_number, purchase_order_id, customer_id, status, amount, due_date, created_at) VALUES (?, ?, ?, ?, ?, DATE_ADD(?, INTERVAL 14 DAY), ?)',
              [invNum, poId, custUserId, invStatus, order.total || 0, order.tanggal || '2026-11-11', order.tanggal ? new Date(order.tanggal) : new Date()]
            );
          }
        }
      }
    }

    // 9. Sinkronisasi Notifikasi (notifications)
    console.log('9️⃣ Menyinkronkan Notifikasi Sistem (notifications)...');
    const initialNotifs = extractFromContext('INITIAL_NOTIFICATIONS');
    for (const notif of initialNotifs) {
      const uId = notif.targetRole === 'admin' ? (userEmailToId['admin@penjualan.com'] || 1) : (userEmailToId['raka@nusantarageo.co.id'] || 2);
      await conn.query(`
        INSERT INTO notifications (user_id, title, message, read_at, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `, [uId, notif.title, notif.desc, notif.read ? new Date() : null]);
    }

    await conn.commit();
    console.log('\n✅ SINKRONISASI BERHASIL! Semua data web telah tersimpan di database penjualan_db 🚀\n');
  } catch (error) {
    await conn.rollback();
    console.error('❌ Terjadi kesalahan saat sinkronisasi:', error);
    throw error;
  } finally {
    conn.release();
    await pool.end();
  }
}

if (require.main === module) {
  syncAllData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { syncAllData };

