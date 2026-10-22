const db = require('../config/database');
const { createError } = require('../middleware/errorHandler');

// @desc    Get all produk
// @route   GET /api/produk
// @access  Private
const getAllProduk = async (req, res, next) => {
  try {
    const { search, kategori_id, is_active, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (p.nama LIKE ? OR p.kode_produk LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (kategori_id) {
      whereClause += ' AND p.kategori_id = ?';
      params.push(kategori_id);
    }
    if (is_active !== undefined) {
      whereClause += ' AND p.is_active = ?';
      params.push(is_active);
    }

    const [rows] = await db.query(
      `SELECT p.*, k.nama AS kategori_nama, s.nama AS supplier_nama
       FROM produk p
       LEFT JOIN kategori k ON p.kategori_id = k.id
       LEFT JOIN supplier s ON p.supplier_id = s.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM produk p ${whereClause}`,
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

// @desc    Get single produk
// @route   GET /api/produk/:id
// @access  Private
const getProdukById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, k.nama AS kategori_nama, s.nama AS supplier_nama
       FROM produk p
       LEFT JOIN kategori k ON p.kategori_id = k.id
       LEFT JOIN supplier s ON p.supplier_id = s.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return next(createError('Produk tidak ditemukan', 404));
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

// @desc    Create produk
// @route   POST /api/produk
// @access  Private (admin, gudang)
const createProduk = async (req, res, next) => {
  try {
    const {
      kode_produk, nama, deskripsi, kategori_id, supplier_id,
      harga_beli, harga_jual, stok, stok_minimum, satuan,
    } = req.body;

    if (!kode_produk || !nama || !harga_jual) {
      return next(createError('Kode produk, nama, dan harga jual wajib diisi', 400));
    }

    const [result] = await db.query(
      `INSERT INTO produk (kode_produk, nama, deskripsi, kategori_id, supplier_id,
        harga_beli, harga_jual, stok, stok_minimum, satuan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [kode_produk, nama, deskripsi, kategori_id || null, supplier_id || null,
       harga_beli || 0, harga_jual, stok || 0, stok_minimum || 5, satuan || 'pcs']
    );

    const [newProduk] = await db.query('SELECT * FROM produk WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Produk berhasil ditambahkan',
      data: newProduk[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update produk
// @route   PUT /api/produk/:id
// @access  Private (admin, gudang)
const updateProduk = async (req, res, next) => {
  try {
    const [existing] = await db.query('SELECT id FROM produk WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return next(createError('Produk tidak ditemukan', 404));

    const {
      kode_produk, nama, deskripsi, kategori_id, supplier_id,
      harga_beli, harga_jual, stok, stok_minimum, satuan, is_active,
    } = req.body;

    await db.query(
      `UPDATE produk SET
        kode_produk = COALESCE(?, kode_produk),
        nama = COALESCE(?, nama),
        deskripsi = COALESCE(?, deskripsi),
        kategori_id = ?,
        supplier_id = ?,
        harga_beli = COALESCE(?, harga_beli),
        harga_jual = COALESCE(?, harga_jual),
        stok = COALESCE(?, stok),
        stok_minimum = COALESCE(?, stok_minimum),
        satuan = COALESCE(?, satuan),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [kode_produk, nama, deskripsi, kategori_id || null, supplier_id || null,
       harga_beli, harga_jual, stok, stok_minimum, satuan, is_active, req.params.id]
    );

    const [updated] = await db.query('SELECT * FROM produk WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Produk berhasil diupdate', data: updated[0] });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete produk
// @route   DELETE /api/produk/:id
// @access  Private (admin)
const deleteProduk = async (req, res, next) => {
  try {
    const [existing] = await db.query('SELECT id FROM produk WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return next(createError('Produk tidak ditemukan', 404));

    await db.query('DELETE FROM produk WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllProduk, getProdukById, createProduk, updateProduk, deleteProduk };
