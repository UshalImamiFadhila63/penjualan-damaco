const db = require('../config/database');

const getCatalog = async (req, res, next) => {
  try {
    const { search, kategori_id } = req.query;
    let whereClause = 'WHERE p.is_active = 1';
    const params = [];

    if (search) {
      whereClause += ' AND (p.nama LIKE ? OR p.kode_produk LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (kategori_id) {
      whereClause += ' AND p.kategori_id = ?';
      params.push(kategori_id);
    }

    const [rows] = await db.query(
      `SELECT p.id, p.kode_produk, p.nama, p.deskripsi, p.harga_jual, p.satuan, p.gambar,
              k.nama AS kategori_nama
       FROM produk p
       LEFT JOIN kategori k ON p.kategori_id = k.id
       ${whereClause}
       ORDER BY p.nama ASC`,
      params
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCatalog };
