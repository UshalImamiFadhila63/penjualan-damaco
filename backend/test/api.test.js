const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

process.env.JWT_SECRET = 'node-test-only-secret-that-is-never-used-outside-tests';

const createAuthRouter = require('../routes/authRoutes');
const { createCoreRouter } = require('../routes/coreRoutes');
const { errorHandler } = require('../middleware/errorHandler');
const { nextDocumentNumber } = require('../services/documentNumber');
const { transitionPurchaseOrderStatus } = require('../services/purchaseOrderStatus');

const users = {
  11: { id: 11, nama: 'Test Customer', email: 'customer@example.test', role: 'customer', is_active: 1 },
  12: { id: 12, nama: 'Test Admin', email: 'admin@example.test', role: 'super_admin', is_active: 1 },
};

function makeMockPool() {
  const adminPassword = bcrypt.hashSync('Correct-admin-password-123', 4);
  return {
    async query(sql, params = []) { return this.execute(sql, params); },
    async execute(sql, params = []) {
      if (sql.includes('SELECT id, nama, email, role, is_active FROM users WHERE id')) {
        const user = users[params[0]];
        return [user ? [user] : []];
      }
      if (sql.includes('SELECT id, nama, email, password, role, is_active FROM users')) {
        const user = params[0] === 'admin@example.test'
          ? { ...users[12], password: adminPassword }
          : null;
        return [user ? [user] : []];
      }
      if (sql.includes('COUNT(*) AS total FROM products')) return [[{ total: 1 }]];
      if (sql.includes('FROM products WHERE is_active = 1')) {
        return [[{
          id: 4, sku: 'DRN-TEST', name: 'Demo Drone', description: 'Catalog item',
          category: 'Drone', unit: 'unit', sell_price: '100.00', buy_price: '1.00', image_url: null,
        }]];
      }
      return [[]];
    },
  };
}

function makeCommerceMockPool() {
  const request = { id: 71, customerId: 11, status: 'SUBMITTED', items: [] };
  const offer = { id: 81, customerId: 11, status: 'SENT', items: [] };
  const order = { id: 91, items: [] };
  const counters = new Map();
  const pool = {
    async query(sql, params = []) { return this.execute(sql, params); },
    async execute(sql, params = []) {
      if (sql.includes('SELECT id, nama, email, role, is_active FROM users WHERE id')) {
        const user = users[params[0]];
        return [user ? [user] : []];
      }
      if (sql.includes('SELECT company_code FROM company_settings')) return [[{ company_code: 'DMC-PNY' }]];
      if (sql.includes("SELECT id FROM users WHERE id = ? AND role = 'customer'")) {
        return [Number(params[0]) === 11 ? [{ id: 11 }] : []];
      }
      if (sql.includes('UPDATE offers SET status = ?')) {
        if (offer.id === params[1] && offer.customerId === params[2] && offer.status === 'SENT') {
          offer.status = params[0];
          return [{ affectedRows: 1 }];
        }
        return [{ affectedRows: 0 }];
      }
      return [[]];
    },
    async getConnection() {
      let counterType = null;
      return {
        async beginTransaction() {},
        async commit() {},
        async rollback() {},
        release() {},
        async execute(sql, params = []) {
          if (sql.includes('INSERT INTO document_counters')) {
            counterType = params[0];
            if (!counters.has(counterType)) counters.set(counterType, 0);
            return [{ affectedRows: 1 }];
          }
          if (sql.includes('SELECT id, last_number FROM document_counters')) {
            return [[{ id: 1, last_number: counters.get(counterType) || 0 }]];
          }
          if (sql.includes('UPDATE document_counters SET last_number')) {
            counters.set(counterType, params[0]);
            return [{ affectedRows: 1 }];
          }
          if (sql.includes("SELECT id FROM users WHERE id = ? AND role = 'customer'")) {
            return [Number(params[0]) === 11 ? [{ id: 11 }] : []];
          }
          if (sql.includes('SELECT id FROM products WHERE is_active = 1')) {
            return [[...new Set(params)].filter((id) => Number(id) === 4).map((id) => ({ id }))];
          }
          if (sql.includes('INSERT INTO quotation_requests')) {
            Object.assign(request, { request_number: params[0], notes: params[2] });
            return [{ insertId: request.id }];
          }
          if (sql.includes('INSERT INTO quotation_request_items')) {
            request.items.push({ product_id: params[1], quantity: params[2] });
            return [{ affectedRows: 1 }];
          }
          if (sql.includes('SELECT id, customer_id, status FROM quotation_requests')) {
            return [[request.id === params[0] ? {
              id: request.id, customer_id: request.customerId, status: request.status,
            } : undefined].filter(Boolean)];
          }
          if (sql.includes('SELECT product_id, quantity FROM quotation_request_items')) return [request.items];
          if (sql.includes('INSERT INTO offers')) {
            Object.assign(offer, { offer_number: params[0], customerId: params[2] });
            return [{ insertId: offer.id }];
          }
          if (sql.includes('INSERT INTO offer_items')) {
            offer.items.push({ product_id: params[1], quantity: params[3], unit_price: params[4] });
            return [{ affectedRows: 1 }];
          }
          if (sql.includes('SELECT id FROM dealers WHERE id = ?')) {
            return [Number(params[0]) === 3 ? [{ id: 3 }] : []];
          }
          if (sql.includes('SELECT id, customer_id, status FROM offers')) {
            return [[offer.id === params[0] ? {
              id: offer.id, customer_id: offer.customerId, status: offer.status,
            } : undefined].filter(Boolean)];
          }
          if (sql.includes('SELECT id FROM purchase_orders WHERE quotation_id')) return [[]];
          if (sql.includes('SELECT product_id, quantity, unit_price FROM offer_items')) return [offer.items];
          if (sql.includes('INSERT INTO purchase_orders')) {
            Object.assign(order, { po_number: params[0], total_amount: params[4] });
            return [{ insertId: order.id }];
          }
          if (sql.includes('INSERT INTO purchase_order_items')) {
            order.items.push({ product_id: params[1], quantity: params[2], unit_price: params[3] });
            return [{ affectedRows: 1 }];
          }
          return [{ affectedRows: 1 }];
        },
      };
    },
    state: { request, offer, order },
  };
  return pool;
}

async function startApi(pool) {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', createAuthRouter(pool));
  app.use('/api', createCoreRouter(pool));
  app.use(errorHandler);
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  return {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}

let api;
before(async () => { api = await startApi(makeMockPool()); });
after(async () => { if (api) await api.close(); });

function bearer(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '5m' });
}

test('public product catalog excludes buy_price and buyPrice', async () => {
  const response = await fetch(`${api.baseUrl}/api/products`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.data[0].sku, 'DRN-TEST');
  assert.equal(Object.hasOwn(body.data[0], 'buy_price'), false);
  assert.equal(Object.hasOwn(body.data[0], 'buyPrice'), false);
});

test('customer cannot access admin routes; unauthenticated requests cannot access customer routes', async () => {
  const deniedAdmin = await fetch(`${api.baseUrl}/api/admin/dealers`, {
    headers: { Authorization: `Bearer ${bearer(11)}` },
  });
  assert.equal(deniedAdmin.status, 403);

  const deniedCustomer = await fetch(`${api.baseUrl}/api/customer/profile`);
  assert.equal(deniedCustomer.status, 401);
});

test('quotation and offer routes validate submissions instead of returning 501', async () => {
  const customerRequest = await fetch(`${api.baseUrl}/api/customer/quotation-requests`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: ['Bearer', bearer(11)].join(' '),
    },
    body: JSON.stringify({ items: [] }),
  });
  assert.equal(customerRequest.status, 400);

  const adminRequest = await fetch(`${api.baseUrl}/api/admin/offers`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: ['Bearer', bearer(12)].join(' '),
    },
    body: JSON.stringify({}),
  });
  assert.equal(adminRequest.status, 400);

  const purchaseOrders = await fetch(`${api.baseUrl}/api/admin/purchase-orders`, {
    headers: { Authorization: ['Bearer', bearer(12)].join(' ') },
  });
  assert.equal(purchaseOrders.status, 200);
});

test('customer quote request can become an accepted offer and purchase order', async () => {
  const pool = makeCommerceMockPool();
  const commerceApi = await startApi(pool);
  try {
    const customerHeaders = {
      'content-type': 'application/json',
      Authorization: ['Bearer', bearer(11)].join(' '),
    };
    const adminHeaders = {
      'content-type': 'application/json',
      Authorization: ['Bearer', bearer(12)].join(' '),
    };
    const submitted = await fetch(`${commerceApi.baseUrl}/api/customer/quotation-requests`, {
      method: 'POST',
      headers: customerHeaders,
      body: JSON.stringify({ items: [{ product_id: 4, quantity: 2 }], notes: 'Untuk survei' }),
    });
    assert.equal(submitted.status, 201);
    assert.match((await submitted.json()).data.request_number, /^QR\/DMC-PNY\//);

    const createdOffer = await fetch(`${commerceApi.baseUrl}/api/admin/offers`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        quotation_request_id: 71,
        items: [{ product_id: 4, quantity: 2, unit_price: 12500 }],
      }),
    });
    assert.equal(createdOffer.status, 201);

    const accepted = await fetch(`${commerceApi.baseUrl}/api/customer/offers/81/respond`, {
      method: 'POST',
      headers: customerHeaders,
      body: JSON.stringify({ status: 'ACCEPTED' }),
    });
    assert.equal(accepted.status, 200);

    const createdOrder = await fetch(`${commerceApi.baseUrl}/api/admin/purchase-orders`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ quotation_id: 81, dealer_id: 3 }),
    });
    assert.equal(createdOrder.status, 201);
    assert.equal(pool.state.offer.status, 'ACCEPTED');
    assert.equal(pool.state.order.total_amount, '25000.00');
    assert.equal(pool.state.order.items.length, 1);
  } finally {
    await commerceApi.close();
  }
});

test('admin login accepts correct password and rejects incorrect password', async () => {
  const accepted = await fetch(`${api.baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.test', password: 'Correct-admin-password-123' }),
  });
  assert.equal(accepted.status, 200);
  assert.equal((await accepted.json()).data.user.role, 'super_admin');

  const rejected = await fetch(`${api.baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.test', password: 'incorrect-password' }),
  });
  assert.equal(rejected.status, 401);
});

test('purchase-order status service rejects a skipped status', async () => {
  let rolledBack = false;
  const connection = {
    async beginTransaction() {},
    async execute(sql) {
      if (sql.includes('SELECT id, status FROM purchase_orders')) return [[{ id: 20, status: 'PO_RECEIVED' }]];
      throw new Error('Unexpected statement should not run');
    },
    async commit() { throw new Error('Skipped transition must not commit'); },
    async rollback() { rolledBack = true; },
    release() {},
  };
  await assert.rejects(
    transitionPurchaseOrderStatus({ getConnection: async () => connection }, {
      purchaseOrderId: 20,
      toStatus: 'PAID',
      changedBy: 12,
    }),
    /Invalid purchase order status transition/
  );
  assert.equal(rolledBack, true);
});

test('twenty concurrent document numbers are unique', async () => {
  let lastNumber = 0;
  let lockTail = Promise.resolve();
  const pool = {
    async getConnection() {
      let releaseLock;
      let locked;
      return {
        async beginTransaction() {
          const previous = lockTail;
          lockTail = new Promise((resolve) => { releaseLock = resolve; });
          await previous;
          locked = true;
        },
        async execute(sql, params) {
          if (sql.includes('SELECT id, last_number FROM document_counters')) {
            return [[{ id: 1, last_number: lastNumber }]];
          }
          if (sql.includes('UPDATE document_counters SET last_number')) lastNumber = params[0];
          return [{ affectedRows: 1 }];
        },
        async commit() { if (locked) releaseLock(); },
        async rollback() { if (locked) releaseLock(); },
        release() {},
      };
    },
  };
  const date = new Date(2026, 8, 1);
  const numbers = await Promise.all(Array.from({ length: 20 }, () => nextDocumentNumber(pool, {
    documentType: 'INVOICE',
    prefix: 'INV',
    companyCode: 'DMC-PNY',
    date,
  })));
  assert.equal(new Set(numbers).size, 20);
  assert.equal(numbers[0], 'INV/DMC-PNY/IX/26/01');
  assert.equal(lastNumber, 20);
});
