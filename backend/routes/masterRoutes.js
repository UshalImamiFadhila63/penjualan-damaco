const express = require('express');
const router = express.Router();
const {
  getAllKategori, createKategori, updateKategori, deleteKategori,
  getAllSupplier, createSupplier, updateSupplier, deleteSupplier,
  getAllPelanggan, createPelanggan, updatePelanggan, deletePelanggan,
  getAllUsers, createUser, updateUser, deleteUser,
} = require('../controllers/masterController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('super_admin'));

// Kategori
router.get('/kategori', getAllKategori);
router.post('/kategori', createKategori);
router.put('/kategori/:id', updateKategori);
router.delete('/kategori/:id', deleteKategori);

// Supplier
router.get('/supplier', getAllSupplier);
router.post('/supplier', createSupplier);
router.put('/supplier/:id', updateSupplier);
router.delete('/supplier/:id', deleteSupplier);

// Pelanggan
router.get('/pelanggan', getAllPelanggan);
router.post('/pelanggan', createPelanggan);
router.put('/pelanggan/:id', updatePelanggan);
router.delete('/pelanggan/:id', deletePelanggan);

// Users (Admin Only)
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
