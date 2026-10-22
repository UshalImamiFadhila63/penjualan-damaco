const express = require('express');
const router = express.Router();
const {
  getAllPenjualan, getPenjualanById, createPenjualan,
  updateStatusPenjualan, getDashboard,
} = require('../controllers/penjualanController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/dashboard', getDashboard);
router.get('/', getAllPenjualan);
router.get('/:id', getPenjualanById);
router.post('/', createPenjualan);
router.put('/:id/status', authorize('admin'), updateStatusPenjualan);

module.exports = router;
