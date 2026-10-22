# Sistem Penjualan
> Web app Point of Sale dengan Node.js + React.js + MySQL

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js v18+
- MySQL server berjalan

### 1. Setup Database
Import file SQL ke MySQL:
```bash
mysql -u root -p < backend/database/schema.sql
```
Atau buka phpMyAdmin / MySQL Workbench, lalu jalankan isi file `backend/database/schema.sql`.

### 2. Konfigurasi Backend
Edit file `backend/.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password_mysql_kamu
DB_NAME=penjualan_db
JWT_SECRET=ganti_dengan_secret_panjang_random
```

### 3. Jalankan Backend
```bash
cd backend
npm run dev
# Backend berjalan di http://localhost:5000
```

### 4. Jalankan Frontend
Buka terminal baru:
```bash
cd frontend
npm run dev
# Frontend berjalan di http://localhost:5173
```

---

## 🔐 Akun Default
| Role  | Email                    | Password |
|-------|--------------------------|----------|
| Admin | admin@penjualan.com      | password |
| Kasir | kasir@penjualan.com      | password |

> ⚠️ **Ganti password setelah pertama login!**

---

## 📁 Struktur Folder
```
Penjualan/
├── backend/
│   ├── config/          # Database & JWT config
│   ├── controllers/     # Logic bisnis API
│   ├── database/        # SQL schema
│   ├── middleware/      # Auth & error handler
│   ├── routes/          # API routes
│   ├── .env             # Konfigurasi (edit ini!)
│   └── server.js        # Entry point backend
│
└── frontend/
    ├── src/
    │   ├── components/  # Layout & shared components
    │   ├── context/     # React context (Auth)
    │   ├── pages/       # Halaman-halaman app
    │   ├── services/    # API service functions
    │   └── utils/       # Helper functions
    └── .env             # VITE_API_URL
```

## 📡 API Endpoints
| Method | Endpoint                    | Deskripsi            |
|--------|-----------------------------|----------------------|
| POST   | /api/auth/login             | Login                |
| GET    | /api/auth/me                | Info user login      |
| GET    | /api/produk                 | List produk          |
| POST   | /api/produk                 | Tambah produk        |
| PUT    | /api/produk/:id             | Update produk        |
| DELETE | /api/produk/:id             | Hapus produk         |
| GET    | /api/penjualan/dashboard    | Statistik dashboard  |
| GET    | /api/penjualan              | List transaksi       |
| POST   | /api/penjualan              | Buat transaksi baru  |
| GET    | /api/master/kategori        | List kategori        |
| GET    | /api/master/supplier        | List supplier        |
| GET    | /api/master/pelanggan       | List pelanggan       |
| GET    | /api/master/users           | List users (admin)   |

## 🛠️ Tech Stack
- **Backend**: Node.js, Express.js, MySQL2, JWT, Bcrypt
- **Frontend**: React.js (Vite), React Router v6, Axios, Recharts, React Icons
- **Database**: MySQL 8+