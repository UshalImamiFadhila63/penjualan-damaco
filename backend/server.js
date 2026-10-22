const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const produkRoutes = require('./routes/produkRoutes');
const penjualanRoutes = require('./routes/penjualanRoutes');
const masterRoutes = require('./routes/masterRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const allowedOrigins = new Set([corsOrigin]);
const corsOriginUrl = new URL(corsOrigin);

if (corsOriginUrl.hostname === 'localhost' || corsOriginUrl.hostname === '127.0.0.1') {
  corsOriginUrl.hostname = corsOriginUrl.hostname === 'localhost' ? '127.0.0.1' : 'localhost';
  allowedOrigins.add(corsOriginUrl.origin);
}

// ── Security & Middleware ──────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [...allowedOrigins],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/produk', produkRoutes);
app.use('/api/penjualan', penjualanRoutes);
app.use('/api/master', masterRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server berjalan dengan baik! 🚀',
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} tidak ditemukan` });
});

// Global Error Handler
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api\n`);
});

module.exports = app;
