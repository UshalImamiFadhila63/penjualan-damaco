const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config({ quiet: true });

const { errorHandler } = require('./middleware/errorHandler');

const db = require('./config/database');
const createAuthRouter = require('./routes/authRoutes');
const { createCoreRouter } = require('./routes/coreRoutes');

const PORT = process.env.PORT || 5000;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const allowedOrigins = new Set([corsOrigin]);
const corsOriginUrl = new URL(corsOrigin);

if (corsOriginUrl.hostname === 'localhost' || corsOriginUrl.hostname === '127.0.0.1') {
  corsOriginUrl.hostname = corsOriginUrl.hostname === 'localhost' ? '127.0.0.1' : 'localhost';
  allowedOrigins.add(corsOriginUrl.origin);
}

// ── Security & Middleware ──────────────────────────────────
const createApp = (database = db) => {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: [...allowedOrigins], credentials: true }));
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static('uploads'));

  app.use('/api/auth', createAuthRouter(database));
  app.use('/api', createCoreRouter(database));
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'Server berjalan dengan baik! 🚀',
      timestamp: new Date().toISOString(),
    });
  });

  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} tidak ditemukan` });
  });
  app.use(errorHandler);
  return app;
};

const app = createApp();

if (require.main === module) {
  db.testConnection().then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 Server berjalan di http://localhost:${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api\n`);
    });
  }).catch((error) => {
    console.error('❌ Koneksi MySQL gagal:', error.message);
    process.exitCode = 1;
  });
}

module.exports = app;
module.exports.createApp = createApp;
