const express = require('express');
const router = express.Router();
const {
  getSyncData,
  saveOrder,
  getCustomerProfile,
  saveCustomerProfile,
  deleteCustomer,
  triggerSync,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/damacoController');

router.get('/sync', getSyncData);
router.post('/orders', saveOrder);
router.get('/profile', getCustomerProfile);
router.post('/profile', saveCustomerProfile);
router.delete('/customers/:id', deleteCustomer);
router.post('/sync-all', triggerSync);

// Product CRUD
router.get('/products', getAllProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;

