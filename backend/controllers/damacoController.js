const db = require('../config/database');
const { createError } = require('../middleware/errorHandler');
const { syncAllData } = require('../database/syncData');

// @desc    Get all synchronized web data from database
// @route   GET /api/damaco/sync
// @access  Public / Authenticated
const getSyncData = async (req, res, next) => {
  try {
    // 1. Products — semua kolom baru termasuk B2B catalog fields
    const [products] = await db.query(`
      SELECT 
        id, sku, sku AS kode, name AS nama, description AS deskripsi,
        category AS kategori, brand, keperluan, unit AS satuan,
        buy_price, sell_price AS harga, sell_price,
        COALESCE(stock, 0) AS stok,
        COALESCE(ketersediaan, 'ready_stock') AS ketersediaan,
        COALESCE(is_pilihan, 0) AS isPilihan,
        badge_text AS badgeText,
        image_depan AS imageDepan, image_samping AS imageSamping, image_atas AS imageAtas,
        COALESCE(visual_type, 'quadcopter') AS visualType,
        image_url AS imageUrl,
        durasi, jarak, kamera, berat,
        waktu_terbang_detail AS waktuTerbangDetail,
        jarak_transmisi_detail AS jarakTransmisiDetail,
        kamera_detail AS kameraDetail,
        akurasi_rtk AS akurasiRtk,
        garansi, is_active
      FROM products 
      WHERE is_active = 1
      ORDER BY id ASC
    `);

    // 2. Orders from damaco_orders
    const [orders] = await db.query(`
      SELECT * FROM damaco_orders ORDER BY tanggal DESC, created_at DESC
    `);

    const formattedOrders = orders.map((o) => {
      let items = [];
      let rawData = {};
      try {
        items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []);
      } catch { items = []; }
      try {
        rawData = typeof o.raw_data === 'string' ? JSON.parse(o.raw_data) : (o.raw_data || {});
      } catch { rawData = {}; }

      return {
        ...rawData,
        id: o.id,
        nomor: o.nomor,
        customerId: o.customer_id,
        customerNama: o.customer_nama,
        contact: o.contact,
        telepon: o.telepon,
        email: o.email,
        npwp: o.npwp,
        detail: o.detail,
        items,
        total: Number(o.total) || 0,
        estimasiMarginKotor: Number(o.estimasi_margin) || 0,
        actionGroup: o.action_group,
        tanggal: o.tanggal ? o.tanggal.toISOString().split('T')[0] : '2026-11-11',
        status: o.status,
        statusLabel: o.status_label,
        catatan: o.catatan,
        poNumber: o.po_number,
        invoiceNomor: o.invoice_nomor,
        ekspedisi: o.ekspedisi,
        noResi: o.no_resi,
        alamatPengiriman: rawData.alamatPengiriman || rawData.alamat || null,
        alamat: rawData.alamat || rawData.alamatPengiriman || null,
      };
    });

    // 3. Customers
    const [customers] = await db.query(`
      SELECT u.id, u.nama, u.email, u.telepon, 
             cp.company_name AS perusahaan, cp.tax_id AS npwp, 
             cp.billing_address AS alamat, cp.shipping_address
      FROM users u
      LEFT JOIN customer_profiles cp ON u.id = cp.user_id
      WHERE u.role = 'customer'
    `);

    // 4. Dealers
    const [dealers] = await db.query('SELECT * FROM dealers WHERE is_active = 1');

    // 5. Company Settings
    const [settingsRows] = await db.query('SELECT * FROM company_settings LIMIT 1');
    const companySettings = settingsRows[0] || null;

    // 6. Notifications
    const [notifications] = await db.query(`
      SELECT n.id, n.user_id, n.title, n.message AS \`desc\`, n.read_at, n.created_at,
             IF(n.read_at IS NOT NULL, true, false) AS \`read\`,
             u.email AS targetEmail, u.role AS targetRole
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      ORDER BY n.created_at DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      data: {
        products,
        orders: formattedOrders,
        customers,
        dealers,
        companySettings,
        notifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upsert order into database
// @route   POST /api/damaco/orders
// @access  Public / Authenticated
const saveOrder = async (req, res, next) => {
  try {
    const order = req.body;
    if (!order.nomor) {
      return next(createError('Nomor pesanan wajib diisi', 400));
    }

    const orderId = order.id || 'ord-' + Date.now();

    await db.query(`
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
        npwp = VALUES(npwp),
        detail = VALUES(detail),
        items = VALUES(items),
        total = VALUES(total),
        estimasi_margin = VALUES(estimasi_margin),
        action_group = VALUES(action_group),
        status = VALUES(status),
        status_label = VALUES(status_label),
        catatan = VALUES(catatan),
        po_number = VALUES(po_number),
        invoice_nomor = VALUES(invoice_nomor),
        ekspedisi = VALUES(ekspedisi),
        no_resi = VALUES(no_resi),
        raw_data = VALUES(raw_data)
    `, [
      orderId,
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
      order.tanggal || new Date().toISOString().split('T')[0],
      order.status || '',
      order.statusLabel || '',
      order.catatan || '',
      order.poNumber || null,
      order.invoiceNomor || null,
      order.ekspedisi || null,
      order.noResi || null,
      JSON.stringify(order)
    ]);

    // Sinkronkan juga ke relational purchase_orders jika status bertransisi
    if (order.poNumber) {
      await db.query(
        'UPDATE purchase_orders SET po_number = ?, total_amount = ? WHERE po_number = ? OR quotation_id IN (SELECT id FROM offers WHERE offer_number = ?)',
        [order.poNumber, order.total || 0, order.poNumber, order.nomor]
      );
    }

    res.json({
      success: true,
      message: 'Pesanan berhasil disinkronkan ke database penjualan_db',
      data: { id: orderId, ...order },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Customer Profile & Addresses
// @route   GET /api/damaco/profile
// @access  Public / Authenticated
const getCustomerProfile = async (req, res, next) => {
  try {
    const email = (req.query.email || req.user?.email || '').toLowerCase().trim();
    if (!email) {
      return next(createError('Email parameter diperlukan', 400));
    }

    const [rows] = await db.query(`
      SELECT u.id, u.nama, u.email, u.telepon, 
             cp.company_name AS namaPerusahaan, cp.tax_id AS npwp, 
             cp.billing_address AS alamat, cp.shipping_address
      FROM users u
      LEFT JOIN customer_profiles cp ON u.id = cp.user_id
      WHERE u.email = ?
    `, [email]);

    if (rows.length === 0) {
      return res.json({ success: true, data: null });
    }

    const profile = rows[0];
    let addresses = [];
    try {
      addresses = typeof profile.shipping_address === 'string' && profile.shipping_address.startsWith('[')
        ? JSON.parse(profile.shipping_address)
        : (profile.shipping_address ? [{ id: 1, label: 'Kantor', alamat: profile.shipping_address, isPrimary: true }] : []);
    } catch { addresses = []; }

    res.json({
      success: true,
      data: {
        ...profile,
        addresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save Customer Profile & Addresses
// @route   POST /api/damaco/profile
// @access  Public / Authenticated
const saveCustomerProfile = async (req, res, next) => {
  try {
    const { email, nama, telepon, namaPerusahaan, npwp, alamat, addresses } = req.body;
    const targetEmail = (email || req.user?.email || '').toLowerCase().trim();

    if (!targetEmail) {
      return next(createError('Email wajib diisi', 400));
    }

    const [uRows] = await db.query('SELECT id FROM users WHERE email = ?', [targetEmail]);
    if (uRows.length === 0) {
      return next(createError('User tidak ditemukan', 404));
    }

    const userId = uRows[0].id;
    if (nama || telepon) {
      await db.query('UPDATE users SET nama = COALESCE(?, nama), telepon = COALESCE(?, telepon) WHERE id = ?', [
        nama || null, telepon || null, userId
      ]);
    }

    const shippingJson = addresses ? JSON.stringify(addresses) : null;
    await db.query(`
      INSERT INTO customer_profiles (user_id, company_name, phone, billing_address, shipping_address, tax_id)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        company_name = COALESCE(VALUES(company_name), company_name),
        phone = COALESCE(VALUES(phone), phone),
        billing_address = COALESCE(VALUES(billing_address), billing_address),
        shipping_address = COALESCE(VALUES(shipping_address), shipping_address),
        tax_id = COALESCE(VALUES(tax_id), tax_id)
    `, [userId, namaPerusahaan || null, telepon || null, alamat || null, shippingJson, npwp || null]);

    res.json({
      success: true,
      message: 'Profil perusahaan berhasil disinkronkan ke database penjualan_db',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger re-sync of all web data to database
// @route   POST /api/damaco/sync-all
// @access  Public / Authenticated
const triggerSync = async (req, res, next) => {
  try {
    await syncAllData();
    res.json({
      success: true,
      message: 'Sinkronisasi seluruh data ke database penjualan_db berhasil!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Customer
// @route   DELETE /api/damaco/customers/:id
// @access  Public / Authenticated
const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req.query;

    let userId = null;
    if (id && !id.startsWith('CUST-')) {
      userId = id;
    } else if (email) {
      const [uRows] = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
      if (uRows.length > 0) userId = uRows[0].id;
    }

    if (userId) {
      await db.query('DELETE FROM customer_profiles WHERE user_id = ?', [userId]);
      await db.query('DELETE FROM users WHERE id = ?', [userId]);
    } else if (email) {
      const [uRows] = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
      if (uRows.length > 0) {
        await db.query('DELETE FROM customer_profiles WHERE user_id = ?', [uRows[0].id]);
        await db.query('DELETE FROM users WHERE id = ?', [uRows[0].id]);
      }
    }

    res.json({
      success: true,
      message: 'Customer berhasil dihapus dari database',
    });
  } catch (error) {
    next(error);
  }
};

// ================================================================
// PRODUCT CRUD — /api/damaco/products
// ================================================================

// Helper: map camelCase frontend → snake_case DB
const mapProductToDb = (p) => ({
  sku:                     p.sku || p.kode || null,
  name:                    p.nama || p.name || null,
  description:             p.deskripsi || p.description || null,
  category:                p.kategori || p.category || null,
  brand:                   p.brand || null,
  keperluan:               p.keperluan || null,
  unit:                    p.satuan || p.unit || 'unit',
  buy_price:               Number(p.hargaBeli || p.buy_price || 0),
  sell_price:              Number(p.harga || p.sell_price || p.hargaJual || 0),
  stock:                   Number(p.stok ?? p.stock ?? 0),
  ketersediaan:            p.ketersediaan || 'ready_stock',
  is_pilihan:              p.isPilihan ? 1 : 0,
  badge_text:              p.badgeText || p.badge_text || null,
  image_depan:             p.imageDepan || p.image_depan || null,
  image_samping:           p.imageSamping || p.image_samping || null,
  image_atas:              p.imageAtas || p.image_atas || null,
  visual_type:             p.visualType || p.visual_type || 'quadcopter',
  image_url:               p.imageUrl || p.image_url || null,
  durasi:                  p.durasi || null,
  jarak:                   p.jarak || null,
  kamera:                  p.kamera || null,
  berat:                   p.berat || null,
  waktu_terbang_detail:    p.waktuTerbangDetail || p.waktu_terbang_detail || null,
  jarak_transmisi_detail:  p.jarakTransmisiDetail || p.jarak_transmisi_detail || null,
  kamera_detail:           p.kameraDetail || p.kamera_detail || null,
  akurasi_rtk:             p.akurasiRtk || p.akurasi_rtk || null,
  garansi:                 p.garansi || null,
  is_active:               p.is_active !== undefined ? (p.is_active ? 1 : 0) : 1,
});

// @desc  GET all products
// @route GET /api/damaco/products
const getAllProducts = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id, sku, sku AS kode, name AS nama, description AS deskripsi,
        category AS kategori, brand, keperluan, unit AS satuan,
        buy_price, sell_price AS harga, sell_price,
        COALESCE(stock, 0) AS stok,
        COALESCE(ketersediaan, 'ready_stock') AS ketersediaan,
        COALESCE(is_pilihan, 0) AS isPilihan,
        badge_text AS badgeText,
        image_depan AS imageDepan, image_samping AS imageSamping, image_atas AS imageAtas,
        COALESCE(visual_type, 'quadcopter') AS visualType,
        image_url AS imageUrl,
        durasi, jarak, kamera, berat,
        waktu_terbang_detail AS waktuTerbangDetail,
        jarak_transmisi_detail AS jarakTransmisiDetail,
        kamera_detail AS kameraDetail,
        akurasi_rtk AS akurasiRtk,
        garansi, is_active, created_at, updated_at
      FROM products ORDER BY id ASC
    `);
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

// @desc  CREATE product
// @route POST /api/damaco/products
const createProduct = async (req, res, next) => {
  try {
    const d = mapProductToDb(req.body);
    if (!d.name) return next(createError('Nama produk wajib diisi', 400));

    // Auto-generate SKU if not provided
    if (!d.sku) {
      const prefix = (d.category || 'PRD').substring(0, 3).toUpperCase();
      d.sku = `${prefix}-${Date.now().toString().slice(-6)}`;
    }

    const [result] = await db.query(
      `INSERT INTO products 
        (sku, name, description, category, brand, keperluan, unit,
         buy_price, sell_price, stock, ketersediaan, is_pilihan, badge_text,
         image_depan, image_samping, image_atas, visual_type, image_url,
         durasi, jarak, kamera, berat,
         waktu_terbang_detail, jarak_transmisi_detail, kamera_detail,
         akurasi_rtk, garansi, is_active)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        d.sku, d.name, d.description, d.category, d.brand, d.keperluan, d.unit,
        d.buy_price, d.sell_price, d.stock, d.ketersediaan, d.is_pilihan, d.badge_text,
        d.image_depan, d.image_samping, d.image_atas, d.visual_type, d.image_url,
        d.durasi, d.jarak, d.kamera, d.berat,
        d.waktu_terbang_detail, d.jarak_transmisi_detail, d.kamera_detail,
        d.akurasi_rtk, d.garansi, d.is_active,
      ]
    );

    const [newRow] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan', data: newRow[0] });
  } catch (error) { next(error); }
};

// @desc  UPDATE product
// @route PUT /api/damaco/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) return next(createError('Produk tidak ditemukan', 404));

    const d = mapProductToDb(req.body);

    await db.query(
      `UPDATE products SET
        sku = COALESCE(?, sku), name = COALESCE(?, name),
        description = ?, category = COALESCE(?, category),
        brand = ?, keperluan = ?, unit = COALESCE(?, unit),
        buy_price = COALESCE(?, buy_price), sell_price = COALESCE(?, sell_price),
        stock = COALESCE(?, stock), ketersediaan = COALESCE(?, ketersediaan),
        is_pilihan = ?, badge_text = ?,
        image_depan = ?, image_samping = ?, image_atas = ?,
        visual_type = COALESCE(?, visual_type), image_url = ?,
        durasi = ?, jarak = ?, kamera = ?, berat = ?,
        waktu_terbang_detail = ?, jarak_transmisi_detail = ?,
        kamera_detail = ?, akurasi_rtk = ?, garansi = ?,
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        d.sku, d.name, d.description, d.category,
        d.brand, d.keperluan, d.unit,
        d.buy_price, d.sell_price,
        d.stock, d.ketersediaan, d.is_pilihan, d.badge_text,
        d.image_depan, d.image_samping, d.image_atas, d.visual_type, d.image_url,
        d.durasi, d.jarak, d.kamera, d.berat,
        d.waktu_terbang_detail, d.jarak_transmisi_detail,
        d.kamera_detail, d.akurasi_rtk, d.garansi,
        d.is_active, id,
      ]
    );

    const [updated] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: 'Produk berhasil diperbarui', data: updated[0] });
  } catch (error) { next(error); }
};

// @desc  DELETE product (soft delete)
// @route DELETE /api/damaco/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) return next(createError('Produk tidak ditemukan', 404));

    await db.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Produk berhasil dinonaktifkan' });
  } catch (error) { next(error); }
};

module.exports = {
  getSyncData,
  saveOrder,
  getCustomerProfile,
  saveCustomerProfile,
  deleteCustomer,
  triggerSync,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};

