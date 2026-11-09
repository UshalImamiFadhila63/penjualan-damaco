const express = require('express');
const router = express.Router();
const {
  getAllPenjualan, getPenjualanById, createPenjualan,
  updateStatusPenjualan, getDashboard,
} = require('../controllers/penjualanController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('super_admin'));

router.get('/dashboard', getDashboard);
router.get('/', getAllPenjualan);
router.get('/:id', getPenjualanById);
router.post('/', createPenjualan);
router.put('/:id/status', updateStatusPenjualan);

module.exports = router;
