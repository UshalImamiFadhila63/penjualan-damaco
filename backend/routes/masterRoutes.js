const express = require('express');
const router = express.Router();
const {
  getAllKategori, createKategori, updateKategori, deleteKategori,
  getAllSupplier, createSupplier, updateSupplier, deleteSupplier,
  getAllPelanggan, createPelanggan, updatePelanggan, deletePelanggan,
  getAllUsers, createUser, updateUser, deleteUser,
} = require('../controllers/masterController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Kategori
router.get('/kategori', getAllKategori);
router.post('/kategori', authorize('admin'), createKategori);
router.put('/kategori/:id', authorize('admin'), updateKategori);
router.delete('/kategori/:id', authorize('admin'), deleteKategori);

// Supplier
router.get('/supplier', getAllSupplier);
router.post('/supplier', authorize('admin'), createSupplier);
router.put('/supplier/:id', authorize('admin'), updateSupplier);
router.delete('/supplier/:id', authorize('admin'), deleteSupplier);

// Pelanggan
router.get('/pelanggan', getAllPelanggan);
router.post('/pelanggan', createPelanggan);
router.put('/pelanggan/:id', updatePelanggan);
router.delete('/pelanggan/:id', authorize('admin'), deletePelanggan);

// Users (Admin Only)
router.get('/users', authorize('admin'), getAllUsers);
router.post('/users', authorize('admin'), createUser);
router.put('/users/:id', authorize('admin'), updateUser);
router.delete('/users/:id', authorize('admin'), deleteUser);

module.exports = router;
