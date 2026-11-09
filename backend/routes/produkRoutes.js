const express = require('express');
const router = express.Router();
const {
  getAllProduk, getProdukById, createProduk, updateProduk, deleteProduk,
} = require('../controllers/produkController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('super_admin'));

router.get('/', getAllProduk);
router.get('/:id', getProdukById);
router.post('/', createProduk);
router.put('/:id', updateProduk);
router.delete('/:id', deleteProduk);

module.exports = router;
