const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createPenawaran,
  getAllPenawaran,
  updateStatusPenawaran,
} = require('../controllers/penawaranController');

const router = express.Router();

router.post('/', authenticate, authorize('customer'), createPenawaran);
router.get('/', authenticate, authorize('super_admin'), getAllPenawaran);
router.put('/:id/status', authenticate, authorize('super_admin'), updateStatusPenawaran);

module.exports = router;
