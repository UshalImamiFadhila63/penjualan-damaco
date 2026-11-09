const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { createAuthenticate, requireRole } = require('../middleware/auth');
const { nextDocumentNumber } = require('../services/documentNumber');
const { transitionPurchaseOrderStatus } = require('../services/purchaseOrderStatus');
const { createError } = require('../middleware/errorHandler');

const idSchema = z.coerce.number().int().positive();
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional(),
  category: z.string().trim().max(100).optional(),
});
const productSchema = z.object({
  sku: z.string().trim().min(1).max(60),
  name: z.string().trim().min(1).max(200),
  description: z.string().max(10000).optional().nullable(),
  category: z.string().trim().min(1).max(100),
  unit: z.string().trim().min(1).max(30).optional(),
  buy_price: z.coerce.number().min(0),
  sell_price: z.coerce.number().min(0),
  image_url: z.string().max(500).optional().nullable(),
  is_active: z.coerce.boolean().optional(),
});
const dealerSchema = z.object({
  code: z.string().trim().min(1).max(40),
  name: z.string().trim().min(1).max(180),
  email: z.string().trim().email().max(180).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  address: z.string().max(10000).optional().nullable(),
  is_active: z.coerce.boolean().optional(),
});
const settingsSchema = z.object({
  company_name: z.string().trim().min(1).max(180),
  company_code: z.string().trim().min(1).max(30),
  email: z.string().trim().email().max(180).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  address: z.string().max(10000).optional().nullable(),
  tax_id: z.string().trim().max(50).optional().nullable(),
});

const parse = (schema, value) => schema.parse(value);
const sendError = (next, error) => next(error);
const publicProduct = (row) => ({
  id: row.id,
  sku: row.sku,
  name: row.name,
  description: row.description,
  category: row.category,
  unit: row.unit,
  sell_price: row.sell_price,
  image_url: row.image_url,
});
const requestItemsSchema = z.array(z.object({
  product_id: idSchema,
  quantity: z.coerce.number().positive().max(100000),
})).min(1).max(50).superRefine((items, context) => {
  const ids = new Set();
  items.forEach((item, index) => {
    if (ids.has(item.product_id)) {
      context.addIssue({ code: 'custom', path: [index, 'product_id'], message: 'Product may only appear once.' });
    }
    ids.add(item.product_id);
  });
});
const groupDocumentRows = (rows, itemFields) => {
  const documents = new Map();
  for (const row of rows) {
    if (!documents.has(row.id)) {
      const document = { ...row };
      for (const field of itemFields) delete document[field];
      document.items = [];
      documents.set(row.id, document);
    }
    if (row.product_id !== null && row.product_id !== undefined) {
      const item = {};
      for (const field of itemFields) item[field] = row[field];
      documents.get(row.id).items.push(item);
    }
  }
  return [...documents.values()];
};

function createCoreRouter(db) {
  const router = express.Router();
  const authenticate = createAuthenticate(db);
  const admin = [authenticate, requireRole('SUPERADMIN')];
  const customer = [authenticate, requireRole('CUSTOMER')];

  router.get('/products/categories', async (req, res, next) => {
    try {
      const [rows] = await db.execute('SELECT DISTINCT category FROM products WHERE is_active = 1 ORDER BY category');
      return res.json({ success: true, data: rows.map((row) => row.category) });
    } catch (error) { return sendError(next, error); }
  });
  router.get('/products', async (req, res, next) => {
    try {
      const { page, limit, search, category } = parse(paginationSchema, req.query);
      const filters = ['is_active = 1'];
      const params = [];
      if (search) {
        filters.push('(name LIKE ? OR sku LIKE ? OR description LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      if (category) {
        filters.push('category = ?');
        params.push(category);
      }
      const where = filters.join(' AND ');
      const [rows] = await db.execute(
        `SELECT id, sku, name, description, category, unit, sell_price, image_url
         FROM products WHERE ${where} ORDER BY name LIMIT ? OFFSET ?`,
        [...params, limit, (page - 1) * limit]
      );
      const [countRows] = await db.execute(`SELECT COUNT(*) AS total FROM products WHERE ${where}`, params);
      return res.json({
        success: true,
        data: rows.map(publicProduct),
        pagination: { page, limit, total: Number(countRows[0].total), totalPages: Math.ceil(Number(countRows[0].total) / limit) },
      });
    } catch (error) { return sendError(next, error); }
  });
  router.get('/products/:id', async (req, res, next) => {
    try {
      const id = parse(idSchema, req.params.id);
      const [rows] = await db.execute(
        `SELECT id, sku, name, description, category, unit, sell_price, image_url
         FROM products WHERE id = ? AND is_active = 1`,
        [id]
      );
      if (!rows.length) return res.status(404).json({ success: false, message: 'Product not found.' });
      return res.json({ success: true, data: publicProduct(rows[0]) });
    } catch (error) { return sendError(next, error); }
  });

  router.get('/customer/profile', ...customer, async (req, res, next) => {
    try {
      const [rows] = await db.execute(
        `SELECT u.id, u.nama AS name, u.email, cp.company_name, cp.phone, cp.billing_address,
                cp.shipping_address, cp.tax_id
         FROM users u LEFT JOIN customer_profiles cp ON cp.user_id = u.id WHERE u.id = ?`,
        [req.user.id]
      );
      return res.json({ success: true, data: rows[0] || null });
    } catch (error) { return sendError(next, error); }
  });
  router.put('/customer/profile', ...customer, async (req, res, next) => {
    const profileSchema = z.object({
      name: z.string().trim().min(1).max(100).optional(),
      email: z.string().trim().email().max(100).optional(),
      phone: z.string().trim().max(30).nullable().optional(),
      company_name: z.string().trim().max(180).nullable().optional(),
      billing_address: z.string().max(10000).nullable().optional(),
      shipping_address: z.string().max(10000).nullable().optional(),
      tax_id: z.string().trim().max(50).nullable().optional(),
    });
    let connection;
    try {
      const values = profileSchema.parse(req.body);
      if (!Object.keys(values).length) {
        return res.status(400).json({ success: false, message: 'No fields supplied.' });
      }
      connection = await db.getConnection();
      await connection.beginTransaction();
      if (values.name !== undefined || values.email !== undefined || values.phone !== undefined) {
        const userValues = [];
        if (values.name !== undefined) userValues.push(['nama', values.name]);
        if (values.email !== undefined) userValues.push(['email', values.email.toLowerCase()]);
        if (values.phone !== undefined) userValues.push(['telepon', values.phone]);
        await connection.execute(
          `UPDATE users SET ${userValues.map(([column]) => `${column} = ?`).join(', ')} WHERE id = ?`,
          [...userValues.map(([, value]) => value), req.user.id]
        );
      }
      await connection.execute(
        'INSERT IGNORE INTO customer_profiles (user_id) VALUES (?)',
        [req.user.id]
      );
      const profileValues = ['phone', 'company_name', 'billing_address', 'shipping_address', 'tax_id']
        .filter((field) => Object.hasOwn(values, field));
      if (profileValues.length) {
        await connection.execute(
          `UPDATE customer_profiles SET ${profileValues.map((field) => `${field} = ?`).join(', ')} WHERE user_id = ?`,
          [...profileValues.map((field) => values[field]), req.user.id]
        );
      }
      await connection.commit();
      return res.json({ success: true, message: 'Customer profile updated.' });
    } catch (error) {
      if (connection) await connection.rollback();
      return sendError(next, error);
    } finally {
      if (connection) connection.release();
    }
  });
  router.post('/customer/quotation-requests', ...customer, async (req, res, next) => {
    let connection;
    try {
      const values = z.object({
        items: requestItemsSchema,
        notes: z.string().trim().max(5000).optional().nullable(),
      }).parse(req.body);
      const [settings] = await db.execute('SELECT company_code FROM company_settings WHERE id = 1');
      const requestNumber = await nextDocumentNumber(db, {
        documentType: 'QUOTATION_REQUEST',
        prefix: 'QR',
        companyCode: settings[0]?.company_code || 'DMC-PNY',
      });
      connection = await db.getConnection();
      await connection.beginTransaction();
      const productIds = values.items.map((item) => item.product_id);
      const [products] = await connection.execute(
        `SELECT id FROM products WHERE is_active = 1 AND id IN (${productIds.map(() => '?').join(',')})`,
        productIds
      );
      if (products.length !== productIds.length) {
        throw createError('Satu atau lebih produk tidak tersedia.', 400);
      }
      const [result] = await connection.execute(
        `INSERT INTO quotation_requests (request_number, customer_id, notes)
         VALUES (?, ?, ?)`,
        [requestNumber, req.user.id, values.notes || null]
      );
      for (const item of values.items) {
        await connection.execute(
          `INSERT INTO quotation_request_items (quotation_request_id, product_id, quantity)
           VALUES (?, ?, ?)`,
          [result.insertId, item.product_id, item.quantity]
        );
      }
      await connection.commit();
      return res.status(201).json({
        success: true,
        message: 'Permintaan penawaran berhasil dikirim.',
        data: { id: result.insertId, request_number: requestNumber, status: 'SUBMITTED' },
      });
    } catch (error) {
      if (connection) await connection.rollback();
      return sendError(next, error);
    } finally {
      if (connection) connection.release();
    }
  });
  router.get('/customer/quotation-requests', ...customer, async (req, res, next) => {
    try {
      const [rows] = await db.execute(
        `SELECT qr.id, qr.request_number, qr.notes, qr.status, qr.created_at,
                qri.product_id, p.name AS product_name, qri.quantity
         FROM quotation_requests qr
         LEFT JOIN quotation_request_items qri ON qri.quotation_request_id = qr.id
         LEFT JOIN products p ON p.id = qri.product_id
         WHERE qr.customer_id = ?
         ORDER BY qr.created_at DESC, qri.id`,
        [req.user.id]
      );
      return res.json({ success: true, data: groupDocumentRows(rows, ['product_id', 'product_name', 'quantity']) });
    } catch (error) { return sendError(next, error); }
  });
  router.get('/customer/offers', ...customer, async (req, res, next) => {
    try {
      const [rows] = await db.execute(
        `SELECT o.id, o.offer_number, o.quotation_request_id, o.status, o.valid_until, o.notes, o.created_at,
                oi.product_id, p.name AS product_name, oi.description, oi.quantity, oi.unit_price
         FROM offers o
         LEFT JOIN offer_items oi ON oi.offer_id = o.id
         LEFT JOIN products p ON p.id = oi.product_id
         WHERE o.customer_id = ?
         ORDER BY o.created_at DESC, oi.id`,
        [req.user.id]
      );
      return res.json({ success: true, data: groupDocumentRows(rows, [
        'product_id', 'product_name', 'description', 'quantity', 'unit_price',
      ]) });
    } catch (error) { return sendError(next, error); }
  });
  router.post('/customer/offers/:id/respond', ...customer, async (req, res, next) => {
    try {
      const offerId = parse(idSchema, req.params.id);
      const { status } = z.object({ status: z.enum(['ACCEPTED', 'REJECTED']) }).parse(req.body);
      const [result] = await db.execute(
        `UPDATE offers SET status = ?
         WHERE id = ? AND customer_id = ? AND status = 'SENT'`,
        [status, offerId, req.user.id]
      );
      if (!result.affectedRows) {
        const [rows] = await db.execute('SELECT id FROM offers WHERE id = ? AND customer_id = ?', [offerId, req.user.id]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'Offer not found.' });
        return res.status(409).json({ success: false, message: 'Offer is no longer awaiting a response.' });
      }
      return res.json({ success: true, message: `Offer ${status.toLowerCase()}.` });
    } catch (error) { return sendError(next, error); }
  });
  router.all('/customer/*path', ...customer, (req, res) => res.status(501).json({
    success: false,
    message: 'This customer transaction endpoint is not implemented yet.',
  }));

  router.get('/admin/products', ...admin, async (req, res, next) => {
    try {
      const { page, limit, search, category } = parse(paginationSchema, req.query);
      const filters = ['1 = 1'];
      const params = [];
      if (search) {
        filters.push('(name LIKE ? OR sku LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
      }
      if (category) { filters.push('category = ?'); params.push(category); }
      const where = filters.join(' AND ');
      const [rows] = await db.execute(
        `SELECT * FROM products WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, (page - 1) * limit]
      );
      const [counts] = await db.execute(`SELECT COUNT(*) AS total FROM products WHERE ${where}`, params);
      return res.json({ success: true, data: rows, pagination: { page, limit, total: Number(counts[0].total) } });
    } catch (error) { return sendError(next, error); }
  });
  router.post('/admin/products', ...admin, async (req, res, next) => {
    try {
      const values = productSchema.parse(req.body);
      const [result] = await db.execute(
        `INSERT INTO products (sku, name, description, category, unit, buy_price, sell_price, image_url, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [values.sku, values.name, values.description || null, values.category, values.unit || 'unit',
          values.buy_price, values.sell_price, values.image_url || null, values.is_active === false ? 0 : 1]
      );
      const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [result.insertId]);
      return res.status(201).json({ success: true, data: rows[0] });
    } catch (error) { return sendError(next, error); }
  });
  router.put('/admin/products/:id', ...admin, async (req, res, next) => {
    try {
      const id = parse(idSchema, req.params.id);
      const values = productSchema.partial().parse(req.body);
      if (!Object.keys(values).length) return res.status(400).json({ success: false, message: 'No fields supplied.' });
      const [existing] = await db.execute('SELECT id FROM products WHERE id = ?', [id]);
      if (!existing.length) return res.status(404).json({ success: false, message: 'Product not found.' });
      const columns = Object.keys(values);
      await db.execute(
        `UPDATE products SET ${columns.map((column) => `${column} = ?`).join(', ')} WHERE id = ?`,
        [...columns.map((column) => values[column]), id]
      );
      const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
      return res.json({ success: true, data: rows[0] });
    } catch (error) { return sendError(next, error); }
  });
  router.delete('/admin/products/:id', ...admin, async (req, res, next) => {
    try {
      const id = parse(idSchema, req.params.id);
      const [result] = await db.execute('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
      return result.affectedRows ? res.json({ success: true }) : res.status(404).json({ success: false, message: 'Product not found.' });
    } catch (error) { return sendError(next, error); }
  });

  router.get('/admin/dealers', ...admin, async (req, res, next) => {
    try {
      const [rows] = await db.execute('SELECT * FROM dealers ORDER BY name');
      return res.json({ success: true, data: rows });
    } catch (error) { return sendError(next, error); }
  });
  router.post('/admin/dealers', ...admin, async (req, res, next) => {
    try {
      const values = dealerSchema.parse(req.body);
      const [result] = await db.execute(
        'INSERT INTO dealers (code, name, email, phone, address, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        [values.code, values.name, values.email || null, values.phone || null, values.address || null, values.is_active === false ? 0 : 1]
      );
      const [rows] = await db.execute('SELECT * FROM dealers WHERE id = ?', [result.insertId]);
      return res.status(201).json({ success: true, data: rows[0] });
    } catch (error) { return sendError(next, error); }
  });
  router.put('/admin/dealers/:id', ...admin, async (req, res, next) => {
    try {
      const id = parse(idSchema, req.params.id);
      const values = dealerSchema.partial().parse(req.body);
      if (!Object.keys(values).length) return res.status(400).json({ success: false, message: 'No fields supplied.' });
      const columns = Object.keys(values);
      const [result] = await db.execute(
        `UPDATE dealers SET ${columns.map((column) => `${column} = ?`).join(', ')} WHERE id = ?`,
        [...columns.map((column) => values[column]), id]
      );
      if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Dealer not found.' });
      const [rows] = await db.execute('SELECT * FROM dealers WHERE id = ?', [id]);
      return res.json({ success: true, data: rows[0] });
    } catch (error) { return sendError(next, error); }
  });
  router.delete('/admin/dealers/:id', ...admin, async (req, res, next) => {
    try {
      const id = parse(idSchema, req.params.id);
      const [result] = await db.execute('UPDATE dealers SET is_active = 0 WHERE id = ?', [id]);
      return result.affectedRows ? res.json({ success: true }) : res.status(404).json({ success: false, message: 'Dealer not found.' });
    } catch (error) { return sendError(next, error); }
  });

  router.get('/admin/customers', ...admin, async (req, res, next) => {
    try {
      const search = typeof req.query.search === 'string' ? `%${req.query.search.trim()}%` : null;
      const [rows] = await db.execute(
        `SELECT u.id, u.nama AS name, u.email, u.telepon AS phone, u.is_active,
                cp.company_name, cp.billing_address, cp.shipping_address, u.created_at
         FROM users u LEFT JOIN customer_profiles cp ON cp.user_id = u.id
         WHERE u.role = 'customer' AND (? IS NULL OR u.nama LIKE ? OR u.email LIKE ?)
         ORDER BY u.nama`,
        [search, search, search]
      );
      return res.json({ success: true, data: rows });
    } catch (error) { return sendError(next, error); }
  });
  router.get('/admin/customers/:id', ...admin, async (req, res, next) => {
    try {
      const id = parse(idSchema, req.params.id);
      const [rows] = await db.execute(
        `SELECT u.id, u.nama AS name, u.email, u.telepon AS phone, u.is_active,
                cp.company_name, cp.billing_address, cp.shipping_address, cp.tax_id
         FROM users u LEFT JOIN customer_profiles cp ON cp.user_id = u.id
         WHERE u.id = ? AND u.role = 'customer'`,
        [id]
      );
      return rows.length ? res.json({ success: true, data: rows[0] }) : res.status(404).json({ success: false, message: 'Customer not found.' });
    } catch (error) { return sendError(next, error); }
  });
  router.post('/admin/customers', ...admin, async (req, res, next) => {
    let connection;
    try {
      const values = z.object({
        name: z.string().trim().min(1).max(100),
        email: z.string().trim().email().max(100),
        password: z.string().min(8).max(128),
        phone: z.string().trim().max(30).optional().nullable(),
        company_name: z.string().trim().max(180).optional().nullable(),
        billing_address: z.string().max(10000).optional().nullable(),
        shipping_address: z.string().max(10000).optional().nullable(),
        tax_id: z.string().trim().max(50).optional().nullable(),
      }).parse(req.body);
      connection = await db.getConnection();
      await connection.beginTransaction();
      const [result] = await connection.execute(
        `INSERT INTO users (nama, email, telepon, password, role)
         VALUES (?, ?, ?, ?, 'customer')`,
        [values.name, values.email.toLowerCase(), values.phone || null, await bcrypt.hash(values.password, 12)]
      );
      await connection.execute(
        `INSERT INTO customer_profiles
           (user_id, company_name, phone, billing_address, shipping_address, tax_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [result.insertId, values.company_name || null, values.phone || null,
          values.billing_address || null, values.shipping_address || null, values.tax_id || null]
      );
      await connection.commit();
      return res.status(201).json({
        success: true,
        data: { id: result.insertId, name: values.name, email: values.email.toLowerCase() },
      });
    } catch (error) {
      if (connection) await connection.rollback();
      return sendError(next, error);
    } finally {
      if (connection) connection.release();
    }
  });
  router.put('/admin/customers/:id', ...admin, async (req, res, next) => {
    try {
      const id = parse(idSchema, req.params.id);
      const values = z.object({
        name: z.string().trim().min(1).max(100).optional(),
        email: z.string().trim().email().max(100).optional(),
        phone: z.string().trim().max(30).nullable().optional(),
        company_name: z.string().trim().max(180).nullable().optional(),
        billing_address: z.string().max(10000).nullable().optional(),
        shipping_address: z.string().max(10000).nullable().optional(),
        tax_id: z.string().trim().max(50).nullable().optional(),
      }).parse(req.body);
      if (!Object.keys(values).length) return res.status(400).json({ success: false, message: 'No fields supplied.' });
      const [users] = await db.execute('SELECT id FROM users WHERE id = ? AND role = ?', [id, 'customer']);
      if (!users.length) return res.status(404).json({ success: false, message: 'Customer not found.' });
      const userFields = [];
      if (Object.hasOwn(values, 'name')) userFields.push(['nama', values.name]);
      if (Object.hasOwn(values, 'email')) userFields.push(['email', values.email.toLowerCase()]);
      if (Object.hasOwn(values, 'phone')) userFields.push(['telepon', values.phone]);
      if (userFields.length) {
        await db.execute(
          `UPDATE users SET ${userFields.map(([column]) => `${column} = ?`).join(', ')} WHERE id = ?`,
          [...userFields.map(([, value]) => value), id]
        );
      }
      await db.execute('INSERT IGNORE INTO customer_profiles (user_id) VALUES (?)', [id]);
      const profileFields = ['phone', 'company_name', 'billing_address', 'shipping_address', 'tax_id']
        .filter((field) => Object.hasOwn(values, field));
      if (profileFields.length) {
        await db.execute(
          `UPDATE customer_profiles SET ${profileFields.map((field) => `${field} = ?`).join(', ')} WHERE user_id = ?`,
          [...profileFields.map((field) => values[field]), id]
        );
      }
      return res.json({ success: true });
    } catch (error) { return sendError(next, error); }
  });
  router.delete('/admin/customers/:id', ...admin, async (req, res, next) => {
    try {
      const id = parse(idSchema, req.params.id);
      const [result] = await db.execute(
        "UPDATE users SET is_active = 0 WHERE id = ? AND role = 'customer'",
        [id]
      );
      return result.affectedRows
        ? res.json({ success: true })
        : res.status(404).json({ success: false, message: 'Customer not found.' });
    } catch (error) { return sendError(next, error); }
  });

  router.get('/admin/company-settings', ...admin, async (req, res, next) => {
    try {
      const [rows] = await db.execute('SELECT * FROM company_settings WHERE id = 1');
      return res.json({ success: true, data: rows[0] || null });
    } catch (error) { return sendError(next, error); }
  });
  router.put('/admin/company-settings', ...admin, async (req, res, next) => {
    try {
      const values = settingsSchema.parse(req.body);
      await db.execute(
        `INSERT INTO company_settings (id, company_name, company_code, email, phone, address, tax_id)
         VALUES (1, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE company_name = VALUES(company_name), company_code = VALUES(company_code),
           email = VALUES(email), phone = VALUES(phone), address = VALUES(address), tax_id = VALUES(tax_id)`,
        [values.company_name, values.company_code, values.email || null, values.phone || null, values.address || null, values.tax_id || null]
      );
      const [rows] = await db.execute('SELECT * FROM company_settings WHERE id = 1');
      return res.json({ success: true, data: rows[0] });
    } catch (error) { return sendError(next, error); }
  });

  router.get('/admin/quotation-requests', ...admin, async (req, res, next) => {
    try {
      const [rows] = await db.execute(
        `SELECT qr.id, qr.request_number, qr.customer_id, qr.notes, qr.status, qr.created_at,
                u.nama AS customer_name, u.email AS customer_email,
                qri.product_id, p.name AS product_name, qri.quantity
         FROM quotation_requests qr
         JOIN users u ON u.id = qr.customer_id
         LEFT JOIN quotation_request_items qri ON qri.quotation_request_id = qr.id
         LEFT JOIN products p ON p.id = qri.product_id
         ORDER BY qr.created_at DESC, qri.id`
      );
      return res.json({ success: true, data: groupDocumentRows(rows, [
        'product_id', 'product_name', 'quantity',
      ]) });
    } catch (error) { return sendError(next, error); }
  });
  router.post('/admin/offers', ...admin, async (req, res, next) => {
    let connection;
    try {
      const values = z.object({
        quotation_request_id: idSchema,
        valid_until: z.string().date().optional().nullable(),
        notes: z.string().trim().max(5000).optional().nullable(),
        items: z.array(z.object({
          product_id: idSchema,
          quantity: z.coerce.number().positive().max(100000),
          unit_price: z.coerce.number().min(0).max(9999999999999.99),
          description: z.string().trim().max(255).optional().nullable(),
        })).min(1).max(50).superRefine((items, context) => {
          const ids = new Set();
          items.forEach((item, index) => {
            if (ids.has(item.product_id)) {
              context.addIssue({ code: 'custom', path: [index, 'product_id'], message: 'Product may only appear once.' });
            }
            ids.add(item.product_id);
          });
        }),
      }).parse(req.body);
      const [settings] = await db.execute('SELECT company_code FROM company_settings WHERE id = 1');
      const offerNumber = await nextDocumentNumber(db, {
        documentType: 'OFFER',
        prefix: 'OFF',
        companyCode: settings[0]?.company_code || 'DMC-PNY',
      });
      connection = await db.getConnection();
      await connection.beginTransaction();
      const [requests] = await connection.execute(
        `SELECT id, customer_id, status FROM quotation_requests WHERE id = ? FOR UPDATE`,
        [values.quotation_request_id]
      );
      if (!requests.length) throw createError('Quotation request not found.', 404);
      if (requests[0].status !== 'SUBMITTED') {
        throw createError('This quotation request has already been processed.', 409);
      }
      const [requestedItems] = await connection.execute(
        `SELECT product_id, quantity FROM quotation_request_items WHERE quotation_request_id = ?`,
        [values.quotation_request_id]
      );
      const requestedByProduct = new Map(requestedItems.map((item) => [
        Number(item.product_id),
        Number(item.quantity),
      ]));
      if (values.items.some((item) => !requestedByProduct.has(item.product_id)
        || item.quantity > requestedByProduct.get(item.product_id))) {
        throw createError('Offer items must match the requested products and quantities.', 400);
      }
      const [result] = await connection.execute(
        `INSERT INTO offers
           (offer_number, quotation_request_id, customer_id, status, valid_until, notes)
         VALUES (?, ?, ?, 'SENT', ?, ?)`,
        [offerNumber, values.quotation_request_id, requests[0].customer_id, values.valid_until || null, values.notes || null]
      );
      for (const item of values.items) {
        await connection.execute(
          `INSERT INTO offer_items (offer_id, product_id, description, quantity, unit_price)
           VALUES (?, ?, ?, ?, ?)`,
          [result.insertId, item.product_id, item.description || null, item.quantity, item.unit_price]
        );
      }
      await connection.execute(
        `UPDATE quotation_requests SET status = 'OFFERED' WHERE id = ?`,
        [values.quotation_request_id]
      );
      await connection.commit();
      return res.status(201).json({
        success: true,
        data: { id: result.insertId, offer_number: offerNumber, customer_id: requests[0].customer_id, status: 'SENT' },
      });
    } catch (error) {
      if (connection) await connection.rollback();
      return sendError(next, error);
    } finally {
      if (connection) connection.release();
    }
  });
  router.get('/admin/offers', ...admin, async (req, res, next) => {
    try {
      const [rows] = await db.execute(
        `SELECT o.id, o.offer_number, o.quotation_request_id, o.customer_id, o.status,
                o.valid_until, o.notes, o.created_at, u.nama AS customer_name, u.email AS customer_email,
                oi.product_id, p.name AS product_name, oi.description, oi.quantity, oi.unit_price
         FROM offers o
         JOIN users u ON u.id = o.customer_id
         LEFT JOIN offer_items oi ON oi.offer_id = o.id
         LEFT JOIN products p ON p.id = oi.product_id
         ORDER BY o.created_at DESC, oi.id`
      );
      return res.json({ success: true, data: groupDocumentRows(rows, [
        'product_id', 'product_name', 'description', 'quantity', 'unit_price',
      ]) });
    } catch (error) { return sendError(next, error); }
  });
  router.get('/admin/purchase-orders', ...admin, async (req, res, next) => {
    try {
      const [rows] = await db.execute(
        `SELECT po.id, po.po_number, po.quotation_id, po.dealer_id, po.customer_id,
                po.status, po.total_amount, po.notes, po.created_at,
                d.name AS dealer_name, u.nama AS customer_name,
                poi.product_id, p.name AS product_name, poi.quantity, poi.unit_price
         FROM purchase_orders po
         JOIN dealers d ON d.id = po.dealer_id
         LEFT JOIN users u ON u.id = po.customer_id
         LEFT JOIN purchase_order_items poi ON poi.purchase_order_id = po.id
         LEFT JOIN products p ON p.id = poi.product_id
         ORDER BY po.created_at DESC, poi.id`
      );
      return res.json({ success: true, data: groupDocumentRows(rows, [
        'product_id', 'product_name', 'quantity', 'unit_price',
      ]) });
    } catch (error) { return sendError(next, error); }
  });
  router.post('/admin/purchase-orders', ...admin, async (req, res, next) => {
    let connection;
    try {
      const values = z.object({
        dealer_id: idSchema,
        quotation_id: idSchema.nullable().optional(),
        customer_id: idSchema.nullable().optional(),
        notes: z.string().trim().max(5000).optional().nullable(),
        items: z.array(z.object({
          product_id: idSchema,
          quantity: z.coerce.number().positive().max(100000),
          unit_price: z.coerce.number().min(0).max(9999999999999.99),
        })).min(1).max(100).optional(),
      }).parse(req.body);
      const [settings] = await db.execute('SELECT company_code FROM company_settings WHERE id = 1');
      const poNumber = await nextDocumentNumber(db, {
        documentType: 'PURCHASE_ORDER',
        prefix: 'PO',
        companyCode: settings[0]?.company_code || 'DMC-PNY',
      });
      connection = await db.getConnection();
      await connection.beginTransaction();
      const [dealers] = await connection.execute(
        'SELECT id FROM dealers WHERE id = ? AND is_active = 1',
        [values.dealer_id]
      );
      if (!dealers.length) throw createError('Active dealer not found.', 404);

      let customerId = values.customer_id || null;
      let items = values.items || [];
      if (values.quotation_id) {
        const [offers] = await connection.execute(
          `SELECT id, customer_id, status FROM offers WHERE id = ? FOR UPDATE`,
          [values.quotation_id]
        );
        if (!offers.length) throw createError('Offer not found.', 404);
        if (offers[0].status !== 'ACCEPTED') throw createError('Only accepted offers can become purchase orders.', 409);
        const [existingOrders] = await connection.execute(
          'SELECT id FROM purchase_orders WHERE quotation_id = ? LIMIT 1',
          [values.quotation_id]
        );
        if (existingOrders.length) throw createError('A purchase order already exists for this offer.', 409);
        const [offerItems] = await connection.execute(
          `SELECT product_id, quantity, unit_price FROM offer_items WHERE offer_id = ?`,
          [values.quotation_id]
        );
        if (!offerItems.length) throw createError('Accepted offer has no items.', 400);
        customerId = offers[0].customer_id;
        items = offerItems.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
        }));
      } else if (!items.length) {
        throw createError('Provide purchase-order items or an accepted offer.', 400);
      }

      if (customerId) {
        const [customers] = await connection.execute(
          "SELECT id FROM users WHERE id = ? AND role = 'customer'",
          [customerId]
        );
        if (!customers.length) throw createError('Customer not found.', 404);
      }
      const productIds = items.map((item) => item.product_id);
      const [products] = await connection.execute(
        `SELECT id FROM products WHERE is_active = 1 AND id IN (${productIds.map(() => '?').join(',')})`,
        productIds
      );
      if (products.length !== new Set(productIds).size) throw createError('A product is unavailable.', 400);
      const totalAmount = items.reduce((total, item) => total + item.quantity * item.unit_price, 0);
      const [result] = await connection.execute(
        `INSERT INTO purchase_orders
           (po_number, quotation_id, dealer_id, customer_id, status, total_amount, notes)
         VALUES (?, ?, ?, ?, 'PO_RECEIVED', ?, ?)`,
        [poNumber, values.quotation_id || null, values.dealer_id, customerId, totalAmount.toFixed(2), values.notes || null]
      );
      for (const item of items) {
        await connection.execute(
          `INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price)
           VALUES (?, ?, ?, ?)`,
          [result.insertId, item.product_id, item.quantity, item.unit_price]
        );
      }
      await connection.execute(
        `INSERT INTO status_histories
           (entity_type, entity_id, from_status, to_status, changed_by, notes)
         VALUES ('PURCHASE_ORDER', ?, NULL, 'PO_RECEIVED', ?, ?)`,
        [result.insertId, req.user.id, values.notes || null]
      );
      await connection.commit();
      return res.status(201).json({
        success: true,
        data: { id: result.insertId, po_number: poNumber, status: 'PO_RECEIVED', total_amount: totalAmount.toFixed(2) },
      });
    } catch (error) {
      if (connection) await connection.rollback();
      return sendError(next, error);
    } finally {
      if (connection) connection.release();
    }
  });

  router.post('/admin/purchase-orders/:id/status', ...admin, async (req, res, next) => {
    try {
      const purchaseOrderId = parse(idSchema, req.params.id);
      const input = z.object({
        status: z.enum(['PO_RECEIVED', 'DEALER_VERIFIED', 'AWAITING_PAYMENT', 'PAID', 'SHIPPED', 'RECEIVED', 'COMPLETED']),
        notes: z.string().max(2000).optional().nullable(),
      }).parse(req.body);
      const data = await transitionPurchaseOrderStatus(db, {
        purchaseOrderId,
        toStatus: input.status,
        changedBy: req.user.id,
        notes: input.notes || null,
      });
      return res.json({ success: true, data });
    } catch (error) { return sendError(next, error); }
  });

  const notImplemented = (req, res) => res.status(501).json({
    success: false,
    message: 'This transaction endpoint is not implemented yet.',
  });
  for (const path of [
    '/admin/dealer-quotations',
    '/admin/invoices',
    '/admin/receipts',
    '/admin/tax-invoices',
  ]) {
    router.all(path, ...admin, notImplemented);
  }
  router.all('/admin/*path', ...admin, notImplemented);

  return router;
}

module.exports = { createCoreRouter, publicProduct };
