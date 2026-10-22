const express = require('express');
const router = express.Router();
const {
  getAllProduk, getProdukById, createProduk, updateProduk, deleteProduk,
} = require('../controllers/produkController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getAllProduk);
router.get('/:id', getProdukById);
router.post('/', authorize('admin', 'gudang'), createProduk);
router.put('/:id', authorize('admin', 'gudang'), updateProduk);
router.delete('/:id', authorize('admin'), deleteProduk);

module.exports = router;
