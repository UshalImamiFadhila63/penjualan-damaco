const db = require('../config/database');
const { createError } = require('../middleware/errorHandler');

// @desc    Get all transaksi penjualan
// @route   GET /api/penjualan
// @access  Private
const getAllPenjualan = async (req, res, next) => {
  try {
    const { search, status, start_date, end_date, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (p.nomor_transaksi LIKE ? OR pl.nama LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      whereClause += ' AND p.status = ?';
      params.push(status);
    }
    if (start_date) {
      whereClause += ' AND DATE(p.tanggal) >= ?';
      params.push(start_date);
    }
    if (end_date) {
      whereClause += ' AND DATE(p.tanggal) <= ?';
      params.push(end_date);
    }

    const [rows] = await db.query(
      `SELECT p.*, pl.nama AS pelanggan_nama, u.nama AS kasir_nama
       FROM penjualan p
       LEFT JOIN pelanggan pl ON p.pelanggan_id = pl.id
       LEFT JOIN users u ON p.user_id = u.id
       ${whereClause}
       ORDER BY p.tanggal DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total
       FROM penjualan p
       LEFT JOIN pelanggan pl ON p.pelanggan_id = pl.id
       ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaksi dengan detail
// @route   GET /api/penjualan/:id
// @access  Private
const getPenjualanById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, pl.nama AS pelanggan_nama, pl.telepon AS pelanggan_telepon,
              u.nama AS kasir_nama
       FROM penjualan p
       LEFT JOIN pelanggan pl ON p.pelanggan_id = pl.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) return next(createError('Transaksi tidak ditemukan', 404));

    const [detail] = await db.query(
      `SELECT dp.*, pr.kode_produk, pr.gambar
       FROM detail_penjualan dp
       LEFT JOIN produk pr ON dp.produk_id = pr.id
       WHERE dp.penjualan_id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      data: { ...rows[0], items: detail },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Buat transaksi penjualan baru
// @route   POST /api/penjualan
// @access  Private
const createPenjualan = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      pelanggan_id, items, diskon = 0, pajak = 0,
      uang_bayar, metode_pembayaran = 'tunai', catatan,
    } = req.body;

    if (!items || items.length === 0) {
      return next(createError('Item transaksi tidak boleh kosong', 400));
    }

    // Generate nomor transaksi
    const tanggal = new Date();
    const nomorTransaksi = `TRX-${tanggal.getFullYear()}${String(tanggal.getMonth() + 1).padStart(2, '0')}${String(tanggal.getDate()).padStart(2, '0')}-${Date.now().toString().slice(-6)}`;

    // Hitung total & validasi stok
    let totalHarga = 0;
    const itemsData = [];

    for (const item of items) {
      const [produkRows] = await conn.query(
        'SELECT * FROM produk WHERE id = ? AND is_active = 1',
        [item.produk_id]
      );

      if (produkRows.length === 0) {
        await conn.rollback();
        return next(createError(`Produk ID ${item.produk_id} tidak ditemukan`, 404));
      }

      const produk = produkRows[0];

      if (produk.stok < item.jumlah) {
        await conn.rollback();
        return next(createError(`Stok ${produk.nama} tidak cukup (tersisa: ${produk.stok})`, 400));
      }

      const itemDiskon = item.diskon || 0;
      const subtotal = (produk.harga_jual * item.jumlah) - itemDiskon;
      totalHarga += subtotal;

      itemsData.push({
        produk_id: produk.id,
        nama_produk: produk.nama,
        harga_satuan: produk.harga_jual,
        jumlah: item.jumlah,
        diskon: itemDiskon,
        subtotal,
        stok_lama: produk.stok,
      });
    }

    const totalBayar = totalHarga - diskon + pajak;
    const kembalian = (uang_bayar || 0) - totalBayar;

    // Insert header penjualan
    const [result] = await conn.query(
      `INSERT INTO penjualan
        (nomor_transaksi, pelanggan_id, user_id, total_harga, diskon, pajak, total_bayar,
         uang_bayar, kembalian, metode_pembayaran, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nomorTransaksi, pelanggan_id || null, req.user.id, totalHarga, diskon, pajak,
       totalBayar, uang_bayar || 0, kembalian > 0 ? kembalian : 0, metode_pembayaran, catatan]
    );

    const penjualanId = result.insertId;

    // Insert detail & kurangi stok
    for (const item of itemsData) {
      await conn.query(
        `INSERT INTO detail_penjualan
          (penjualan_id, produk_id, nama_produk, harga_satuan, jumlah, diskon, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [penjualanId, item.produk_id, item.nama_produk, item.harga_satuan,
         item.jumlah, item.diskon, item.subtotal]
      );

      await conn.query(
        'UPDATE produk SET stok = stok - ? WHERE id = ?',
        [item.jumlah, item.produk_id]
      );
    }

    await conn.commit();

    const [newPenjualan] = await db.query(
      `SELECT p.*, pl.nama AS pelanggan_nama, u.nama AS kasir_nama
       FROM penjualan p
       LEFT JOIN pelanggan pl ON p.pelanggan_id = pl.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [penjualanId]
    );

    const [newDetail] = await db.query(
      'SELECT * FROM detail_penjualan WHERE penjualan_id = ?',
      [penjualanId]
    );

    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil dibuat',
      data: { ...newPenjualan[0], items: newDetail },
    });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

// @desc    Update status transaksi
// @route   PUT /api/penjualan/:id/status
// @access  Private (admin)
const updateStatusPenjualan = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatus = ['selesai', 'pending', 'batal'];

    if (!validStatus.includes(status)) {
      return next(createError('Status tidak valid', 400));
    }

    const [existing] = await db.query('SELECT id FROM penjualan WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return next(createError('Transaksi tidak ditemukan', 404));

    await db.query('UPDATE penjualan SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: `Status transaksi diubah ke "${status}"` });
  } catch (error) {
    next(error);
  }
};

// @desc    Dashboard statistik
// @route   GET /api/penjualan/dashboard
// @access  Private
const getDashboard = async (req, res, next) => {
  try {
    // Penjualan hari ini
    const [[hariIni]] = await db.query(
      `SELECT COUNT(*) as total_transaksi, COALESCE(SUM(total_bayar), 0) as total_pendapatan
       FROM penjualan WHERE DATE(tanggal) = CURDATE() AND status = 'selesai'`
    );

    // Penjualan bulan ini
    const [[bulanIni]] = await db.query(
      `SELECT COUNT(*) as total_transaksi, COALESCE(SUM(total_bayar), 0) as total_pendapatan
       FROM penjualan WHERE MONTH(tanggal) = MONTH(CURDATE()) AND YEAR(tanggal) = YEAR(CURDATE()) AND status = 'selesai'`
    );

    // Total produk
    const [[totalProduk]] = await db.query(
      'SELECT COUNT(*) as total FROM produk WHERE is_active = 1'
    );

    // Produk stok menipis
    const [stokMenipis] = await db.query(
      'SELECT id, nama, stok, stok_minimum FROM produk WHERE stok <= stok_minimum AND is_active = 1 ORDER BY stok ASC LIMIT 5'
    );

    // Penjualan 7 hari terakhir (untuk chart)
    const [grafikPenjualan] = await db.query(
      `SELECT DATE(tanggal) as tanggal,
              COUNT(*) as total_transaksi,
              COALESCE(SUM(total_bayar), 0) as total_pendapatan
       FROM penjualan
       WHERE tanggal >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND status = 'selesai'
       GROUP BY DATE(tanggal)
       ORDER BY tanggal ASC`
    );

    // Top 5 produk terlaris
    const [produkTerlaris] = await db.query(
      `SELECT pr.nama, SUM(dp.jumlah) as total_terjual, SUM(dp.subtotal) as total_pendapatan
       FROM detail_penjualan dp
       JOIN produk pr ON dp.produk_id = pr.id
       JOIN penjualan p ON dp.penjualan_id = p.id
       WHERE p.status = 'selesai' AND MONTH(p.tanggal) = MONTH(CURDATE())
       GROUP BY pr.id, pr.nama
       ORDER BY total_terjual DESC
       LIMIT 5`
    );

    // Total pelanggan
    const [[totalPelanggan]] = await db.query(
      'SELECT COUNT(*) as total FROM pelanggan WHERE id > 1'
    );

    res.json({
      success: true,
      data: {
        hari_ini: hariIni,
        bulan_ini: bulanIni,
        total_produk: totalProduk.total,
        total_pelanggan: totalPelanggan.total,
        stok_menipis: stokMenipis,
        grafik_penjualan: grafikPenjualan,
        produk_terlaris: produkTerlaris,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPenjualan,
  getPenjualanById,
  createPenjualan,
  updateStatusPenjualan,
  getDashboard,
};
