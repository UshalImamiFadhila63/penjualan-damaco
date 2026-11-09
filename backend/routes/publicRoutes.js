const express = require('express');
const { getCatalog } = require('../controllers/publicController');

const router = express.Router();

router.get('/produk', getCatalog);

module.exports = router;
