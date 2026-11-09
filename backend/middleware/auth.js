const { verifyToken } = require('../config/jwt');

const roleAliases = {
  super_admin: 'SUPERADMIN',
  SUPERADMIN: 'SUPERADMIN',
  customer: 'CUSTOMER',
  CUSTOMER: 'CUSTOMER',
};

// Middleware: Verifikasi Token JWT
const createAuthenticate = (pool) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token tidak ditemukan.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Ambil data user terbaru dari database
    const db = pool || require('../config/database');
    const [rows] = await db.query(
      'SELECT id, nama, email, role, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0 || !rows[0].is_active) {
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan atau tidak aktif.',
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error.name)) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau sudah kadaluarsa.',
      });
    }
    return next(error);
  }
};

const authenticate = createAuthenticate();

// Middleware: Cek Role
const requireRole = (...roles) => {
  const permitted = new Set(roles.map((role) => roleAliases[role] || role));
  return (req, res, next) => {
    if (!req.user || !permitted.has(roleAliases[req.user.role] || req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Hanya role ${roles.join(', ')} yang diizinkan.`,
      });
    }
    next();
  };
};

module.exports = { authenticate, createAuthenticate, authorize: requireRole, requireRole };
