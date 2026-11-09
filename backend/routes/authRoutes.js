const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { rateLimit } = require('express-rate-limit');
const { generateToken } = require('../config/jwt');
const { createAuthenticate, requireRole } = require('../middleware/auth');

const registerSchema = z.object({
  nama: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(100),
  telepon: z.string().trim().max(30).optional().nullable(),
  password: z.string().min(8).max(128),
});
const loginSchema = z.object({
  email: z.string().trim().email().max(100),
  password: z.string().min(1).max(128),
});

const createAuthRouter = (db) => {
  const router = express.Router();
  const authenticate = createAuthenticate(db);
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { success: false, message: 'Terlalu banyak percobaan. Coba lagi nanti.' },
  });

  router.post('/register', authLimiter, async (req, res, next) => {
    let connection;
    try {
      const values = registerSchema.parse(req.body);
      const email = values.email.toLowerCase();
      connection = await db.getConnection();
      await connection.beginTransaction();
      const [result] = await connection.execute(
        'INSERT INTO users (nama, email, telepon, password, role) VALUES (?, ?, ?, ?, ?)',
        [values.nama, email, values.telepon || null, await bcrypt.hash(values.password, 12), 'customer']
      );
      await connection.execute(
        'INSERT INTO customer_profiles (user_id, phone) VALUES (?, ?)',
        [result.insertId, values.telepon || null]
      );
      await connection.commit();
      const user = { id: result.insertId, nama: values.nama, email, role: 'customer' };
      return res.status(201).json({
        success: true,
        data: { user, token: generateToken(user) },
      });
    } catch (error) {
      if (connection) await connection.rollback();
      return next(error);
    } finally {
      if (connection) connection.release();
    }
  });

  router.post('/login', authLimiter, async (req, res, next) => {
    try {
      const values = loginSchema.parse(req.body);
      const [rows] = await db.execute(
        'SELECT id, nama, email, password, role, is_active FROM users WHERE email = ? LIMIT 1',
        [values.email.toLowerCase()]
      );
      const user = rows[0];
      if (!user || !user.is_active || !(await bcrypt.compare(values.password, user.password))) {
        return res.status(401).json({ success: false, message: 'Email atau password salah.' });
      }
      const publicUser = { id: user.id, nama: user.nama, email: user.email, role: user.role };
      return res.json({ success: true, data: { user: publicUser, token: generateToken(publicUser) } });
    } catch (error) {
      return next(error);
    }
  });

  router.get('/me', authenticate, (req, res) => {
    res.json({ success: true, data: req.user });
  });

  router.get('/profile', authenticate, requireRole('CUSTOMER'), async (req, res, next) => {
    try {
      const [rows] = await db.execute(
        `SELECT u.id, u.nama, u.email, cp.company_name, cp.phone, cp.billing_address,
                cp.shipping_address, cp.tax_id
         FROM users u LEFT JOIN customer_profiles cp ON cp.user_id = u.id WHERE u.id = ?`,
        [req.user.id]
      );
      return res.json({ success: true, data: rows[0] || null });
    } catch (error) {
      return next(error);
    }
  });

  return router;
};

module.exports = createAuthRouter;
