# DAMACO

Simple product catalog and account management application for DAMACO. The
backend uses Express, MySQL, JWT, Zod, and bcrypt. The frontend uses React and
Vite.

## Requirements

- Node.js 20.19+ or 22.12+
- MySQL 8+

## Setup

1. Configure `backend/.env` with database access and a long random `JWT_SECRET`.
   Set `SUPERADMIN_NAME`, `SUPERADMIN_EMAIL`, and `SUPERADMIN_PASSWORD` for the
   initial admin account. The seed requires an admin password of at least 12
   characters.
2. Install dependencies:

   ```powershell
   cd backend
   npm install
   cd ..\frontend
   npm install
   ```

3. Set up the schema:
   - For a fresh database, import `backend/database/schema.sql`. It creates
     and selects `penjualan_db`; set `DB_NAME=penjualan_db` or change the
     database selection in that SQL file.
   - For an existing database with its `users` table, run:

     ```powershell
     cd backend
     npm run migrate
     ```

     The migration uses `CREATE TABLE IF NOT EXISTS` and a migration-version
     table. It does not drop or replace existing application data.
4. Seed the admin, company settings, three dealers, two inactive demo customers,
   and 24 generic drone products/accessories. This can be safely repeated:

   ```powershell
   npm run seed
   ```

5. Start the backend and frontend in separate terminals:

   ```powershell
   cd backend
   npm run dev
   ```

   ```powershell
   cd frontend
   npm run dev
   ```

   Open `http://localhost:5173`. Customer account access is at `/masuk` and
   `/daftar`; the admin workspace is at `/admin`.

## Roles and routes

- Public users can search and browse products without seeing purchase prices.
- `CUSTOMER` users can register/sign in, manage their profile, submit quotation
  requests from the catalog, review offers, and accept or reject an offer.
- `SUPERADMIN` users can manage products, dealers, customer accounts, company
  settings, quotation requests, offers, and purchase orders.
- Protected requests use a bearer JWT. Registration always creates a customer.
- The initial `SUPERADMIN` account is created or updated by the repeatable seed
  from `SUPERADMIN_NAME`, `SUPERADMIN_EMAIL`, and `SUPERADMIN_PASSWORD` in
  `backend/.env`. Use `npm run seed` after setting those values.
- PDF generation, file upload, dealer quotation processing, invoice/receipt/tax
  invoice creation, payment integration, shipping integrations, and
  notifications are not implemented; those endpoints respond with HTTP 501.

Public catalog endpoints:

- `GET /api/products?search=&category=&page=&limit=`
- `GET /api/products/categories`
- `GET /api/products/:id`

Authentication endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Customer endpoints require `CUSTOMER`: `/api/customer/profile`,
`/api/customer/quotation-requests`, `/api/customer/offers`, and
`/api/customer/offers/:id/respond`.
Admin endpoints require `SUPERADMIN`: `/api/admin/*`. Implemented transaction
routes include quotation-request listing, offer creation/listing, purchase-order
creation/listing, and purchase-order status advancement.

Purchase orders created from offers require the customer to have accepted the
offer. Orders can also be created without a quotation by supplying a dealer and
line items. Status advancement is admin-operated; it does not record or process
payments.

Document numbers are allocated under a row lock in `document_counters`.
Purchase-order status changes must advance one step at a time:
`PO_RECEIVED` → `DEALER_VERIFIED` → `AWAITING_PAYMENT` → `PAID` → `SHIPPED` →
`RECEIVED` → `COMPLETED`. Each accepted change is written to
`status_histories`.

## Validation

From `backend/`, run `npm test`. From `frontend/`, run `npm run build`.
