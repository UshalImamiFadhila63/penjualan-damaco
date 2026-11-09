const db = require('../config/database');
const { createError } = require('../middleware/errorHandler');
const { randomUUID } = require('crypto');

const createPenawaran = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const { items, catatan } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return next(createError('Pilih minimal satu produk untuk penawaran', 400));
    }
    if (items.length > 50) {
      return next(createError('Maksimal 50 jenis produk per penawaran', 400));
    }

    await connection.beginTransaction();
    const preparedItems = [];

    for (const item of items) {
      const quantity = Number(item.jumlah);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000) {
        await connection.rollback();
        return next(createError('Jumlah produk harus berupa bilangan bulat positif', 400));
      }

      const [products] = await connection.query(
        'SELECT id, nama, harga_jual FROM produk WHERE id = ? AND is_active = 1',
        [item.produk_id]
      );
      if (products.length === 0) {
        await connection.rollback();
        return next(createError(`Produk ID ${item.produk_id} tidak ditemukan`, 404));
      }

      preparedItems.push({
        product: products[0],
        quantity,
      });
    }

    const reference = `OFF-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const [result] = await connection.query(
      'INSERT INTO penawaran (nomor_penawaran, user_id, catatan) VALUES (?, ?, ?)',
      [reference, req.user.id, catatan?.trim() || null]
    );

    for (const item of preparedItems) {
      await connection.query(
        `INSERT INTO detail_penawaran
          (penawaran_id, produk_id, nama_produk, harga_satuan, jumlah)
         VALUES (?, ?, ?, ?, ?)`,
        [result.insertId, item.product.id, item.product.nama, item.product.harga_jual, item.quantity]
      );
    }

    await connection.commit();
    res.status(201).json({
      success: true,
      message: 'Permintaan penawaran berhasil dikirim',
      data: { id: result.insertId, nomor_penawaran: reference, status: 'menunggu' },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

const getAllPenawaran = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.nomor_penawaran, p.catatan, p.status, p.created_at,
              u.nama AS customer_nama, u.email AS customer_email, u.telepon AS customer_telepon,
              dp.nama_produk, dp.harga_satuan, dp.jumlah
       FROM penawaran p
       JOIN users u ON u.id = p.user_id
       JOIN detail_penawaran dp ON dp.penawaran_id = p.id
       ORDER BY p.created_at DESC, dp.id ASC`
    );

    const offersById = new Map();
    for (const row of rows) {
      if (!offersById.has(row.id)) {
        offersById.set(row.id, {
          id: row.id,
          nomor_penawaran: row.nomor_penawaran,
          catatan: row.catatan,
          status: row.status,
          created_at: row.created_at,
          customer_nama: row.customer_nama,
          customer_email: row.customer_email,
          customer_telepon: row.customer_telepon,
          items: [],
        });
      }
      offersById.get(row.id).items.push({
        nama_produk: row.nama_produk,
        harga_satuan: row.harga_satuan,
        jumlah: row.jumlah,
      });
    }

    res.json({ success: true, data: [...offersById.values()] });
  } catch (error) {
    next(error);
  }
};

const updateStatusPenawaran = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['menunggu', 'diproses', 'diterima', 'ditolak'];
    if (!validStatuses.includes(status)) {
      return next(createError('Status penawaran tidak valid', 400));
    }

    const [result] = await db.query(
      'UPDATE penawaran SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return next(createError('Penawaran tidak ditemukan', 404));
    }

    res.json({ success: true, message: 'Status penawaran berhasil diperbarui' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPenawaran, getAllPenawaran, updateStatusPenawaran };
