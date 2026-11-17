const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { generateToken } = require('../config/jwt');
const { createError } = require('../middleware/errorHandler');

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError('Email dan password wajib diisi', 400));
    }

    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? AND is_active = 1',
      [email]
    );

    if (rows.length === 0) {
      return next(createError('Email atau password salah', 401));
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(createError('Email atau password salah', 401));
    }

    const normalizedRole = user.role === 'super_admin' ? 'admin' : user.role;
    let perusahaan = '';
    if (normalizedRole === 'customer') {
      const [profiles] = await db.query('SELECT company_name FROM customer_profiles WHERE user_id = ?', [user.id]);
      if (profiles.length > 0) perusahaan = profiles[0].company_name || '';
    }

    const token = generateToken({ id: user.id, email: user.email, role: normalizedRole });

    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          telepon: user.telepon || '',
          perusahaan: perusahaan,
          role: normalizedRole,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register new customer
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { nama, email, password, telepon, perusahaan, company_name } = req.body;
    const nameToUse = nama || req.body.namaPic || 'Customer B2B';
    const compToUse = perusahaan || company_name || req.body.namaPerusahaan || '';

    if (!email || !password) {
      return next(createError('Email dan password wajib diisi', 400));
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return next(createError('Email sudah terdaftar. Silakan login.', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (nama, email, password, telepon, role, is_active) VALUES (?, ?, ?, ?, ?, 1)',
      [nameToUse, email, hashedPassword, telepon || null, 'customer']
    );

    const userId = result.insertId;
    if (compToUse) {
      await db.query(
        'INSERT INTO customer_profiles (user_id, company_name, phone) VALUES (?, ?, ?)',
        [userId, compToUse, telepon || null]
      );
    }

    const token = generateToken({ id: userId, email, role: 'customer' });

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: {
        token,
        user: {
          id: userId,
          nama: nameToUse,
          email,
          telepon: telepon || '',
          perusahaan: compToUse,
          role: 'customer',
        },
      },
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
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return next(createError('Password lama dan baru wajib diisi', 400));
    }

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

module.exports = { login, register, getMe, changePassword };
