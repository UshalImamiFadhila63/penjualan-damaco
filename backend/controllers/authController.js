const bcrypt = require('bcryptjs');
const { z } = require('zod');
const db = require('../config/database');
const { generateToken } = require('../config/jwt');
const { createError } = require('../middleware/errorHandler');

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

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase();

    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? AND is_active = 1',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return next(createError('Email atau password salah', 401));
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(createError('Email atau password salah', 401));
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const registerCustomer = async (req, res, next) => {
  try {
    const { nama, email, telepon, password } = registerSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase();

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return next(createError('Email sudah terdaftar. Silakan gunakan email lain.', 409));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (nama, email, telepon, password, role) VALUES (?, ?, ?, ?, ?)',
      [nama, normalizedEmail, telepon || null, hashedPassword, 'customer']
    );

    await db.query(
      'INSERT INTO customer_profiles (user_id, phone) VALUES (?, ?)',
      [result.insertId, telepon || null]
    );
    const user = {
      id: result.insertId,
      nama,
      email: normalizedEmail,
      role: 'customer',
    };

    res.status(201).json({
      success: true,
      message: 'Akun berhasil dibuat',
      data: { user, token: generateToken(user) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const passwords = z.object({
      oldPassword: z.string().min(1).max(128),
      newPassword: z.string().min(8).max(128),
    }).parse(req.body);
    const { oldPassword, newPassword } = passwords;

    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const user = rows[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return next(createError('Password lama tidak sesuai', 400));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.json({ success: true, message: 'Password berhasil diubah' });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, registerCustomer, getMe, changePassword };