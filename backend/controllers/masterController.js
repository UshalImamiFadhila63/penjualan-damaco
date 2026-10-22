const db = require('../config/database');
const { createError } = require('../middleware/errorHandler');

// ---- KATEGORI ----
const getAllKategori = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM kategori ORDER BY nama ASC');
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

const createKategori = async (req, res, next) => {
  try {
    const { nama, deskripsi } = req.body;
    if (!nama) return next(createError('Nama kategori wajib diisi', 400));
    const [result] = await db.query('INSERT INTO kategori (nama, deskripsi) VALUES (?, ?)', [nama, deskripsi]);
    const [newKat] = await db.query('SELECT * FROM kategori WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Kategori berhasil ditambahkan', data: newKat[0] });
  } catch (error) { next(error); }
};

const updateKategori = async (req, res, next) => {
  try {
    const { nama, deskripsi } = req.body;
    await db.query('UPDATE kategori SET nama = ?, deskripsi = ? WHERE id = ?', [nama, deskripsi, req.params.id]);
    res.json({ success: true, message: 'Kategori berhasil diupdate' });
  } catch (error) { next(error); }
};

const deleteKategori = async (req, res, next) => {
  try {
    await db.query('DELETE FROM kategori WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error) { next(error); }
};

// ---- SUPPLIER ----
const getAllSupplier = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM supplier ORDER BY nama ASC');
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

const createSupplier = async (req, res, next) => {
  try {
    const { nama, email, telepon, alamat } = req.body;
    if (!nama) return next(createError('Nama supplier wajib diisi', 400));
    const [result] = await db.query(
      'INSERT INTO supplier (nama, email, telepon, alamat) VALUES (?, ?, ?, ?)',
      [nama, email, telepon, alamat]
    );
    const [newSupplier] = await db.query('SELECT * FROM supplier WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Supplier berhasil ditambahkan', data: newSupplier[0] });
  } catch (error) { next(error); }
};

const updateSupplier = async (req, res, next) => {
  try {
    const { nama, email, telepon, alamat } = req.body;
    await db.query(
      'UPDATE supplier SET nama = ?, email = ?, telepon = ?, alamat = ? WHERE id = ?',
      [nama, email, telepon, alamat, req.params.id]
    );
    res.json({ success: true, message: 'Supplier berhasil diupdate' });
  } catch (error) { next(error); }
};

const deleteSupplier = async (req, res, next) => {
  try {
    await db.query('DELETE FROM supplier WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Supplier berhasil dihapus' });
  } catch (error) { next(error); }
};

// ---- PELANGGAN ----
const getAllPelanggan = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM pelanggan';
    const params = [];
    if (search) {
      query += ' WHERE nama LIKE ? OR telepon LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY nama ASC';
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

const createPelanggan = async (req, res, next) => {
  try {
    const { nama, email, telepon, alamat } = req.body;
    if (!nama) return next(createError('Nama pelanggan wajib diisi', 400));
    const [result] = await db.query(
      'INSERT INTO pelanggan (nama, email, telepon, alamat) VALUES (?, ?, ?, ?)',
      [nama, email, telepon, alamat]
    );
    const [newPelanggan] = await db.query('SELECT * FROM pelanggan WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Pelanggan berhasil ditambahkan', data: newPelanggan[0] });
  } catch (error) { next(error); }
};

const updatePelanggan = async (req, res, next) => {
  try {
    const { nama, email, telepon, alamat } = req.body;
    await db.query(
      'UPDATE pelanggan SET nama = ?, email = ?, telepon = ?, alamat = ? WHERE id = ?',
      [nama, email, telepon, alamat, req.params.id]
    );
    res.json({ success: true, message: 'Pelanggan berhasil diupdate' });
  } catch (error) { next(error); }
};

const deletePelanggan = async (req, res, next) => {
  try {
    await db.query('DELETE FROM pelanggan WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Pelanggan berhasil dihapus' });
  } catch (error) { next(error); }
};

// ---- USERS (admin only) ----
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT id, nama, email, role, is_active, created_at FROM users ORDER BY nama ASC');
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

const createUser = async (req, res, next) => {
  try {
    const { nama, email, password, role } = req.body;
    if (!nama || !email || !password) return next(createError('Nama, email, dan password wajib diisi', 400));
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
      [nama, email, hashedPassword, role || 'kasir']
    );
    res.status(201).json({ success: true, message: 'User berhasil ditambahkan', data: { id: result.insertId, nama, email, role } });
  } catch (error) { next(error); }
};

const updateUser = async (req, res, next) => {
  try {
    const { nama, email, role, is_active } = req.body;
    await db.query(
      'UPDATE users SET nama = ?, email = ?, role = ?, is_active = ? WHERE id = ?',
      [nama, email, role, is_active, req.params.id]
    );
    res.json({ success: true, message: 'User berhasil diupdate' });
  } catch (error) { next(error); }
};

const deleteUser = async (req, res, next) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return next(createError('Tidak bisa menghapus akun sendiri', 400));
    }
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (error) { next(error); }
};

module.exports = {
  getAllKategori, createKategori, updateKategori, deleteKategori,
  getAllSupplier, createSupplier, updateSupplier, deleteSupplier,
  getAllPelanggan, createPelanggan, updatePelanggan, deletePelanggan,
  getAllUsers, createUser, updateUser, deleteUser,
};
