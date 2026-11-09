# DAMACO backend

## Database setup

The database schema includes the legacy POS tables and the quotation, dealer,
purchase-order, and document tables used by the new API.

For a new database named `penjualan_db`, run `database/schema.sql` (it creates
and selects that database). For an existing installation with the legacy
`users` table, run `npm run migrate`; the migration is versioned and safe to
rerun. If using a different database name, create/select the configured
database first and apply `database/migrations/20261022_02_core_commerce.sql`
there, or adjust the database selection in `schema.sql`. `npm run seed` is a
separate, repeatable operation and does not run automatically when the API
starts.
To insert only the generic product catalog without creating/updating an admin,
run `npm run seed:catalog`.

Configure the database using `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`,
and `DB_NAME`. Authentication also requires `JWT_SECRET` (use a long,
unpredictable value) and may use `JWT_EXPIRES_IN`.

Before seeding, configure all three super-admin variables:

```text
SUPERADMIN_NAME
SUPERADMIN_EMAIL
SUPERADMIN_PASSWORD
```

The seeder stores the password as a bcrypt hash and updates the same account
when run again. Use a password of at least 12 characters. Demo customer
accounts created by the seed are inactive and do not have usable passwords.

## API access

- `GET /api/products` and `GET /api/products/categories` are public. Search,
  category, `page`, and `limit` query parameters are supported. Product
  responses only expose sale/catalog fields and never `buy_price`.
- `/api/customer/*` requires a bearer token with role `customer`.
- `/api/admin/*` requires a bearer token with role `super_admin`.
- `POST /api/auth/register`, `POST /api/auth/login`, and `GET /api/auth/me`
  provide customer registration, authentication, and the current profile.
  Registration and login are rate limited and validate input with Zod.
- Admin product/dealer CRUD, customer read/edit, company settings, and
  sequential purchase-order status updates are implemented.
- Customers can submit and review quotation requests, review offers, and accept
  or reject offers. Admins can review requests, send priced offers, and create
  purchase orders from accepted offers or supplied line items.
- Dealer quotation processing, invoices, receipts, tax invoices, PDF generation,
  file uploads, payments, shipping integrations, and notifications remain
  unimplemented and return HTTP 501.

Purchase-order statuses must advance exactly one step at a time:
`PO_RECEIVED` → `DEALER_VERIFIED` → `AWAITING_PAYMENT` → `PAID` → `SHIPPED`
→ `RECEIVED` → `COMPLETED`. Each successful transition is recorded in
`status_histories`. Document numbers are allocated under a row lock in
`document_counters` and are protected by a unique period key; for example,
`INV/DMC-PNY/IX/26/01`.

Run backend tests using `npm test`. They use controlled mocks and do not connect
to or mutate a configured database.
